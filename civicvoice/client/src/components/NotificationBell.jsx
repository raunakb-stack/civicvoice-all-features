import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../contexts/SocketContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function NotificationBell() {
  const { socket }  = useSocket();
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef();

  // Fetch on mount
  useEffect(() => {
    fetchNotifs();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;
    const handler = (notif) => {
      setNotifs((n) => [notif, ...n]);
      setUnread((u) => u + 1);
      toast(notif.message, { icon: notif.icon || '🔔', duration: 4000 });
    };
    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, [socket]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifs(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {}
    setLoading(false);
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
    setUnread(0);
  };

  const markOneRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifs((n) => n.map((x) => x._id === id ? { ...x, read: true } : x));
    setUnread((u) => Math.max(0, u - 1));
  };

  const ICON_MAP = {
    status_update: '🔧', resolution: '✅', escalation: '⚡',
    sla_warning: '⏰', new_complaint: '📋', rating_request: '⭐',
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition text-stone-600 dark:text-stone-300"
      >
        🔔
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-semibold text-sm text-stone-900 dark:text-white">
              Notifications {unread > 0 && <span className="ml-1 text-xs text-red-500 font-bold">({unread} new)</span>}
            </h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-civic-600 hover:underline font-medium">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-stone-400 text-sm">Loading…</div>
            ) : notifs.length === 0 ? (
              <div className="py-10 text-center">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm text-stone-400">No notifications yet</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n._id}
                  onClick={() => { if (!n.read) markOneRead(n._id); setOpen(false); }}
                  className={`flex gap-3 px-4 py-3 border-b border-stone-100 dark:border-stone-800 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition ${
                    !n.read ? 'bg-civic-50 dark:bg-civic-900/20' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-lg shrink-0">
                    {ICON_MAP[n.type] || n.icon || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 dark:text-white leading-tight">{n.title}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-stone-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 bg-civic-500 rounded-full mt-1.5 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
