interface KpiCardProps {
  label: string;
  value: number | string;
  icon: string;
  trend?: { value: number; label: string };
  color: 'red' | 'amber' | 'blue' | 'purple' | 'emerald';
  pulse?: boolean;
}

const colorMap = {
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/5' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-amber-500/5' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/5' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/5' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/5' },
};

export default function KpiCard({ label, value, icon, trend, color, pulse }: KpiCardProps) {
  const c = colorMap[color];
  return (
    <div className={`card p-4 ${c.border} border ${c.glow} shadow-lg`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-2xl ${pulse ? 'pulse-animation' : ''}`}>{icon}</span>
        <span className={`badge ${c.bg} ${c.text}`}>Live</span>
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
      {trend && (
        <p className={`text-[10px] mt-1.5 ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  );
}
