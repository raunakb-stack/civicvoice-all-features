import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ComplaintCard from '../components/ComplaintCard';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const DEPARTMENTS = ['All', 'Roads & Infrastructure', 'Sanitation & Waste', 'Street Lighting', 'Water Supply', 'Parks & Gardens'];
const STATUSES    = ['All', 'Pending', 'In Progress', 'Resolved', 'Overdue', 'Escalated'];

export default function ComplaintFeed() {
  const { user }  = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [filters, setFilters]       = useState({ department: 'All', status: 'All', emergency: '' });
  const [search, setSearch]         = useState('');

  const fetchComplaints = async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 12 });
    if (filters.department !== 'All') params.set('department', filters.department);
    if (filters.status !== 'All')     params.set('status', filters.status);
    if (filters.emergency)            params.set('emergency', 'true');
    try {
      const { data } = await api.get(`/complaints?${params}`);
      setComplaints(data.complaints || []);
      setTotal(data.total || 0);
      setPage(p);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchComplaints(1); }, [filters]);

  const filtered = search
    ? complaints.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()))
    : complaints;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Complaints Feed</h1>
          <p className="text-sm text-stone-400">{total} total issues — sorted by priority</p>
        </div>
        {(user?.role === 'citizen' || user?.role === 'admin') && (
          <Link to="/complaints/new" className="btn-primary flex items-center gap-2">
            ✏️ Report Issue
          </Link>
        )}
      </div>

      {/* Search + Filters */}
      <div className="card p-4 space-y-3">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          className="input" placeholder="🔍 Search complaints by title or description…"
        />
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Department</label>
            <select value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}
              className="input text-xs py-1.5 w-auto">
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Status</label>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}
              className="input text-xs py-1.5 w-auto">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!filters.emergency}
                onChange={e => setFilters({...filters, emergency: e.target.checked ? 'true' : ''})}
                className="w-4 h-4 accent-red-500" />
              <span className="text-sm font-medium text-stone-600">🚨 Emergency only</span>
            </label>
          </div>
          <button onClick={() => setFilters({ department: 'All', status: 'All', emergency: '' })}
            className="ml-auto text-xs text-stone-400 hover:text-stone-700 self-end pb-1">
            Clear filters
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-40">
              <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-stone-100 rounded w-full mb-1" />
              <div className="h-3 bg-stone-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => <ComplaintCard key={c._id} complaint={c} onUpdate={fetchComplaints} />)}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-stone-500 font-medium">No complaints match your filters.</p>
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center gap-2 pt-2">
          {[...Array(Math.ceil(total / 12))].map((_, i) => (
            <button key={i} onClick={() => fetchComplaints(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold border transition ${
                page === i + 1 ? 'bg-civic-500 text-white border-civic-500' : 'bg-white border-stone-200 text-stone-600 hover:border-civic-400'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
