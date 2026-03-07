import ToolCallCard from './ToolCallCard'
import ToolResultVisualization from './ToolResultVisualization'

function renderMarkdown(text) {
  if (!text) return null
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      }
      return part
    })
    return <span key={i}>{parts}{i < lines.length - 1 ? '\n' : ''}</span>
  })
}

export default function ChatMessage({ message, isStreaming }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[720px] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Label */}
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 px-1">
          {isUser ? 'You' : 'QuickTip'}
        </span>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-[var(--accent)] text-white rounded-br-md'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border)] rounded-bl-md'
          }`}
        >
          {message.content
            ? (isUser ? message.content : renderMarkdown(message.content))
            : null
          }
          {!message.content && isStreaming && !isUser && (
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
          )}
        </div>

        {/* Tool Calls */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="w-full mt-1">
            {message.toolCalls.map((tc, i) => (
              <div key={`${tc.name}-${i}`}>
                <ToolCallCard toolCall={tc} />
                {tc.result && <ToolResultVisualization toolCall={tc} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
