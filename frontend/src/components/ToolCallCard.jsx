import { useState } from 'react'

const toolDisplayNames = {
  get_player_contract: 'Player Contract Lookup',
  get_team_cap_sheet: 'Team Cap Sheet',
  get_free_agents: 'Free Agent Search',
  get_player_season_stats: 'Season Stats',
  get_player_career_stats: 'Career Stats',
  get_stat_leaders: 'League Leaders',
  get_team_roster: 'Team Roster',
  get_player_profile: 'Player Profile',
  get_cap_info: 'Salary Cap Info',
  check_trade_salary_match: 'Trade Salary Match',
  get_available_exceptions: 'Available Exceptions',
  analyze_trade: 'Trade Analyzer',
}

export default function ToolCallCard({ toolCall }) {
  const [expanded, setExpanded] = useState(false)
  const { name, arguments: args, result } = toolCall

  const displayName = toolDisplayNames[name] || name.replace(/_/g, ' ')
  const isLoading = result === null

  return (
    <div className="my-2 rounded-lg border-l-3 border-[var(--accent-dim)] bg-[var(--bg-tertiary)] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
      >
        {/* Gear icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-[var(--accent)] shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            clipRule="evenodd"
          />
        </svg>

        <span className="text-xs font-medium text-[var(--text-secondary)] capitalize flex-1">
          {displayName}
        </span>

        {isLoading ? (
          <span className="w-3.5 h-3.5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3.5 h-3.5 text-[var(--success)]"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
        )}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {expanded && (
        <div className="px-3.5 pb-3 border-t border-[var(--border)]">
          {args && (
            <div className="mt-2.5">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Arguments
              </p>
              <pre className="text-xs text-[var(--text-secondary)] font-mono bg-[var(--bg-primary)] rounded p-2 overflow-x-auto">
                {JSON.stringify(args, null, 2)}
              </pre>
            </div>
          )}
          {result && (
            <div className="mt-2.5">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Result
              </p>
              <pre className="text-xs text-[var(--text-secondary)] font-mono bg-[var(--bg-primary)] rounded p-2 overflow-x-auto max-h-60 overflow-y-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
