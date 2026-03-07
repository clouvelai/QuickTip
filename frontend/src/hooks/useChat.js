import { useState, useCallback, useRef } from 'react'

export function useChat() {
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef(null)

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isStreaming) return

    const userMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setIsStreaming(true)

    const assistantMessage = { role: 'assistant', content: '', toolCalls: [] }
    setMessages(prev => [...prev, assistantMessage])

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue

          try {
            const event = JSON.parse(jsonStr)

            switch (event.type) {
              case 'text_delta':
                setMessages(prev => {
                  const updated = [...prev]
                  const last = { ...updated[updated.length - 1] }
                  last.content += event.data
                  updated[updated.length - 1] = last
                  return updated
                })
                break

              case 'tool_call':
                setMessages(prev => {
                  const updated = [...prev]
                  const last = { ...updated[updated.length - 1] }
                  last.toolCalls = [...(last.toolCalls || []), {
                    name: event.data.name,
                    arguments: event.data.arguments,
                    result: null
                  }]
                  updated[updated.length - 1] = last
                  return updated
                })
                break

              case 'tool_result':
                setMessages(prev => {
                  const updated = [...prev]
                  const last = { ...updated[updated.length - 1] }
                  last.toolCalls = (last.toolCalls || []).map(tc =>
                    tc.name === event.data.name
                      ? { ...tc, result: event.data.result }
                      : tc
                  )
                  updated[updated.length - 1] = last
                  return updated
                })
                break

              case 'done':
                break
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev]
          const last = { ...updated[updated.length - 1] }
          last.content += last.content
            ? '\n\n[Error: Connection lost]'
            : 'Sorry, something went wrong. Please try again.'
          updated[updated.length - 1] = last
          return updated
        })
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [isStreaming])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, sendMessage, isStreaming, clearMessages }
}
