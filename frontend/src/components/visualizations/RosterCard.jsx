import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import ChartCard from './ChartCard'
import { POSITION_COLORS, ANIMATION } from '../../charts/chartTheme'

function getPositionGroup(pos) {
  if (!pos) return 'G'
  if (pos.includes('C')) return 'C'
  if (pos.includes('F')) return 'F'
  return 'G'
}

export default function RosterCard({ data }) {
  if (!data?.roster?.length) return null

  // Position distribution for donut
  const posCount = {}
  data.roster.forEach((p) => {
    const group = getPositionGroup(p.position)
    posCount[group] = (posCount[group] || 0) + 1
  })
  const pieData = Object.entries(posCount).map(([pos, count]) => ({
    name: pos,
    value: count,
    color: POSITION_COLORS[pos] || '#64748b',
  }))

  return (
    <ChartCard title={data.team} badge={`${data.player_count} players`}>
      <div className="flex gap-3">
        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="text-left px-2 py-1.5 font-medium">Player</th>
                <th className="text-left px-2 py-1.5 font-medium">Pos</th>
                <th className="text-left px-2 py-1.5 font-medium">Ht</th>
                <th className="text-right px-2 py-1.5 font-medium">Wt</th>
                <th className="text-left px-2 py-1.5 font-medium">Country</th>
              </tr>
            </thead>
            <tbody>
              {data.roster.map((p, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-tertiary)] transition-colors">
                  <td className="px-2 py-1.5 text-[var(--text-primary)] font-medium whitespace-nowrap">{p.player}</td>
                  <td className="px-2 py-1.5">
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        color: POSITION_COLORS[p.position] || '#64748b',
                        backgroundColor: `${POSITION_COLORS[p.position] || '#64748b'}20`,
                      }}
                    >
                      {p.position || '-'}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-[var(--text-muted)]">{p.height || '-'}</td>
                  <td className="text-right px-2 py-1.5 text-[var(--text-muted)]">{p.weight || '-'}</td>
                  <td className="px-2 py-1.5 text-[var(--text-muted)]">{p.country || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Position donut */}
        <div className="shrink-0" style={{ width: 90, height: 90 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius="50%"
                outerRadius="90%"
                paddingAngle={3}
                animationDuration={ANIMATION.duration}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-2 mt-1">
            {pieData.map((d) => (
              <span key={d.name} className="text-[9px] font-semibold" style={{ color: d.color }}>
                {d.name}:{d.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ChartCard>
  )
}
