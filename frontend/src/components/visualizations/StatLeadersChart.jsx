import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import ChartCard from './ChartCard'
import { COLORS, TICK_STYLE, TOOLTIP_STYLE, GRID_COLOR, ANIMATION, formatStat } from '../../charts/chartTheme'

const RANK_COLORS = ['#eab308', '#94a3b8', '#cd7f32']

export default function StatLeadersChart({ data }) {
  if (!data?.leaders?.length) return null

  const chartData = data.leaders.map((l) => ({
    name: `${l.player}`,
    team: l.team,
    value: Number(l.value),
    rank: l.rank,
  }))

  const maxVal = Math.max(...chartData.map((d) => d.value))
  const statLabel = data.stat?.toUpperCase() || 'STAT'

  return (
    <ChartCard title={`${statLabel} Leaders`} badge={`${data.season || '2025'}`}>
      <div style={{ width: '100%', height: chartData.length * 36 + 20 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, maxVal * 1.15]} />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={(props) => {
                const { x, y, payload } = props
                const entry = chartData.find((d) => d.name === payload.value)
                const rank = entry?.rank || 0
                const isTop3 = rank <= 3
                return (
                  <g transform={`translate(${x},${y})`}>
                    {isTop3 && (
                      <circle cx={-140} cy={0} r={10} fill={RANK_COLORS[rank - 1]} opacity={0.9} />
                    )}
                    <text
                      x={isTop3 ? -140 : -140}
                      y={0}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={isTop3 ? 10 : 10}
                      fontWeight={isTop3 ? 700 : 400}
                      fill={isTop3 ? '#0a0f1a' : '#64748b'}
                    >
                      {rank}
                    </text>
                    <text
                      x={-125}
                      y={0}
                      textAnchor="start"
                      dominantBaseline="central"
                      {...TICK_STYLE}
                      fill={isTop3 ? '#f1f5f9' : '#94a3b8'}
                      fontWeight={isTop3 ? 600 : 400}
                    >
                      {payload.value.length > 18 ? payload.value.slice(0, 16) + '...' : payload.value}
                    </text>
                  </g>
                )
              }}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value) => [formatStat(value), statLabel]}
              cursor={{ fill: GRID_COLOR }}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              animationDuration={ANIMATION.duration}
              animationEasing={ANIMATION.easing}
              label={{
                position: 'right',
                fontSize: 11,
                fontWeight: 600,
                fill: '#f1f5f9',
                formatter: (v) => formatStat(v),
              }}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={COLORS.accent}
                  opacity={i === 0 ? 1 : Math.max(0.35, 1 - i * 0.07)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
