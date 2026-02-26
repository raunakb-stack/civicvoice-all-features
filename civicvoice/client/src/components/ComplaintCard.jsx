import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from './StatusBadge';
import SLATimer from './SLATimer';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ESCALATION_LABELS = { 1: '🔺 Sr. Officer', 2: '🚨 Commissioner' };

const DEPT_ICONS = {
  'Roads & Infrastructure': '🛣',
  'Sanitation & Waste':     '🗑',
  'Street Lighting':        '💡',
  'Water Supply':           '💧',
  'Parks & Gardens':        '🌳',
  'General':                '📋',
};

export default function ComplaintCard({ complaint, onUpdate }) {
  const { user } = useAuth();
  const [votes, setVotes]   = useState(complaint.votes || 0);
  const [voted, setVoted]   = useState(complaint.votedBy?.includes(user?._id));
  const [loading, setLoading] = useState(false);

  const handleVote = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/complaints/${complaint._id}/vote`);
      setVotes(data.votes);
      setVoted(data.voted);
      if (data.voted) toast.success('+5 Civic Points! 🎉');
    } catch {
      toast.error('Failed to vote');
    } finally { setLoading(false); }
  };

  const priorityColor = complaint.priorityScore > 40 ? 'text-red-600' :
    complaint.priorityScore > 20 ? 'text-amber-600' : 'text-stone-400';

  return (
    <Link
      to={`/complaints/${complaint._id}`}
      className={`card block hover:shadow-md transition-all duration-200 overflow-hidden ${
        complaint.status === 'Overdue' ? 'border-red-300 bg-red-50/30' :
        complaint.status === 'Escalated' ? 'border-purple-300' : ''
      }`}
    >
      {/* Emergency banner */}
      {complaint.emergency && (
        <div className="bg-red-500 text-white text-xs font-bold px-4 py-1 flex items-center gap-1">
          🚨 EMERGENCY COMPLAINT
        </div>
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-base">{DEPT_ICONS[complaint.department] || '📋'}</span>
              <span className="text-xs text-stone-400 font-medium">{complaint.department}</span>
              {complaint.escalationLevel > 0 && (
                <span className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-full">
                  {ESCALATION_LABELS[complaint.escalationLevel]}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2">{complaint.title}</h3>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <p className="text-xs text-stone-500 line-clamp-2 mb-3">{complaint.description}</p>

        {/* Location */}
        {/* Image thumbnails */}
        {complaint.images?.length > 0 && (
          <div className="flex gap-1.5 mb-3">
            {complaint.images.slice(0, 3).map((img, i) => (
              <div key={i} className="w-14 h-14 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {complaint.images.length > 3 && (
              <div className="w-14 h-14 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-500 shrink-0">
                +{complaint.images.length - 3}
              </div>
            )}
          </div>
        )}

        {complaint.location?.address && (
          <p className="text-xs text-stone-400 mb-3 flex items-center gap-1">
            📍 {complaint.location.address}
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center gap-3 flex-wrap">
          <SLATimer slaDeadline={complaint.slaDeadline} status={complaint.status} />

          <span className={`text-xs font-mono font-semibold ml-auto ${priorityColor}`}>
            ▲ {complaint.priorityScore} pts
          </span>

          <button
            onClick={handleVote}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
              voted
                ? 'bg-civic-100 border-civic-300 text-civic-700'
                : 'bg-white border-stone-200 text-stone-500 hover:border-civic-300 hover:text-civic-600'
            }`}
          >
            👍 {votes}
          </button>

          <span className="text-xs text-stone-400">
            {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  );
}
