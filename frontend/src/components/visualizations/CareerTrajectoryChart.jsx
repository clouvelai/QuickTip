import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, CartesianGrid } from 'recharts'
import ChartCard from './ChartCard'
import { COLORS, TICK_STYLE, TOOLTIP_STYLE, GRID_COLOR, ANIMATION, formatStat } from '../../charts/chartTheme'

const STAT_OPTIONS = [
  { key: 'pts', label: 'PTS', color: COLORS.accent },
  { key: 'reb', label: 'REB', color: COLORS.emerald },
  { key: 'ast', label: 'AST', color: COLORS.purple },
  { key: 'fg_pct', label: 'FG%', color: COLORS.amber },
  { key: 'min', label: 'MIN', color: COLORS.cyan },
]

export default function CareerTrajectoryChart({ data }) {
  const [activeStat, setActiveStat] = useState('pts')

  if (!data?.seasons?.length) return null

  const chartData = [...data.seasons]
    .reverse()
    .map((s) => ({
      season: `'${String(s.season).slice(2)}`,
      seasonFull: `${s.season - 1}-${String(s.season).slice(2)}`,
      ...STAT_OPTIONS.reduce((acc, opt) => {
        const val = s.stats?.[opt.key]
        acc[opt.key] = val != null ? Number(val) : null
        return acc
      }, {}),
    }))

  const activeOption = STAT_OPTIONS.find((o) => o.key === activeStat)

  return (
    <ChartCard title={`${data.player} Career`} badge={data.team}>
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {STAT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setActiveStat(opt.key)}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: activeStat === opt.key ? opt.color : 'var(--bg-tertiary)',
              color: activeStat === opt.key ? '#fff' : 'var(--text-muted)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="season" tick={TICK_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
            <YAxis
              tick={TICK_STYLE}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(v) =>
                activeStat === 'fg_pct' ? (v * 100).toFixed(0) + '%' : v
              }
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.seasonFull || label}
              formatter={(value) => [
                activeStat === 'fg_pct'
                  ? (value * 100).toFixed(1) + '%'
                  : formatStat(value),
                activeOption.label,
              ]}
            />
            <defs>
              <linearGradient id={`grad-${activeStat}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeOption.color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={activeOption.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={activeStat}
              stroke="none"
              fill={`url(#grad-${activeStat})`}
              animationDuration={ANIMATION.duration}
            />
            <Line
              type="monotone"
              dataKey={activeStat}
              stroke={activeOption.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: activeOption.color, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: activeOption.color, stroke: '#0a0f1a', strokeWidth: 2 }}
              animationDuration={ANIMATION.duration}
              animationEasing={ANIMATION.easing}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
