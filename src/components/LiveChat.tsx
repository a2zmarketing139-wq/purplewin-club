import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { api } from '../lib/api'

interface LiveChatProps {
  userId: string | null
}

export default function LiveChat({ userId }: LiveChatProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [sending, setSending] = useState(false)
  const messagesEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userId) return
    const poll = setInterval(async () => {
      try {
        const res: any = await api.request('GET', '/chat/unread')
        if (res.ok) setUnreadCount(res.data.count)
      } catch { /* ignore */ }
    }, 10000)
    return () => clearInterval(poll)
  }, [userId])

  useEffect(() => {
    if (!open || !userId) return
    loadMessages()
    const poll = setInterval(loadMessages, 5000)
    return () => clearInterval(poll)
  }, [open, userId])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    try {
      const res: any = await api.request('GET', '/chat/messages')
      if (res.ok) setMessages(res.data.messages || [])
      setUnreadCount(0)
    } catch { /* ignore */ }
  }

  const handleSend = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    try {
      await api.request('POST', '/chat/send', { message: input.trim() })
      setInput('')
      await loadMessages()
    } catch { /* ignore */ }
    setSending(false)
  }

  if (!userId) return null

  return (
    <>
      {/* Chat Bubble */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)' }}>
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-40 right-4 z-50 w-80 rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: '#0f2020', border: '1px solid #9333ea44', maxHeight: '400px' }}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)' }}>
            <MessageCircle className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm">Live Support</span>
            <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          {/* Messages */}
          <div className="overflow-y-auto p-3 space-y-2" style={{ height: '280px' }}>
            {messages.length === 0 && (
              <p className="text-center text-[#6b8888] text-xs py-8">Send a message to start chatting with support!</p>
            )}
            {messages.map((msg: any) => (
              <div key={msg.id}
                className={`max-w-[85%] p-2.5 rounded-xl text-sm ${msg.isAdmin ? 'mr-auto' : 'ml-auto'}`}
                style={{
                  background: msg.isAdmin ? '#1a2744' : 'linear-gradient(135deg, #9333ea, #7c3aed)',
                  color: '#fff',
                  borderBottomRightRadius: msg.isAdmin ? '12px' : '4px',
                  borderBottomLeftRadius: msg.isAdmin ? '4px' : '12px',
                }}>
                <p>{msg.message}</p>
                <p className="text-[8px] mt-1 opacity-50">{new Date(msg.createdAt).toLocaleTimeString()}</p>
              </div>
            ))}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 flex gap-2" style={{ borderTop: '1px solid #1a4a4a' }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type message..."
              className="flex-1 px-3 py-2 rounded-lg text-white text-sm outline-none"
              style={{ background: '#163d3d', border: '1px solid #1a4a4a' }} />
            <button onClick={handleSend} disabled={sending || !input.trim()}
              className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)' }}>
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
