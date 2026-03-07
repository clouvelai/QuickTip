import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import ChartCard from './ChartCard'
import { COLORS, ANIMATION, formatStat, TOOLTIP_STYLE } from '../../charts/chartTheme'

const RADAR_STATS = [
  { key: 'pts', label: 'PTS', max: 35 },
  { key: 'reb', label: 'REB', max: 15 },
  { key: 'ast', label: 'AST', max: 12 },
  { key: 'stl', label: 'STL', max: 3 },
  { key: 'blk', label: 'BLK', max: 3 },
  { key: 'fg_pct', label: 'FG%', max: 1 },
]

const STAT_GRID = [
  ['pts', 'PTS'], ['reb', 'REB'], ['ast', 'AST'],
  ['stl', 'STL'], ['blk', 'BLK'], ['tov', 'TOV'],
  ['fg_pct', 'FG%'], ['fg3_pct', '3P%'], ['ft_pct', 'FT%'],
  ['min', 'MIN'], ['fgm', 'FGM'], ['fga', 'FGA'],
]

export default function PlayerRadarChart({ data }) {
  if (!data?.stats) return null

  const stats = data.stats

  const radarData = RADAR_STATS.map((s) => {
    const raw = Number(stats[s.key] || 0)
    return {
      stat: s.label,
      value: Math.min(100, (raw / s.max) * 100),
      raw,
    }
  })

  return (
    <ChartCard title={`${data.player} Stats`} badge={`${data.season || '2025'} | ${data.team}`}>
      <div className="flex flex-col items-center">
        <div style={{ width: 280, height: 280 }}>
          <ResponsiveContainer>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis
                dataKey="stat"
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
              />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value, name, props) => [formatStat(props.payload.raw), props.payload.stat]}
              />
              <Radar
                dataKey="value"
                stroke={COLORS.accent}
                fill={COLORS.accent}
                fillOpacity={0.2}
                strokeWidth={2}
                dot={{ r: 4, fill: COLORS.accent, strokeWidth: 0 }}
                animationDuration={ANIMATION.duration}
                animationEasing={ANIMATION.easing}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-x-6 gap-y-2 mt-2 w-full max-w-[360px]">
          {STAT_GRID.map(([key, label]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)] font-medium">{label}</span>
              <span className="font-mono text-[var(--text-primary)]">
                {stats[key] != null
                  ? key.includes('pct') ? (Number(stats[key]) * 100).toFixed(1) + '%' : formatStat(stats[key])
                  : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  )
}
