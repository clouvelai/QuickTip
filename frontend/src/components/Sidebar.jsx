const quickPrompts = [
  "What's the Lakers' cap situation?",
  "Analyze a Trae Young for Zach LaVine trade",
  "Who leads the league in assists?",
  "Is Jaylen Brown's contract tradeable?",
  "Show me the Celtics roster",
]

export default function Sidebar({ onSendMessage, onClear }) {
  return (
    <aside className="w-[280px] min-w-[280px] h-screen bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center text-lg font-bold">
            Q
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
              QuickTip
            </h1>
            <p className="text-xs text-[var(--text-muted)] leading-tight">
              NBA GM Copilot
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Quick Prompts
        </h2>
        <div className="flex flex-col gap-2">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(prompt)}
              className="text-left p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-dim)] transition-all duration-150 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)]">
        <button
          onClick={onClear}
          className="w-full py-2 px-3 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-150 cursor-pointer"
        >
          Clear conversation
        </button>
      </div>
    </aside>
  )
}
