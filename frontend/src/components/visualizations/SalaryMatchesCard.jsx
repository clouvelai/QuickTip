import ChartCard from './ChartCard'
import { formatDollar, formatDollarFull, COLORS } from '../../charts/chartTheme'

function MatchPackage({ match, index }) {
  const totalPlayers = match.players.length
  const label = totalPlayers === 1 ? '1 player' : `${totalPlayers} players`

  return (
    <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[var(--accent)]">{match.team}</span>
        <span className="text-[10px] text-[var(--text-muted)]">
          {label} · {formatDollar(match.total_salary)}
        </span>
      </div>
      <div className="space-y-1">
        {match.players.map((p, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[var(--text-muted)] w-5">{p.position || '—'}</span>
              <span className="text-[var(--text-secondary)]">{p.player}</span>
            </div>
            <span className="font-mono text-[var(--text-muted)]">{formatDollar(p.cap_hit)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-[var(--text-muted)]">
        <span>Salary diff</span>
        <span className="font-mono">{formatDollar(match.salary_difference)}</span>
      </div>
    </div>
  )
}

export default function SalaryMatchesCard({ data }) {
  if (!data || !data.top_matches) return null

  const badge = `${data.matches_found} matches`
  const badgeColor = data.matches_found > 0 ? COLORS.emerald : COLORS.rose

  return (
    <ChartCard
      title={`Salary Matches for ${data.target_player}`}
      badge={badge}
      badgeColor={badgeColor}
      footer={`Target salary: ${formatDollarFull(data.target_salary)} (${data.target_team})`}
    >
      {data.top_matches.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] text-center py-4">
          No salary-matching packages found.
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {data.top_matches.slice(0, 10).map((match, i) => (
            <MatchPackage key={i} match={match} index={i} />
          ))}
        </div>
      )}
    </ChartCard>
  )
}
