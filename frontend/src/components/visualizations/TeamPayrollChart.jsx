import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import ChartCard from './ChartCard'
import { PALETTE, TICK_STYLE, TOOLTIP_STYLE, GRID_COLOR, ANIMATION, formatDollar, formatDollarFull } from '../../charts/chartTheme'

const CAP = 140_588_000
const TAX = 170_814_000
const APRON1 = 178_132_000
const APRON2 = 188_931_000

export default function TeamPayrollChart({ data }) {
  if (!data?.contracts?.length) return null

  const sorted = [...data.contracts].sort((a, b) => (b.cap_hit || 0) - (a.cap_hit || 0))
  const top8 = sorted.slice(0, 8)
  const othersTotal = sorted.slice(8).reduce((sum, c) => sum + (c.cap_hit || 0), 0)

  const barData = top8.map((c) => ({
    name: c.player?.split(' ').pop() || c.player,
    fullName: c.player,
    value: c.cap_hit || 0,
  }))
  if (othersTotal > 0) {
    barData.push({ name: 'Others', fullName: `${sorted.length - 8} others`, value: othersTotal })
  }

  const pieData = barData.map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }))
  const totalSalary = data.total_salary || sorted.reduce((s, c) => s + (c.cap_hit || 0), 0)

  // Cap gauge
  const gaugeMax = Math.max(totalSalary, APRON2) * 1.05
  const segments = [
    { start: 0, end: CAP, color: '#10b981', label: 'Cap' },
    { start: CAP, end: TAX, color: '#f59e0b', label: 'Tax' },
    { start: TAX, end: APRON1, color: '#f97316', label: 'Apron 1' },
    { start: APRON1, end: APRON2, color: '#ef4444', label: 'Apron 2' },
  ]

  let capStatus = 'Under Cap'
  let statusColor = 'var(--success)'
  if (totalSalary > APRON1) { capStatus = 'Above Apron'; statusColor = 'var(--danger)' }
  else if (totalSalary > TAX) { capStatus = 'In Tax'; statusColor = 'var(--warning)' }
  else if (totalSalary > CAP) { capStatus = 'Over Cap'; statusColor = 'var(--warning)' }

  return (
    <ChartCard
      title={`${data.team} Payroll`}
      badge={capStatus}
      badgeColor={statusColor}
      footer={
        <div className="flex justify-between">
          <span>
            <span className="text-[var(--text-muted)]">Total: </span>
            <span className="font-mono font-bold text-[var(--text-primary)]">{formatDollarFull(totalSalary)}</span>
          </span>
          <span>
            <span className="text-[var(--text-muted)]">Players: </span>
            <span className="text-[var(--text-secondary)]">{data.player_count || sorted.length}</span>
          </span>
        </div>
      }
    >
      <div className="flex gap-2">
        {/* Bar chart */}
        <div className="flex-[3]" style={{ height: barData.length * 32 + 20 }}>
          <ResponsiveContainer>
            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ ...TICK_STYLE, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value) => [formatDollarFull(value), 'Cap Hit']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                cursor={{ fill: GRID_COLOR }}
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                animationDuration={ANIMATION.duration}
                animationEasing={ANIMATION.easing}
                label={{
                  position: 'right',
                  fontSize: 10,
                  fill: '#94a3b8',
                  formatter: (v) => formatDollar(v),
                }}
              >
                {barData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div className="flex-[2] flex items-center justify-center" style={{ minHeight: 160 }}>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
                animationDuration={ANIMATION.duration}
                animationEasing={ANIMATION.easing}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value) => [formatDollarFull(value), 'Cap Hit']}
              />
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={700}
                fill="#f1f5f9"
              >
                {formatDollar(totalSalary)}
              </text>
              <text
                x="50%"
                y="62%"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fill="#64748b"
              >
                Total
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cap gauge bar */}
      <div className="mt-4">
        <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1">
          <span>$0</span>
          <span>{formatDollar(gaugeMax)}</span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden bg-[var(--bg-tertiary)]">
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
          {/* Team position marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-white"
            style={{ left: `${Math.min((totalSalary / gaugeMax) * 100, 100)}%` }}
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
    </ChartCard>
  )
}
