import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.get('/stats/city').then(({ data }) => setStats(data)).catch(() => {});
    api.get('/complaints?limit=100').then(({ data }) => setComplaints(data.complaints || [])).catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    setDeleting(id);
    try {
      await api.delete(`/complaints/${id}`);
      setComplaints(cs => cs.filter(c => c._id !== id));
      toast.success('Complaint deleted');
    } catch { toast.error('Delete failed'); }
    setDeleting(null);
  };

  const deptData = (stats?.deptBreakdown || []).map(d => ({
    name: d._id?.split(' ')[0] || d._id,
    total: d.total, resolved: d.resolved,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
        <h1 className="font-display text-3xl tracking-wider mb-1">⚙️ Admin Control Panel</h1>
        <p className="text-purple-200 text-sm">Full system overview — all cities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',      val: stats?.total,          icon: '📋', col: 'border-stone-300' },
          { label: 'Today',      val: stats?.todayTotal,     icon: '📅', col: 'border-amber-400' },
          { label: 'Overdue',    val: stats?.overdue,        icon: '🚨', col: 'border-red-400' },
          { label: 'Users',      val: stats?.activeUsers,    icon: '👥', col: 'border-blue-400' },
        ].map(s => (
          <div key={s.label} className={`card p-4 border-l-4 ${s.col} flex items-center gap-4`}>
            <span className="text-2xl">{s.icon}</span>
            <div><p className="text-2xl font-bold">{s.val ?? '—'}</p><p className="text-xs text-stone-400">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Dept breakdown chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-stone-700 mb-4">Department Breakdown</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={deptData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="total"    name="Total"    fill="#e8820c" radius={[4,4,0,0]} />
            <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Complaint table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-semibold text-stone-800">All Complaints</h3>
          <span className="text-xs text-stone-400">{complaints.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                {['ID', 'Title', 'Dept', 'Status', 'Priority', 'Citizen', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c._id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-stone-400">#{c._id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 max-w-xs truncate font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-xs text-stone-500">{c.department}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      c.status === 'Resolved' ? 'badge-resolved' :
                      c.status === 'Overdue'  ? 'badge-overdue' :
                      c.status === 'In Progress' ? 'badge-inprogress' : 'badge-pending'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-civic-600 font-semibold">{c.priorityScore}</td>
                  <td className="px-4 py-3 text-xs text-stone-500">{c.citizen?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(c._id)} disabled={deleting === c._id}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold transition">
                      {deleting === c._id ? '⏳' : '🗑 Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {complaints.length === 0 && (
            <div className="text-center py-12 text-stone-400">No complaints found</div>
          )}
        </div>
      </div>
    </div>
  );
}
