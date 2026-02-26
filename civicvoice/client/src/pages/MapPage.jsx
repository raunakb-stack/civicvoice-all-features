import { useEffect, useState } from 'react';
import MapView from '../components/MapView';
import api from '../api/axios';

const STATUS_KEYS = ['Pending', 'In Progress', 'Resolved', 'Overdue', 'Escalated'];
const COLORS = { Pending: '#eab308', 'In Progress': '#3b82f6', Resolved: '#22c55e', Overdue: '#ef4444', Escalated: '#a855f7' };

export default function MapPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('All');

  useEffect(() => {
    api.get('/complaints/map').then(({ data }) => setComplaints(data.complaints || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);
  const counts   = STATUS_KEYS.reduce((acc, k) => ({ ...acc, [k]: complaints.filter(c => c.status === k).length }), {});

  return (
    <div className="space-y-4 h-[calc(100vh-160px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Live Complaint Map</h1>
          <p className="text-sm text-stone-400">{complaints.length} complaints with GPS data</p>
        </div>
      </div>

      {/* Status legend + filter */}
      <div className="flex flex-wrap gap-2 shrink-0">
        <button onClick={() => setFilter('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
            filter === 'All' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
          }`}>
          All ({complaints.length})
        </button>
        {STATUS_KEYS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              filter === s ? 'text-white border-transparent' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
            style={filter === s ? { background: COLORS[s], borderColor: COLORS[s] } : {}}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[s] }} />
            {s} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-stone-100">
            <div className="text-stone-400 text-sm">🗺 Loading map…</div>
          </div>
        ) : (
          <MapView complaints={filtered} />
        )}
      </div>

      {/* No GPS data note */}
      {!loading && complaints.length === 0 && (
        <div className="text-center py-8 text-stone-400 text-sm">
          📍 No complaints with GPS coordinates yet. When citizens enable location on submission, they'll appear here.
        </div>
      )}
    </div>
  );
}
