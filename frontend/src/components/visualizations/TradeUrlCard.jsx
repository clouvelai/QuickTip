import ChartCard from './ChartCard'
import { formatDollar } from '../../charts/chartTheme'

export default function TradeUrlCard({ data }) {
  if (!data || !data.url) return null

  return (
    <ChartCard title="Trade Machine Link">
      {/* Trade summary */}
      <div className="space-y-3 mb-4">
        {(data.teams || []).map((team, i) => (
          <div key={i}>
            <div className="text-xs font-bold text-[var(--text-primary)] mb-1">
              {team.team} sends:
            </div>
            <div className="space-y-1">
              {(team.sending || []).map((p, j) => (
                <div key={j} className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">{p.name}</span>
                  <span className="font-mono text-[var(--text-muted)]">
                    {formatDollar(p.cap_hit)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Open in Trade Machine button */}
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 hover:brightness-110"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        Open in Trade Machine
      </a>
    </ChartCard>
  )
}
