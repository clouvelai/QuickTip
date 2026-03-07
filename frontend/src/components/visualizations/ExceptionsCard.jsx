import ChartCard from './ChartCard'
import { formatDollarFull, formatDollar } from '../../charts/chartTheme'

const STATUS_BADGES = [
  { key: 'over_cap', falseLabel: 'Under Cap', trueLabel: 'Over Cap', falseColor: '#10b981', trueColor: '#f59e0b' },
  { key: 'in_luxury_tax', falseLabel: 'Below Tax', trueLabel: 'In Tax', falseColor: '#10b981', trueColor: '#f97316' },
  { key: 'above_first_apron', falseLabel: 'Below Apron', trueLabel: 'Above Apron', falseColor: '#10b981', trueColor: '#ef4444' },
]

export default function ExceptionsCard({ data }) {
  if (!data) return null

  const maxVal = (data.second_apron || 189_000_000) * 1.05
  const teamSalary = data.team_total_salary || 0

  return (
    <ChartCard title="Available Exceptions">
      {/* Status badges */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {STATUS_BADGES.map((b) => {
          const active = data[b.key]
          const color = active ? b.trueColor : b.falseColor
          return (
            <span
              key={b.key}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color, backgroundColor: `${color}20` }}
            >
              {active ? b.trueLabel : b.falseLabel}
            </span>
          )
        })}
      </div>

      {/* Mini gauge */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1">
          <span>Team Salary: {formatDollar(teamSalary)}</span>
          <span>Cap: {formatDollar(data.salary_cap)}</span>
        </div>
        <div className="relative h-2.5 rounded-full overflow-hidden bg-[var(--bg-tertiary)]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min((teamSalary / maxVal) * 100, 100)}%`,
              backgroundColor: data.above_first_apron ? '#ef4444' : data.in_luxury_tax ? '#f97316' : data.over_cap ? '#f59e0b' : '#10b981',
            }}
          />
          {/* Cap line marker */}
          <div
            className="absolute top-0 h-full w-px bg-white opacity-50"
            style={{ left: `${(data.salary_cap / maxVal) * 100}%` }}
          />
        </div>
      </div>

      {/* Exception cards */}
      <div className="space-y-2">
        {(data.available_exceptions || []).map((exc, i) => {
          const available = exc.value > 0
          return (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg px-3 py-2 border"
              style={{
                borderColor: available ? 'var(--border)' : 'transparent',
                backgroundColor: available ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                opacity: available ? 1 : 0.5,
              }}
            >
              <div>
                <div className="text-xs font-medium text-[var(--text-primary)]">{exc.name}</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{exc.note}</div>
              </div>
              <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                {formatDollarFull(exc.value)}
              </span>
            </div>
          )
        })}
      </div>
    </ChartCard>
  )
}
