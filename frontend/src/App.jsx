import { useEffect, useRef } from 'react'
import { useChat } from './hooks/useChat'
import Sidebar from './components/Sidebar'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'

function App() {
  const { messages, sendMessage, isStreaming, clearMessages } = useChat()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onSendMessage={sendMessage} onClear={clearMessages} />

      <main className="flex-1 flex flex-col h-screen min-w-0">
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <WelcomeScreen onSend={sendMessage} />
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-6">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  message={msg}
                  isStreaming={isStreaming && i === messages.length - 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </main>
    </div>
  )
}

function WelcomeScreen({ onSend }) {
  const starters = [
    { label: 'Cap Analysis', text: "What's the Lakers' cap situation?" },
    { label: 'Trade Eval', text: 'Analyze a Trae Young for Zach LaVine trade' },
    { label: 'Stats', text: 'Who leads the league in assists?' },
  ]

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-3xl font-bold text-white mx-auto mb-5">
          Q
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Welcome to QuickTip
        </h2>
        <p className="text-[var(--text-secondary)] text-sm mb-8">
          Your NBA GM Copilot. Ask about player contracts, cap sheets, trade scenarios, stats, and more.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          {starters.map((s, i) => (
            <button
              key={i}
              onClick={() => onSend(s.text)}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] hover:border-[var(--accent-dim)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 cursor-pointer"
            >
              <span className="text-[var(--accent)] font-medium">{s.label}</span>
              <span className="text-[var(--text-muted)] mx-1.5">/</span>
              {s.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
