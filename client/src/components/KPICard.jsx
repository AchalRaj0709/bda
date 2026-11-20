import React from 'react';

export default function KPICard({
  title,
  value,
  icon: Icon,
  gradient = 'from-blue-500/20 to-cyan-500/5',
  borderGlow = 'hover:border-cyan-500/40',
  iconColor = 'text-cyan-400',
  iconBg = 'bg-cyan-500/10 border-cyan-500/20',
  badgeText,
  badgeType = 'positive',
  subtitle,
}) {
  const badgeStyles = {
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    neutral: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div
      className={`glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${borderGlow}`}
    >
      {/* Background radial gradient accent */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} blur-2xl pointer-events-none -z-0`} />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-white font-mono">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border ${iconBg} ${iconColor} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 relative z-10 pt-2 border-t border-slate-800/60">
        {subtitle && <span>{subtitle}</span>}
        {badgeText && (
          <span
            className={`px-2 py-0.5 rounded-full border text-[11px] font-medium tracking-wide ${
              badgeStyles[badgeType] || badgeStyles.neutral
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}

