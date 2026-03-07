export default function ChartCard({ title, badge, badgeColor, footer, children }) {
  return (
    <div className="chart-enter my-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
      {(title || badge) && (
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          {title && (
            <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
          )}
          {badge && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: badgeColor || 'var(--accent)',
                backgroundColor: `${badgeColor || 'var(--accent)'}20`,
              }}
            >
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-tertiary)] text-xs text-[var(--text-muted)]">
          {footer}
        </div>
      )}
    </div>
  )
}
