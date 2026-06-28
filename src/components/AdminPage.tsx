import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft, Users, DollarSign, TrendingUp, CheckCircle, XCircle, Search, Wallet, Shield, BarChart3, MessageCircle, Gamepad2, Bell, Send, Plane } from 'lucide-react'

interface AdminPageProps {
  onBack: () => void
}

const ADMIN_API = '/api/admin'

async function adminFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem('admin_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${ADMIN_API}${path}`, { ...options, headers: { ...headers, ...options?.headers } })
  return res.json()
}

export default function AdminPage({ onBack }: AdminPageProps) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lockUntil, setLockUntil] = useState<number | null>(null)
  const [tab, setTab] = useState<'dashboard' | 'deposits' | 'withdrawals' | 'users' | 'chat' | 'bets' | 'aviator' | 'chicken'>('dashboard')
  const [stats, setStats] = useState<any>(null)
  const [deposits, setDeposits] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [depositFilter, setDepositFilter] = useState('pending')
  const [withdrawFilter, setWithdrawFilter] = useState('pending')
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [balanceAmount, setBalanceAmount] = useState('')
  const [balanceDesc, setBalanceDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [bets, setBets] = useState<any[]>([])
  const [betStats, setBetStats] = useState<any>(null)
  const [chatUsers, setChatUsers] = useState<any[]>([])
  const [chatUserId, setChatUserId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [aviatorData, setAviatorData] = useState<any>(null)
  const [chickenData, setChickenData] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) setLoggedIn(true)
  }, [])

  const loadStats = useCallback(async () => {
    const res = await adminFetch('/stats')
    if (res.ok) setStats(res.data)
  }, [])

  const loadDeposits = useCallback(async () => {
    const res = await adminFetch(`/deposits?status=${depositFilter}`)
    if (res.ok) setDeposits(res.data.deposits)
  }, [depositFilter])

  const loadWithdrawals = useCallback(async () => {
    const res = await adminFetch(`/withdrawals?status=${withdrawFilter}`)
    if (res.ok) setWithdrawals(res.data.withdrawals)
  }, [withdrawFilter])

  const loadUsers = useCallback(async () => {
    const res = await adminFetch(`/users?search=${userSearch}`)
    if (res.ok) setUsers(res.data.users)
  }, [userSearch])

  const loadBets = useCallback(async () => {
    const res = await adminFetch('/bets')
    if (res.ok) {
      setBets(res.data.bets)
      setBetStats(res.data.stats)
    }
  }, [])

  const loadChatUsers = useCallback(async () => {
    const res = await adminFetch('/chat/users')
    if (res.ok) setChatUsers(res.data.users)
  }, [])

  const loadChatMessages = useCallback(async (userId: string) => {
    const res = await adminFetch(`/chat/messages/${userId}`)
    if (res.ok) setChatMessages(res.data.messages)
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [])

  const loadAviatorData = useCallback(async () => {
    const res = await adminFetch('/aviator/rounds')
    if (res.ok) setAviatorData(res.data)
  }, [])

  const loadChickenData = useCallback(async () => {
    const res = await adminFetch('/chicken/sessions')
    if (res.ok) setChickenData(res.data)
  }, [])

  useEffect(() => {
    if (!loggedIn) return
    if (tab === 'dashboard') loadStats()
    if (tab === 'deposits') loadDeposits()
    if (tab === 'withdrawals') loadWithdrawals()
    if (tab === 'users') loadUsers()
    if (tab === 'bets') loadBets()
    if (tab === 'chat') loadChatUsers()
    if (tab === 'aviator') loadAviatorData()
    if (tab === 'chicken') loadChickenData()
  }, [loggedIn, tab, loadStats, loadDeposits, loadWithdrawals, loadUsers, loadBets, loadChatUsers, loadAviatorData, loadChickenData])

  useEffect(() => {
    if (!chatUserId) return
    loadChatMessages(chatUserId)
    const poll = setInterval(() => loadChatMessages(chatUserId), 5000)
    return () => clearInterval(poll)
  }, [chatUserId, loadChatMessages])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockUntil && Date.now() < lockUntil) {
      setLoginError(`Locked. Try again in ${Math.ceil((lockUntil - Date.now()) / 60000)} minutes.`)
      return
    }
    setLoginLoading(true)
    const form = e.target as HTMLFormElement
    const phone = (form.elements[0] as HTMLInputElement).value
    const password = (form.elements[1] as HTMLInputElement).value
    setLoginError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })
      const data = await res.json()
      if (data.ok && data.data.user?.role === 'admin') {
        localStorage.setItem('admin_token', data.data.token)
        setLoggedIn(true)
        setLoginAttempts(0)
      } else if (data.ok && data.data.user?.role !== 'admin') {
        setLoginError('This is not an admin account')
        setLoginAttempts(prev => prev + 1)
      } else {
        setLoginError(data.error || 'Login failed')
        setLoginAttempts(prev => {
          const next = prev + 1
          if (next >= 5) setLockUntil(Date.now() + 30 * 60 * 1000)
          return next
        })
      }
    } catch { setLoginError('Connection failed') }
    setLoginLoading(false)
  }

  const handleApproveDeposit = async (id: string) => {
    setLoading(true)
    const res = await adminFetch(`/deposit/${id}/approve`, { method: 'POST' })
    setMessage(res.ok ? 'Deposit approved!' : res.error)
    setLoading(false)
    loadDeposits()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleRejectDeposit = async (id: string) => {
    setLoading(true)
    const res = await adminFetch(`/deposit/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason: 'Rejected by admin' }) })
    setMessage(res.ok ? 'Deposit rejected' : res.error)
    setLoading(false)
    loadDeposits()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleApproveWithdrawal = async (id: string) => {
    setLoading(true)
    const res = await adminFetch(`/withdrawal/${id}/approve`, { method: 'POST' })
    setMessage(res.ok ? 'Withdrawal approved!' : res.error)
    setLoading(false)
    loadWithdrawals()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleRejectWithdrawal = async (id: string) => {
    setLoading(true)
    const res = await adminFetch(`/withdrawal/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason: 'Rejected by admin' }) })
    setMessage(res.ok ? 'Withdrawal rejected' : res.error)
    setLoading(false)
    loadWithdrawals()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleAdjustBalance = async (userId: string) => {
    const amount = Number(balanceAmount)
    if (!amount) return
    setLoading(true)
    const res = await adminFetch(`/user/${userId}/balance`, {
      method: 'POST',
      body: JSON.stringify({ amount, description: balanceDesc || (amount > 0 ? 'Admin credit' : 'Admin debit') }),
    })
    setMessage(res.ok ? `Balance updated! New: Rs${res.data.balance}` : res.error)
    setLoading(false)
    setBalanceAmount('')
    setBalanceDesc('')
    setSelectedUser(null)
    loadUsers()
    setTimeout(() => setMessage(''), 3000)
  }

  const handleSendChat = async () => {
    if (!chatUserId || !chatInput.trim()) return
    await adminFetch('/chat/send', { method: 'POST', body: JSON.stringify({ userId: chatUserId, message: chatInput.trim() }) })
    setChatInput('')
    loadChatMessages(chatUserId)
  }

  // ─── LOGIN ────────────────────────────────
  if (!loggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'linear-gradient(180deg, #0a1628, #0d1f3c)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)' }}>
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Admin Panel</h1>
        <p className="text-sm text-gray-400 mb-6">PurpleWin Club Management</p>
        {lockUntil && Date.now() < lockUntil && (
          <div className="w-full max-w-sm mb-3 px-4 py-2 rounded-lg text-sm text-red-400 bg-red-500/10 border border-red-500/30">
            Too many attempts. Locked for {Math.ceil((lockUntil - Date.now()) / 60000)} min.
          </div>
        )}
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-3">
          {loginError && <div className="px-4 py-2 rounded-lg text-sm text-white bg-red-500/20 border border-red-500">{loginError}</div>}
          <input name="phone" placeholder="Admin Phone" className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none" style={{ background: '#1a2744', border: '1px solid #2a3f5f' }} />
          <input name="password" type="password" placeholder="Password" className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none" style={{ background: '#1a2744', border: '1px solid #2a3f5f' }} />
          <button type="submit" disabled={loginLoading || (lockUntil !== null && Date.now() < lockUntil)}
            className="w-full py-3 rounded-lg font-bold text-white text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)' }}>
            {loginLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    )
  }

  // ─── MAIN ADMIN ──────────────────────────
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: BarChart3 },
    { id: 'deposits', label: 'Deposits', icon: DollarSign },
    { id: 'withdrawals', label: 'With.', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'bets', label: 'Wingo', icon: Gamepad2 },
    { id: 'aviator', label: 'Aviator', icon: Plane },
    { id: 'chicken', label: 'Chicken', icon: Gamepad2 },
  ]

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a1628, #0d1f3c)' }}>
      <div className="flex items-center px-4 py-3" style={{ borderBottom: '1px solid #1a2744' }}>
        <button onClick={() => { localStorage.removeItem('admin_token'); setLoggedIn(false) }} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1a2744' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="ml-3 text-white font-bold text-lg">Admin Panel</span>
        <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: '#9333ea22', color: '#9333ea' }}>ADMIN</span>
      </div>

      {message && (
        <div className="mx-4 mt-3 px-4 py-2 rounded-lg text-sm text-white"
          style={{ background: message.includes('!') || message.includes('updated') ? '#22c55e33' : '#ef444433', border: `1px solid ${message.includes('!') || message.includes('updated') ? '#22c55e' : '#ef4444'}` }}>
          {message}
        </div>
      )}

      <div className="flex mx-4 mt-3 gap-1 rounded-lg overflow-hidden" style={{ background: '#1a2744' }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setTab(item.id as any)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-bold transition-all"
            style={{ background: tab === item.id ? '#9333ea' : 'transparent', color: tab === item.id ? '#fff' : '#6b7fa3' }}>
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === 'dashboard' && stats && (
        <div className="p-4 space-y-3">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#9333ea' },
            { label: 'Total Deposits', value: `Rs${stats.totalDeposits.toLocaleString()}`, icon: DollarSign, color: '#22c55e' },
            { label: 'Total Withdrawals', value: `Rs${stats.totalWithdrawals.toLocaleString()}`, icon: TrendingUp, color: '#f59e0b' },
            { label: 'Pending Deposits', value: stats.pendingDeposits, icon: DollarSign, color: stats.pendingDeposits > 0 ? '#ef4444' : '#22c55e' },
            { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: TrendingUp, color: stats.pendingWithdrawals > 0 ? '#ef4444' : '#22c55e' },
            { label: 'Total Bets', value: stats.totalBets, icon: Gamepad2, color: '#3b82f6' },
            { label: 'Total Wagered', value: `Rs${stats.totalBetAmount.toLocaleString()}`, icon: Wallet, color: '#ec4899' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#111b2e', border: '1px solid #1a2744' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}22` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[#6b7fa3] text-[11px]">{s.label}</p>
                <p className="text-white font-bold text-lg">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deposits */}
      {tab === 'deposits' && (
        <div className="p-4">
          <div className="flex gap-2 mb-3">
            {['pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setDepositFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize"
                style={{ background: depositFilter === s ? '#9333ea' : '#1a2744', color: depositFilter === s ? '#fff' : '#6b7fa3' }}>
                {s}
              </button>
            ))}
          </div>
          {deposits.length === 0 ? <p className="text-center text-gray-500 py-8 text-sm">No deposits</p> : deposits.map(d => (
            <div key={d.id} className="p-3 rounded-xl mb-2" style={{ background: '#111b2e', border: '1px solid #1a2744' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-bold text-sm">{d.user?.name} ({d.user?.phone})</p>
                  <p className="text-[#6b7fa3] text-[10px]">{new Date(d.createdAt).toLocaleString()}</p>
                </div>
                <p className="text-green-400 font-bold">Rs{d.amount}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] mb-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 capitalize">{d.method}</span>
                {d.accountNumber && <span className="text-gray-400">Acct: {d.accountNumber}</span>}
              </div>
              {d.screenshot && (
                <div className="mb-2">
                  <img src={`/api/uploads/${d.screenshot}`} alt="Screenshot" className="w-full max-w-xs rounded-lg" style={{ border: '1px solid #1a2744' }} />
                </div>
              )}
              {depositFilter === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleApproveDeposit(d.id)} disabled={loading} className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 bg-green-500/20 text-green-400">
                    <CheckCircle className="w-3 h-3" /> Approve
                  </button>
                  <button onClick={() => handleRejectDeposit(d.id)} disabled={loading} className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 bg-red-500/20 text-red-400">
                    <XCircle className="w-3 h-3" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Withdrawals */}
      {tab === 'withdrawals' && (
        <div className="p-4">
          <div className="flex gap-2 mb-3">
            {['pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setWithdrawFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize"
                style={{ background: withdrawFilter === s ? '#9333ea' : '#1a2744', color: withdrawFilter === s ? '#fff' : '#6b7fa3' }}>
                {s}
              </button>
            ))}
          </div>
          {withdrawals.length === 0 ? <p className="text-center text-gray-500 py-8 text-sm">No withdrawals</p> : withdrawals.map(w => (
            <div key={w.id} className="p-3 rounded-xl mb-2" style={{ background: '#111b2e', border: '1px solid #1a2744' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-bold text-sm">{w.user?.name} ({w.user?.phone})</p>
                  <p className="text-[#6b7fa3] text-[10px]">{new Date(w.createdAt).toLocaleString()}</p>
                </div>
                <p className="text-amber-400 font-bold">Rs{w.amount}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] mb-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 capitalize">{w.method}</span>
                <span className="text-gray-400">Acct: {w.accountNumber}</span>
                <span className="text-gray-400">Name: {w.accountName}</span>
              </div>
              {withdrawFilter === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleApproveWithdrawal(w.id)} disabled={loading} className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 bg-green-500/20 text-green-400">
                    <CheckCircle className="w-3 h-3" /> Approve
                  </button>
                  <button onClick={() => handleRejectWithdrawal(w.id)} disabled={loading} className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 bg-red-500/20 text-red-400">
                    <XCircle className="w-3 h-3" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="p-4">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search phone or name"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-white text-sm outline-none" style={{ background: '#1a2744', border: '1px solid #2a3f5f' }} />
            </div>
            <button onClick={loadUsers} className="px-3 rounded-lg text-xs font-bold" style={{ background: '#9333ea22', color: '#9333ea' }}>Search</button>
          </div>
          {users.map(u => (
            <div key={u.id} className="p-3 rounded-xl mb-2" style={{ background: '#111b2e', border: '1px solid #1a2744' }}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-white font-bold text-sm">{u.name}</p>
                  <p className="text-[#6b7fa3] text-[10px]">{u.phone} | VIP{u.vipLevel} | {u.isActive ? '✅ Active' : '❌ Disabled'}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold text-sm">Rs{u.balance.toLocaleString()}</p>
                  <p className="text-[#6b7fa3] text-[10px]">Deposit: Rs{u.totalDeposit}</p>
                </div>
              </div>
              {selectedUser?.id === u.id ? (
                <div className="mt-3 p-3 rounded-lg" style={{ background: '#0d1525' }}>
                  <p className="text-xs text-gray-400 mb-2">Adjust Balance for {u.name}</p>
                  <input type="number" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)}
                    placeholder="+ amount / - amount"
                    className="w-full px-3 py-2 rounded text-white text-sm outline-none mb-2" style={{ background: '#1a2744', border: '1px solid #2a3f5f' }} />
                  <input value={balanceDesc} onChange={e => setBalanceDesc(e.target.value)} placeholder="Description"
                    className="w-full px-3 py-2 rounded text-white text-sm outline-none mb-2" style={{ background: '#1a2744', border: '1px solid #2a3f5f' }} />
                  <div className="flex gap-2">
                    <button onClick={() => handleAdjustBalance(u.id)} disabled={loading || !balanceAmount}
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50" style={{ background: '#9333ea' }}>Apply</button>
                    <button onClick={() => { setSelectedUser(null); setBalanceAmount(''); setBalanceDesc('') }}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-700 text-white">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setSelectedUser(u)} className="flex-1 py-1.5 rounded-lg text-[10px] font-bold" style={{ background: '#9333ea22', color: '#9333ea' }}>Adjust Balance</button>
                  <button onClick={async () => { await adminFetch(`/user/${u.id}/toggle`, { method: 'POST' }); loadUsers() }}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-bold"
                    style={{ background: u.isActive ? '#ef444422' : '#22c55e22', color: u.isActive ? '#ef4444' : '#22c55e' }}>
                    {u.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat */}
      {tab === 'chat' && (
        <div className="p-4">
          {!chatUserId ? (
            <div>
              <p className="text-white font-bold text-sm mb-3">Player Chats</p>
              {chatUsers.length === 0 ? <p className="text-center text-gray-500 py-8 text-sm">No chat messages yet</p> : chatUsers.map((cu: any) => (
                <button key={cu.userId} onClick={() => setChatUserId(cu.userId)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl mb-2 text-left" style={{ background: '#111b2e', border: '1px solid #1a2744' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#9333ea22' }}>
                    <MessageCircle className="w-5 h-5 text-[#9333ea]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{cu.name} ({cu.phone})</p>
                    <p className="text-[#6b7fa3] text-[10px]">{cu.totalMessages} messages</p>
                  </div>
                  {cu.unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">{cu.unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button onClick={() => setChatUserId(null)} className="flex items-center gap-1 text-sm text-[#9333ea] mb-3">
                <ArrowLeft className="w-3 h-3" /> Back to chats
              </button>
              <div className="rounded-xl overflow-hidden" style={{ background: '#111b2e', border: '1px solid #1a2744', height: '60vh' }}>
                <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ height: 'calc(100% - 50px)' }}>
                  {chatMessages.map((msg: any) => (
                    <div key={msg.id} className={`max-w-[80%] p-2.5 rounded-xl text-sm ${msg.isAdmin ? 'ml-auto' : 'mr-auto'}`}
                      style={{ background: msg.isAdmin ? '#9333ea' : '#1a2744', color: '#fff' }}>
                      <p>{msg.message}</p>
                      <p className="text-[8px] mt-1 opacity-50">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2 p-2" style={{ borderTop: '1px solid #1a2744' }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    placeholder="Reply..." className="flex-1 px-3 py-2 rounded-lg text-white text-sm outline-none" style={{ background: '#1a2744', border: '1px solid #2a3f5f' }} />
                  <button onClick={handleSendChat} className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#9333ea' }}>
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bets */}
      {tab === 'bets' && (
        <div className="p-4">
          {betStats && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Total Bets', value: betStats.totalBets, color: '#3b82f6' },
                { label: 'Wagered', value: `Rs${betStats.totalWagered.toLocaleString()}`, color: '#ec4899' },
                { label: 'Won', value: `Rs${betStats.totalWon.toLocaleString()}`, color: '#22c55e' },
                { label: 'Profit', value: `Rs${betStats.profit.toLocaleString()}`, color: betStats.profit >= 0 ? '#22c55e' : '#ef4444' },
              ].map(s => (
                <div key={s.label} className="p-2 rounded-lg" style={{ background: '#111b2e', border: '1px solid #1a2744' }}>
                  <p className="text-[#6b7fa3] text-[10px]">{s.label}</p>
                  <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
          {bets.length === 0 ? <p className="text-center text-gray-500 py-8 text-sm">No bets yet</p> : bets.map((b: any) => (
            <div key={b.id} className="flex items-center justify-between p-2.5 rounded-lg mb-1.5" style={{ background: '#111b2e', border: '1px solid #1a2744' }}>
              <div>
                <p className="text-white text-xs font-bold">{b.user?.name || 'Unknown'} <span className="text-[#6b7fa3] font-normal">({b.user?.phone})</span></p>
                <p className="text-[#6b7fa3] text-[10px]">{b.gameType} | {b.betChoice} | Rs{b.betAmount}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${b.isWin ? 'text-green-400' : 'text-red-400'}`}>
                  {b.isWin ? `+Rs${b.winAmount}` : `-Rs${b.betAmount}`}
                </p>
                <p className="text-[10px] text-[#6b7fa3]">{new Date(b.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aviator */}
      {tab === 'aviator' && (
        <div className="p-4">
          {aviatorData?.stats && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Total Bets', value: aviatorData.stats.totalBets, color: '#3b82f6' },
                { label: 'Wagered', value: `Rs${aviatorData.stats.totalWagered.toLocaleString()}`, color: '#ffd700' },
                { label: 'Won', value: `Rs${aviatorData.stats.totalWon.toLocaleString()}`, color: '#22c55e' },
                { label: 'Profit', value: `Rs${aviatorData.stats.profit.toLocaleString()}`, color: aviatorData.stats.profit >= 0 ? '#22c55e' : '#ef4444' },
              ].map(s => (
                <div key={s.label} className="p-2 rounded-lg" style={{ background: '#111b2e', border: '1px solid #1a2744' }}>
                  <p className="text-[#6b7fa3] text-[10px]">{s.label}</p>
                  <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
          {!aviatorData ? <p className="text-center text-gray-500 py-8 text-sm">Loading...</p> :
          aviatorData.rounds?.length === 0 ? <p className="text-center text-gray-500 py-8 text-sm">No rounds yet</p> :
          aviatorData.rounds.map((r: any) => (
            <div key={r.id} className="p-3 rounded-xl mb-2" style={{ background: '#111b2e', border: '1px solid #1a2744' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-xs font-bold">Round {r.id.slice(-6)}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'crashed' ? 'bg-red-500/20 text-red-400' : r.status === 'flying' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {r.status}
                </span>
              </div>
              <p className="text-[#ffd700] text-sm font-bold">Crashed at {r.crashMultiplier}x</p>
              {r.bets?.length > 0 && r.bets.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between mt-1 py-1 border-t border-[#1a2744]" style={{ borderTop: '1px solid #1a2744' }}>
                  <span className="text-[#6b7fa3] text-[10px]">{b.user?.name} (Rs{b.betAmount})</span>
                  <span className={`text-[10px] font-bold ${b.status === 'cashed_out' ? 'text-green-400' : 'text-red-400'}`}>
                    {b.status === 'cashed_out' ? `+Rs${b.winAmount} (${b.cashoutMultiplier}x)` : 'Crashed'}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Chicken Road */}
      {tab === 'chicken' && (
        <div className="p-4">
          {chickenData?.stats && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Total Sessions', value: chickenData.stats.totalSessions, color: '#3b82f6' },
                { label: 'Wagered', value: `Rs${chickenData.stats.totalWagered.toLocaleString()}`, color: '#ff5722' },
                { label: 'Won', value: `Rs${chickenData.stats.totalWon.toLocaleString()}`, color: '#22c55e' },
                { label: 'Profit', value: `Rs${chickenData.stats.profit.toLocaleString()}`, color: chickenData.stats.profit >= 0 ? '#22c55e' : '#ef4444' },
              ].map(s => (
                <div key={s.label} className="p-2 rounded-lg" style={{ background: '#111b2e', border: '1px solid #1a2744' }}>
                  <p className="text-[#6b7fa3] text-[10px]">{s.label}</p>
                  <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
          {!chickenData ? <p className="text-center text-gray-500 py-8 text-sm">Loading...</p> :
          chickenData.sessions?.length === 0 ? <p className="text-center text-gray-500 py-8 text-sm">No sessions yet</p> :
          chickenData.sessions.map((s: any) => (
            <div key={s.id} className="p-3 rounded-xl mb-2" style={{ background: '#111b2e', border: '1px solid #1a2744' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-xs font-bold">{s.user?.name} ({s.user?.phone})</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${s.status === 'cashed_out' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {s.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-[#a0b8b8]">Difficulty: <b className="capitalize">{s.difficulty}</b></span>
                <span className="text-[#a0b8b8]">Bet: <b>Rs{s.betAmount}</b></span>
                <span className="text-[#a0b8b8]">Steps: <b>{s.stepsCompleted}/{s.totalSteps}</b></span>
              </div>
              {s.status === 'cashed_out' && (
                <p className="text-green-400 text-xs font-bold mt-1">+Rs{s.winAmount} at {s.cashoutMultiplier}x</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
