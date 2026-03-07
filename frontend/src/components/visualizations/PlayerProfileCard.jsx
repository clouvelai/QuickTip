import ChartCard from './ChartCard'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

const FIELDS = [
  { key: 'position', label: 'Position' },
  { key: 'height', label: 'Height' },
  { key: 'weight', label: 'Weight', suffix: ' lbs' },
  { key: 'country', label: 'Country' },
  { key: 'jersey_number', label: 'Jersey', prefix: '#' },
  { key: 'draft_year', label: 'Draft Year' },
  { key: 'draft_round', label: 'Draft Round' },
  { key: 'draft_number', label: 'Draft Pick', prefix: '#' },
]

export default function PlayerProfileCard({ data }) {
  if (!data) return null

  return (
    <ChartCard>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-lg font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          }}
        >
          {getInitials(data.player)}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight">{data.player}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{data.team}</p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
            {FIELDS.map((f) => {
              const val = data[f.key]
              if (val == null) return null
              return (
                <div key={f.key} className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">{f.label}</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {f.prefix || ''}{val}{f.suffix || ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ChartCard>
  )
}
