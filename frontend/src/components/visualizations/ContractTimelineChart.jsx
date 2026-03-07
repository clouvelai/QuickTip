import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import ChartCard from './ChartCard'
import { COLORS, TICK_STYLE, TOOLTIP_STYLE, GRID_COLOR, ANIMATION, formatDollar, formatDollarFull } from '../../charts/chartTheme'

export default function ContractTimelineChart({ data }) {
  if (!data?.contracts?.length) return null

  const chartData = [...data.contracts]
    .sort((a, b) => a.season - b.season)
    .map((c) => ({
      season: `${c.season - 1}-${String(c.season).slice(2)}`,
      seasonYear: c.season,
      cap_hit: c.cap_hit || 0,
      base_salary: c.base_salary || 0,
    }))

  const totalValue = chartData.reduce((sum, c) => sum + c.cap_hit, 0)
  const avgAnnual = totalValue / chartData.length

  const footer = (
    <div className="flex justify-between">
      <span>
        <span className="text-[var(--text-muted)]">Total: </span>
        <span className="font-mono font-bold text-[var(--text-primary)]">{formatDollarFull(totalValue)}</span>
      </span>
      <span>
        <span className="text-[var(--text-muted)]">AAV: </span>
        <span className="font-mono text-[var(--text-secondary)]">{formatDollarFull(avgAnnual)}</span>
      </span>
    </div>
  )

  return (
    <ChartCard
      title={`${data.player} Contract`}
      badge={data.team}
      badgeColor={COLORS.accent}
      footer={footer}
    >
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis dataKey="season" tick={TICK_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
            <YAxis
              tick={TICK_STYLE}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatDollar}
              width={60}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value, name) => [
                formatDollarFull(value),
                name === 'cap_hit' ? 'Cap Hit' : 'Base Salary',
              ]}
              cursor={{ fill: GRID_COLOR }}
            />
            <Bar
              dataKey="base_salary"
              radius={[0, 0, 0, 0]}
              animationDuration={ANIMATION.duration}
              animationEasing={ANIMATION.easing}
              fill={COLORS.accentDark}
              opacity={0.5}
            />
            <Bar
              dataKey="cap_hit"
              radius={[4, 4, 0, 0]}
              animationDuration={ANIMATION.duration}
              animationEasing={ANIMATION.easing}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.seasonYear === 2025 ? COLORS.accent : COLORS.accentDark}
                  opacity={entry.seasonYear === 2025 ? 1 : 0.75}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
