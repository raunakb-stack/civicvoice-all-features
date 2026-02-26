import { ResponsiveContainer, Tooltip, Cell, ScatterChart, Scatter, XAxis, YAxis } from 'recharts';

const DAYS    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS   = ['12a','2a','4a','6a','8a','10a','12p','2p','4p','6p','8p','10p'];

const interpolateColor = (value, max) => {
  if (max === 0) return '#ede8df';
  const ratio = value / max;
  if (ratio < 0.2) return '#fef3c7';
  if (ratio < 0.4) return '#fde68a';
  if (ratio < 0.6) return '#fbbf24';
  if (ratio < 0.8) return '#f59e0b';
  return '#dc2626';
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-bold">{DAYS[d.day]} · {HOURS[d.hour]}</p>
      <p className="text-stone-500">{d.value} complaints</p>
    </div>
  );
};

export default function HeatmapChart({ complaints = [] }) {
  // Build day × hour matrix
  const matrix = Array.from({ length: 7 }, () => Array(12).fill(0));
  complaints.forEach((c) => {
    const d    = new Date(c.createdAt);
    const day  = d.getDay();
    const hour = Math.floor(d.getHours() / 2);
    matrix[day][hour]++;
  });

  const data = [];
  let max = 0;
  matrix.forEach((row, day) =>
    row.forEach((value, hour) => {
      data.push({ day, hour, value });
      if (value > max) max = value;
    })
  );

  return (
    <div>
      {/* Y axis labels */}
      <div className="flex items-start gap-1">
        <div className="flex flex-col gap-1 pt-2 pr-1">
          {DAYS.map(d => (
            <div key={d} className="h-7 flex items-center text-xs text-stone-400 font-medium w-7 justify-end">{d}</div>
          ))}
        </div>
        {/* Grid */}
        <div className="flex-1">
          <div className="flex gap-1 mb-1">
            {HOURS.map(h => (
              <div key={h} className="flex-1 text-center text-xs text-stone-400">{h}</div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {matrix.map((row, day) => (
              <div key={day} className="flex gap-1">
                {row.map((value, hour) => (
                  <div
                    key={hour}
                    className="flex-1 h-7 rounded-sm transition-transform hover:scale-110 cursor-pointer"
                    style={{ background: interpolateColor(value, max) }}
                    title={`${DAYS[day]} ${HOURS[hour]}: ${value} complaints`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs text-stone-400">Less</span>
        {['#fef3c7','#fde68a','#fbbf24','#f59e0b','#dc2626'].map(c => (
          <div key={c} className="w-4 h-4 rounded-sm" style={{ background: c }} />
        ))}
        <span className="text-xs text-stone-400">More</span>
      </div>
    </div>
  );
}
