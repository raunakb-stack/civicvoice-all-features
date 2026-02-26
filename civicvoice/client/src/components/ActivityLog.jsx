import { format } from 'date-fns';

export default function ActivityLog({ logs }) {
  if (!logs?.length) return <p className="text-sm text-stone-400">No activity yet.</p>;

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-stone-200" />
      <ul className="space-y-4">
        {logs.map((log, i) => (
          <li key={i} className="flex gap-4 items-start relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 z-10 border-2 border-white shadow-sm ${
              i === 0 ? 'bg-civic-500 text-white' : 'bg-stone-100 text-stone-500'
            }`}>
              {i === 0 ? '📝' : i === logs.length - 1 && log.message.includes('Resolved') ? '✅' : '🔧'}
            </div>
            <div className="pt-1 min-w-0">
              <p className="text-sm text-stone-800">{log.message}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {format(new Date(log.time), 'MMM d, yyyy · h:mm a')}
                {log.actor && log.actor !== 'System' && (
                  <span className="ml-1 text-civic-600 font-medium">· {log.actor}</span>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
