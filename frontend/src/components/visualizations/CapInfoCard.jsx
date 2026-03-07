import ChartCard from './ChartCard'
import { formatDollarFull, formatDollar } from '../../charts/chartTheme'

const THRESHOLDS = [
  { key: 'salary_cap', label: 'Salary Cap', color: '#10b981' },
  { key: 'luxury_tax_line', label: 'Luxury Tax', color: '#f59e0b' },
  { key: 'first_apron', label: 'First Apron', color: '#f97316' },
  { key: 'second_apron', label: 'Second Apron', color: '#ef4444' },
]

const EXCEPTIONS = [
  { key: 'mid_level_exception_non_taxpayer', label: 'Non-Taxpayer MLE' },
  { key: 'mid_level_exception_taxpayer', label: 'Taxpayer MLE' },
  { key: 'bi_annual_exception', label: 'Bi-Annual (BAE)' },
  { key: 'room_exception', label: 'Room Exception' },
  { key: 'minimum_salary', label: 'Minimum Salary' },
]

export default function CapInfoCard({ data }) {
  if (!data) return null

  const maxVal = (data.second_apron || 189_000_000) * 1.08

  return (
    <ChartCard title="NBA Salary Cap" badge={data.season || '2024-25'}>
      {/* Threshold bar */}
      <div className="mb-4">
        <div className="relative h-5 rounded-full overflow-hidden bg-[var(--bg-tertiary)]">
          {THRESHOLDS.map((t, i) => {
            const val = data[t.key] || 0
            const prevVal = i > 0 ? (data[THRESHOLDS[i - 1].key] || 0) : 0
            return (
              <div
                key={t.key}
                className="absolute top-0 h-full"
                style={{
                  left: `${(prevVal / maxVal) * 100}%`,
                  width: `${((val - prevVal) / maxVal) * 100}%`,
                  backgroundColor: t.color,
                  opacity: 0.35,
                }}
              />
            )
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {THRESHOLDS.map((t) => (
            <div key={t.key} className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: t.color, opacity: 0.7 }} />
              <span className="text-[var(--text-muted)]">{t.label}:</span>
              <span className="font-mono text-[var(--text-primary)]">{formatDollarFull(data[t.key])}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Exceptions grid */}
      <div className="border-t border-[var(--border)] pt-3">
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Exceptions</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {EXCEPTIONS.map((e) => (
            <div key={e.key} className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)]">{e.label}</span>
              <span className="font-mono text-[var(--text-primary)]">
                {data[e.key] != null ? formatDollarFull(data[e.key]) : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  )
}
