import { useState, useEffect } from 'react';
import { formatDistanceToNow, isPast } from 'date-fns';

export default function SLATimer({ slaDeadline, status }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const t = setInterval(() => forceUpdate(n => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  if (status === 'Resolved') {
    return <span className="text-xs text-green-600 font-medium">✅ Resolved within SLA</span>;
  }

  const deadline = new Date(slaDeadline);
  const expired  = isPast(deadline);
  const distance = formatDistanceToNow(deadline, { addSuffix: true });

  return (
    <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
      expired ? 'bg-red-100 text-red-700' : 'bg-amber-50 text-amber-700'
    }`}>
      {expired ? `⏰ Expired ${distance}` : `⏱ Due ${distance}`}
    </span>
  );
}
