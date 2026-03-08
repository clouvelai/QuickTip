import ChartCard from './ChartCard'
import { formatDollarFull, formatDollar } from '../../charts/chartTheme'

const CAP = 140_588_000
const TAX = 170_814_000
const APRON1 = 178_132_000
const APRON2 = 188_931_000

export default function BdlCapCard({ data }) {
  if (!data) return null

  const total = data.total_cap_commitments || 0

  let capStatus = 'Under Cap'
  let statusColor = 'var(--success)'
  if (total > APRON2) { capStatus = 'Above 2nd Apron'; statusColor = 'var(--danger)' }
  else if (total > APRON1) { capStatus = 'Above 1st Apron'; statusColor = 'var(--danger)' }
  else if (total > TAX) { capStatus = 'In Luxury Tax'; statusColor = 'var(--warning)' }
  else if (total > CAP) { capStatus = 'Over Cap'; statusColor = 'var(--warning)' }

  const gaugeMax = Math.max(total, APRON2) * 1.05
  const segments = [
    { start: 0, end: CAP, color: '#10b981', label: 'Cap' },
    { start: CAP, end: TAX, color: '#f59e0b', label: 'Tax' },
    { start: TAX, end: APRON1, color: '#f97316', label: 'Apron 1' },
    { start: APRON1, end: APRON2, color: '#ef4444', label: 'Apron 2' },
  ]

  const rows = [
    { label: 'Total Cap Commitments', value: data.total_cap_commitments },
    { label: 'Active Salary', value: data.active_salary_total },
    { label: 'Dead Money', value: data.dead_money },
    { label: 'Cap Holds', value: data.cap_holds_total },
    { label: 'Cap Space', value: data.cap_space, highlight: true },
    { label: '1st Apron Room', value: data.first_apron_space },
    { label: '2nd Apron Room', value: data.second_apron_space },
  ]

  return (
    <ChartCard
      title={`${data.team_name || data.team} Cap Info`}
      badge={capStatus}
      badgeColor={statusColor}
    >
      {/* Cap gauge bar */}
      <div className="mb-4">
        <div className="relative h-4 rounded-full overflow-hidden bg-[var(--bg-tertiary)]">
          {segments.map((seg, i) => (
            <div
              key={i}
              className="absolute top-0 h-full"
              style={{
                left: `${(seg.start / gaugeMax) * 100}%`,
                width: `${((seg.end - seg.start) / gaugeMax) * 100}%`,
                backgroundColor: seg.color,
                opacity: 0.3,
              }}
            />
          ))}
          <div
            className="absolute top-0 h-full w-0.5 bg-white"
            style={{ left: `${Math.min((total / gaugeMax) * 100, 100)}%` }}
          />
        </div>
        <div className="flex gap-3 mt-1.5 text-[10px] text-[var(--text-muted)] flex-wrap">
          {segments.map((seg) => (
            <span key={seg.label} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: seg.color, opacity: 0.6 }} />
              {seg.label}: {formatDollar(seg.end)}
            </span>
          ))}
        </div>
      </div>

      {/* Data rows */}
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between text-xs">
            <span className="text-[var(--text-muted)]">{row.label}</span>
            <span
              className={`font-mono ${row.highlight ? 'font-bold text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}
            >
              {row.value != null ? formatDollarFull(row.value) : '-'}
            </span>
          </div>
        ))}
      </div>

      {/* Cap holds */}
      {data.cap_holds && data.cap_holds.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Cap Holds</p>
          <div className="space-y-1">
            {data.cap_holds.map((hold, i) => (
              <div key={i} className="flex justify-between text-[11px]">
                <span className="text-[var(--text-muted)]">
                  {hold.player_name || hold.description}
                </span>
                <span className="font-mono text-[var(--text-secondary)]">
                  {formatDollar(hold.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  )
}
