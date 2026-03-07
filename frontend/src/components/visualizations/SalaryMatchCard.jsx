import ChartCard from './ChartCard'
import { formatDollarFull, formatDollar, COLORS } from '../../charts/chartTheme'

export default function SalaryMatchCard({ data }) {
  if (!data) return null

  const valid = data.valid
  const outgoing = data.outgoing || 0
  const incoming = data.incoming || 0
  const maxAllowed = data.max_allowed || data.max_allowed_below_apron || data.max_allowed_above_apron || incoming
  const maxVal = Math.max(outgoing, incoming, maxAllowed) * 1.15

  const statusColor = valid ? 'var(--success)' : 'var(--danger)'

  return (
    <ChartCard
      title="Salary Match Check"
      badge={valid ? 'VALID' : 'INVALID'}
      badgeColor={statusColor}
    >
      <div className="space-y-3">
        {/* Outgoing bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--text-muted)]">Outgoing Salary</span>
            <span className="font-mono text-[var(--text-secondary)]">{formatDollarFull(outgoing)}</span>
          </div>
          <div className="h-4 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(outgoing / maxVal) * 100}%`,
                backgroundColor: '#64748b',
              }}
            />
          </div>
        </div>

        {/* Incoming bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--text-muted)]">Incoming Salary</span>
            <span className="font-mono text-[var(--text-secondary)]">{formatDollarFull(incoming)}</span>
          </div>
          <div className="relative h-4 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(incoming / maxVal) * 100}%`,
                backgroundColor: valid ? COLORS.emerald : COLORS.rose,
              }}
            />
            {/* Max threshold marker */}
            <div
              className="absolute top-0 h-full w-0.5"
              style={{
                left: `${(maxAllowed / maxVal) * 100}%`,
                backgroundColor: '#f59e0b',
              }}
            />
          </div>
        </div>

        {/* Max allowed label */}
        <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
          <span>Max Allowed: {formatDollarFull(maxAllowed)}</span>
          {data.warning && <span className="text-[var(--warning)]">{data.warning}</span>}
        </div>

        {/* Rule */}
        <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">{data.rule}</p>
      </div>
    </ChartCard>
  )
}
