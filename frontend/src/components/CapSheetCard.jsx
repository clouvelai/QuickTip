export default function CapSheetCard({ data }) {
  if (!data || !data.players) return null

  const { team, players, salary_cap, total_salary, cap_space } = data

  let capStatus
  if (cap_space > 0) {
    capStatus = 'under'
  } else if (total_salary > salary_cap * 1.1) {
    capStatus = 'tax'
  } else {
    capStatus = 'over'
  }

  const statusColors = {
    under: 'var(--success)',
    over: 'var(--danger)',
    tax: 'var(--warning)',
  }
  const statusColor = statusColors[capStatus]

  const fmt = (n) => {
    if (n == null) return '-'
    return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  return (
    <div className="my-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          {team || 'Team'} Cap Sheet
        </h3>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color: statusColor, backgroundColor: `${statusColor}20` }}
        >
          {{ under: 'Under Cap', tax: 'In Tax', over: 'Over Cap' }[capStatus]}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
              <th className="text-left px-4 py-2 font-medium">Player</th>
              <th className="text-left px-4 py-2 font-medium">Pos</th>
              <th className="text-right px-4 py-2 font-medium">Base Salary</th>
              <th className="text-right px-4 py-2 font-medium">Cap Hit</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {players.map((p, i) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-tertiary)] transition-colors">
                <td className="px-4 py-2 text-[var(--text-primary)] font-sans font-medium">{p.name}</td>
                <td className="px-4 py-2 text-[var(--text-muted)]">{p.position || '-'}</td>
                <td className="text-right px-4 py-2 text-[var(--text-secondary)]">{fmt(p.base_salary)}</td>
                <td className="text-right px-4 py-2 text-[var(--text-primary)]">{fmt(p.cap_hit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-tertiary)] flex justify-between text-xs">
        <div>
          <span className="text-[var(--text-muted)]">Total: </span>
          <span className="font-mono font-bold text-[var(--text-primary)]">{fmt(total_salary)}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">Cap: </span>
          <span className="font-mono text-[var(--text-secondary)]">{fmt(salary_cap)}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">Space: </span>
          <span className="font-mono font-bold" style={{ color: statusColor }}>{fmt(cap_space)}</span>
        </div>
      </div>
    </div>
  )
}
