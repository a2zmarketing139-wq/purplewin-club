import { useState, useEffect, useRef } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import { api } from '../lib/api'

interface NotificationBellProps {
  userId: string | null
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userId) return
    loadUnread()
    const poll = setInterval(loadUnread, 15000)
    return () => clearInterval(poll)
  }, [userId])

  useEffect(() => {
    if (!open) return
    loadNotifications()
  }, [open])

  const loadUnread = async () => {
    try {
        const res: any = await api.request('GET', '/user/notifications/unread')
        if (res.ok) setUnreadCount(res.data.count)
    } catch { /* ignore */ }
  }

  const loadNotifications = async () => {
    try {
      const res: any = await api.request('GET', '/user/notifications')
      if (res.ok) setNotifications(res.data.notifications || [])
    } catch { /* ignore */ }
  }

  const markAllRead = async () => {
    try {
      await api.request('POST', '/user/notifications/read')
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch { /* ignore */ }
  }

  if (!userId) return null

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: '#163d3d' }}>
        <Bell className="w-4 h-4 text-[#a0b8b8]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div ref={panelRef}
            className="absolute right-0 top-10 z-50 w-72 rounded-xl overflow-hidden shadow-2xl"
            style={{ background: '#0f2020', border: '1px solid #1a4a4a', maxHeight: '350px' }}>
            <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid #1a4a4a' }}>
              <span className="text-white font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[#00c851] text-[10px] flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
              {notifications.length === 0 ? (
                <p className="text-center text-[#6b8888] text-xs py-6">No notifications yet</p>
              ) : (
                notifications.map((n: any) => (
                  <div key={n.id} className="px-3 py-2.5 flex gap-2" style={{ borderBottom: '1px solid #1a4a4a22', background: n.isRead ? 'transparent' : '#9333ea08' }}>
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ background: n.isRead ? 'transparent' : '#9333ea' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">{n.title}</p>
                      <p className="text-[#6b8888] text-[10px] truncate">{n.message}</p>
                      <p className="text-[#6b8888] text-[8px] mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
