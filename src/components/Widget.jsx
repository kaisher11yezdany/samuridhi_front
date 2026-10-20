const TYPE_COLOR = {
  success: '#059669',
  warning: '#d97706',
  danger:  '#dc2626',
  default: '#1e3a5f',
};

const TYPE_BG = {
  success: '#ecfdf5',
  warning: '#fffbeb',
  danger:  '#fef2f2',
  default: '#eef2ff',
};

export default function Widget({ title, value, subtitle, trend, trendDir, type, icon }) {
  const color = TYPE_COLOR[type] || TYPE_COLOR.default;
  const iconBg = TYPE_BG[type]  || TYPE_BG.default;

  // Compute a rough bar fill %: treat numeric values up to ~50 as a percentage-like fill
  const numVal = parseFloat(value);
  const barPct = !isNaN(numVal) ? Math.min(Math.max(numVal * 2, 5), 100) : 50;

  return (
    <div className="widget">
      {/* Header row: title + optional icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div className="widget-title">{title}</div>
          <div className="widget-value">{value}</div>
          {subtitle && <div className="widget-subtitle">{subtitle}</div>}
        </div>
        {icon && (
          <div style={{
            width: 46, height: 46, borderRadius: '14px',
            background: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', flexShrink: 0, marginLeft: '0.75rem',
          }}>
            {icon}
          </div>
        )}
      </div>

      {/* Mini progress bar */}
      <div className="widget-bar">
        <div className="widget-bar-fill" style={{ width: `${barPct}%`, background: color }} />
      </div>

      {trend && (
        <div className={`widget-trend${trendDir ? ` ${trendDir}` : ''}`}>
          {trend}
        </div>
      )}
    </div>
  );
}
