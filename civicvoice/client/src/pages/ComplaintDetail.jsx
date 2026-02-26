import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import SLATimer from '../components/SLATimer';
import ActivityLog from '../components/ActivityLog';
import StarRating from '../components/StarRating';
import ImageGallery from '../components/ImageGallery';
import toast from 'react-hot-toast';

const DEPT_STATUSES = ['Pending', 'In Progress', 'Resolved'];

export default function ComplaintDetail() {
  const { id }          = useParams();
  const { user }        = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [statusNote, setStatusNote]   = useState('');
  const [newStatus, setNewStatus]     = useState('');
  const [updating, setUpdating]       = useState(false);
  const [rating, setRating]           = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  const fetch = async () => {
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data.complaint);
      setNewStatus(data.complaint.status);
    } catch { toast.error('Complaint not found'); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [id]);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await api.put(`/complaints/${id}/status`, { status: newStatus, note: statusNote });
      toast.success('Status updated!');
      setStatusNote('');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    setUpdating(false);
  };

  const handleRate = async () => {
    if (!rating) { toast.error('Please select a star rating'); return; }
    setRatingLoading(true);
    try {
      await api.post(`/complaints/${id}/rate`, { rating });
      toast.success('Thank you for rating! ⭐');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to rate'); }
    setRatingLoading(false);
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-stone-200 rounded w-2/3" />
      <div className="card p-6 h-40" />
    </div>
  );

  if (!complaint) return <div className="text-center py-20 text-stone-400">Complaint not found</div>;

  const isOwner  = complaint.citizen?._id === user?._id || complaint.citizen === user?._id;
  const isDeptUser = user?.role === 'department' || user?.role === 'admin';

  const escalationLabels = { 1: '🔺 Escalated to Senior Officer', 2: '🚨 Escalated to Commissioner' };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="card p-6">
        {complaint.emergency && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-4 py-2 rounded-lg mb-4 flex items-center gap-2">
            🚨 EMERGENCY COMPLAINT
          </div>
        )}
        {complaint.escalationLevel > 0 && (
          <div className="bg-purple-50 border border-purple-200 text-purple-700 text-sm font-bold px-4 py-2 rounded-lg mb-4 flex items-center gap-2">
            ⚡ {escalationLabels[complaint.escalationLevel]}
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-xl font-bold text-stone-900 leading-snug flex-1">{complaint.title}</h1>
          <StatusBadge status={complaint.status} />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mb-4">
          <span>🏢 {complaint.department}</span>
          <span>·</span>
          <span>📝 #{complaint._id.slice(-6).toUpperCase()}</span>
          <span>·</span>
          <span>👤 {complaint.citizen?.name}</span>
          <span>·</span>
          <span>📅 {format(new Date(complaint.createdAt), 'MMM d, yyyy · h:mm a')}</span>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed mb-4">{complaint.description}</p>

        {/* Photo Gallery */}
        {complaint.images?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">📷 Photo Evidence</p>
            <ImageGallery images={complaint.images} />
          </div>
        )}

        {complaint.location?.address && (
          <p className="text-sm text-stone-400 mb-4">📍 {complaint.location.address}</p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <SLATimer slaDeadline={complaint.slaDeadline} status={complaint.status} />
          <span className="text-xs font-mono font-semibold text-civic-600 bg-civic-50 px-2 py-0.5 rounded-full">
            ▲ Priority: {complaint.priorityScore}
          </span>
          <span className="text-xs text-stone-400">👍 {complaint.votes} votes</span>
          {complaint.satisfactionRating && (
            <span className="text-xs text-amber-600 font-semibold">⭐ Rated {complaint.satisfactionRating}/5</span>
          )}
          {complaint.resolvedAt && (
            <span className="text-xs text-green-600 font-semibold">
              ✅ Resolved in {complaint.resolutionTime?.toFixed(1)}h
            </span>
          )}
          {complaint.tags?.map(t => (
            <span key={t} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">#{t}</span>
          ))}
        </div>
      </div>

      {/* Department Actions */}
      {isDeptUser && (
        <div className="card p-5">
          <h3 className="font-semibold text-stone-800 mb-4">🏛 Department Actions</h3>
          <div className="flex flex-wrap gap-3 mb-3">
            {DEPT_STATUSES.map(s => (
              <button key={s} onClick={() => setNewStatus(s)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                  newStatus === s ? 'bg-civic-500 text-white border-civic-500' : 'bg-white border-stone-200 text-stone-600 hover:border-civic-400'
                }`}>
                {s}
              </button>
            ))}
          </div>
          <input value={statusNote} onChange={e => setStatusNote(e.target.value)}
            className="input mb-3" placeholder="Optional update note (e.g. Team dispatched, work starts tomorrow)" />
          <button onClick={handleStatusUpdate} disabled={updating || newStatus === complaint.status}
            className="btn-primary">
            {updating ? '⏳ Updating…' : '✅ Update Status'}
          </button>
        </div>
      )}

      {/* Citizen Rating */}
      {isOwner && complaint.status === 'Resolved' && !complaint.satisfactionRating && (
        <div className="card p-5 border-amber-200 bg-amber-50/50">
          <h3 className="font-semibold text-stone-800 mb-3">⭐ Rate the Resolution</h3>
          <p className="text-sm text-stone-500 mb-4">How satisfied are you with how this was resolved?</p>
          <StarRating value={rating} onChange={setRating} size="lg" />
          <button onClick={handleRate} disabled={ratingLoading || !rating} className="btn-primary mt-4">
            {ratingLoading ? '⏳ Submitting…' : '📊 Submit Rating'}
          </button>
        </div>
      )}

      {/* Activity Log */}
      <div className="card p-5">
        <h3 className="font-semibold text-stone-800 mb-5">📋 Activity Timeline</h3>
        <ActivityLog logs={complaint.activityLog || []} />
      </div>
    </div>
  );
}
