import ChartCard from './ChartCard'
import { formatDollarFull, formatDollar, COLORS } from '../../charts/chartTheme'

function TeamColumn({ teamData, label }) {
  if (!teamData) return null
  const maxHit = Math.max(...(teamData.sending || []).map((p) => p.cap_hit || 0), 1)

  return (
    <div className="flex-1">
      <div className="text-xs font-bold text-[var(--text-primary)] mb-2">{teamData.team || label}</div>
      <div className="text-[10px] text-[var(--text-muted)] mb-2">
        Sending out ({formatDollar(teamData.total_outgoing_salary)})
      </div>
      <div className="space-y-1.5">
        {(teamData.sending || []).map((p, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-[var(--text-secondary)]">{p.player}</span>
              <span className="font-mono text-[var(--text-muted)]">{formatDollar(p.cap_hit)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bg-primary)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${((p.cap_hit || 0) / maxHit) * 100}%`,
                  backgroundColor: COLORS.accent,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TradeAnalysisCard({ data }) {
  if (!data) return null

  const valid = data.trade_valid
  const statusColor = valid ? 'var(--success)' : 'var(--danger)'
  const statusText = valid ? 'VALID TRADE' : 'INVALID TRADE'

  const borderGlow = valid
    ? '0 0 0 1px rgba(16, 185, 129, 0.3), 0 0 12px rgba(16, 185, 129, 0.1)'
    : '0 0 0 1px rgba(239, 68, 68, 0.3), 0 0 12px rgba(239, 68, 68, 0.1)'

  return (
    <div className="chart-enter my-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden" style={{ boxShadow: borderGlow }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Trade Analysis</h3>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ color: statusColor, backgroundColor: `${statusColor}20` }}
        >
          {statusText}
        </span>
      </div>

      {/* Teams side by side */}
      <div className="p-4 flex gap-6">
        <TeamColumn teamData={data.team1} label="Team 1" />
        <div className="w-px bg-[var(--border)] self-stretch" />
        <TeamColumn teamData={data.team2} label="Team 2" />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-tertiary)]">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[var(--text-muted)]">Salary Difference</span>
          <span className="font-mono font-bold text-[var(--text-primary)]">
            {formatDollarFull(data.salary_difference)}
          </span>
        </div>
        {data.team1?.salary_match_check?.rule && (
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            {data.team1.salary_match_check.rule}
          </p>
        )}
      </div>
    </div>
  )
}
