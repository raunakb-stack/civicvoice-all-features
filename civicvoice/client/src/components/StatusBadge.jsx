const STATUS_CONFIG = {
  'Pending':     { cls: 'badge-pending',    icon: '⏳' },
  'In Progress': { cls: 'badge-inprogress', icon: '🔧' },
  'Resolved':    { cls: 'badge-resolved',   icon: '✅' },
  'Overdue':     { cls: 'badge-overdue',    icon: '🚨' },
  'Escalated':   { cls: 'badge-escalated',  icon: '⚡' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.icon} {status}
    </span>
  );
}
