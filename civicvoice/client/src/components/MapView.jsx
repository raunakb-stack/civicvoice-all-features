import { useEffect, useRef } from 'react';

const STATUS_COLORS = {
  Pending:      '#eab308',
  'In Progress':'#3b82f6',
  Resolved:     '#22c55e',
  Overdue:      '#ef4444',
  Escalated:    '#a855f7',
};

export default function MapView({ complaints = [], center = [20.9374, 77.7796], zoom = 13 }) {
  const mapRef     = useRef(null);
  const mapInstance = useRef(null);
  const markersRef  = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      if (mapInstance.current) return;
      mapInstance.current = L.map(mapRef.current).setView(center, zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstance.current);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    import('leaflet').then((L) => {
      // Clear old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      complaints.forEach((c) => {
        if (!c.location?.lat || !c.location?.lng) return;
        const color = STATUS_COLORS[c.status] || '#e8820c';
        const icon = L.divIcon({
          html: `<div style="
            width:28px;height:28px;border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);background:${color};
            border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;">
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          className: '',
        });

        const marker = L.marker([c.location.lat, c.location.lng], { icon })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="font-family:DM Sans,sans-serif;padding:12px;min-width:200px">
              <div style="font-size:11px;color:#888;margin-bottom:4px">${c.department}</div>
              <div style="font-weight:700;font-size:14px;margin-bottom:6px">${c.title}</div>
              <span style="
                background:${color}20;color:${color};
                border:1px solid ${color}40;
                font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;">
                ${c.status}
              </span>
              ${c.emergency ? '<div style="color:#ef4444;font-size:11px;font-weight:700;margin-top:6px">🚨 EMERGENCY</div>' : ''}
              <div style="margin-top:8px">
                <a href="/complaints/${c._id}" style="color:#e8820c;font-size:12px;font-weight:600;">View Details →</a>
              </div>
            </div>
          `);
        markersRef.current.push(marker);
      });
    });
  }, [complaints]);

  return (
    <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden' }} />
  );
}
