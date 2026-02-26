import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SEVERITY_LABELS = ['', 'Very Low', 'Low', 'Low-Med', 'Medium', 'Medium', 'Med-High', 'High', 'Very High', 'Critical', 'Critical'];

export default function AICategorizBtn({ title, description, onResult }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!title && !description) {
      toast.error('Please enter a title or description first');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('🤖 AI analyzing your complaint…');
    try {
      const { data } = await api.post('/ai/categorize', { title, description });
      onResult(data);
      toast.success(
        `✅ Detected: ${data.department} · Severity ${data.severity}/10`,
        { id: toastId, duration: 4000 }
      );
    } catch {
      toast.error('AI analysis failed — using defaults', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all duration-150 disabled:opacity-60 shadow-sm"
    >
      <span className={loading ? 'animate-spin' : ''}>{loading ? '⏳' : '🤖'}</span>
      {loading ? 'AI Analyzing…' : 'AI Auto-Fill'}
    </button>
  );
}
