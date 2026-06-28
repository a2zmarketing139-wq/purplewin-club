import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import GameBanner from './components/GameBanner'
import MarqueeBar from './components/MarqueeBar'
import CategoryIcons from './components/CategoryIcons'
import SlotGames from './components/SlotGames'
import BottomNav from './components/BottomNav'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import WalletPage from './components/WalletPage'
import AccountPage from './components/AccountPage'
import PromotionPage from './components/PromotionPage'
import ActivityPage from './components/ActivityPage'
import WingoPage from './components/WingoPage'
import AdminPage from './components/AdminPage'
import LeaderboardPage from './components/LeaderboardPage'
import VipPage from './components/VipPage'
import PaymentInfoPage from './components/PaymentInfoPage'
import LiveChat from './components/LiveChat'
import AviatorPage from './components/AviatorPage'
import ChickenRoadPage from './components/ChickenRoadPage'
import GameThumbnail from './components/GameThumbnail'
import { api } from './lib/api'

type Page = 'game' | 'login' | 'register' | 'wallet' | 'account' | 'promotion' | 'activity' | 'wingo' | 'admin' | 'leaderboard' | 'vip' | 'paymentinfo' | 'aviator' | 'chickenroad'

interface User {
  id: string
  name: string
  phone: string
  referralCode: string
  vipLevel: number
  totalDeposit: number
  totalWithdraw: number
}

function PwaInstallPopup({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50" onClick={onDismiss}>
      <div className="w-full max-w-lg p-5 pb-8 rounded-t-2xl animate-slide-up"
        style={{ background: 'linear-gradient(180deg, #163d3d, #0f3535)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
            style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)', color: '#fff' }}>P</div>
          <div>
            <p className="text-white font-bold">PurpleWin Club</p>
            <p className="text-[#a0b8b8] text-xs">Add to home screen for the best experience</p>
          </div>
        </div>
        <button onClick={onDismiss} className="w-full py-3 rounded-xl font-bold text-white text-sm mb-2"
          style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)' }}>
          Add to Home Screen
        </button>
        <button onClick={onDismiss} className="w-full py-2 text-[#6b8888] text-sm">Not now</button>
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('game')
  const [user, setUser] = useState<User | null>(null)
  const [balance, setBalance] = useState(0)
  const [showPwa, setShowPwa] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      if (api.getToken()) {
        try {
          const res = await api.getMe()
          if (res.ok) {
            setUser(res.data)
            const balRes = await api.getBalance()
            if (balRes.ok) setBalance(balRes.data.balance)
          } else {
            api.logout()
          }
        } catch {
          api.logout()
        }
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowPwa(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  const refreshBalance = useCallback(async () => {
    if (api.getToken()) {
      try {
        const res = await api.getBalance()
        if (res.ok) setBalance(res.data.balance)
      } catch { /* ignore */ }
    }
  }, [])

  const handleNav = (p: string) => {
    const protectedPages = ['wallet', 'account', 'promotion', 'activity', 'leaderboard', 'vip', 'paymentinfo']
    if (protectedPages.includes(p) && !user) {
      setPage('login')
      return
    }
    setPage(p as Page)
  }

  const handleLogin = async (u: { phone: string; password: string }, isRegister = false) => {
    try {
      const res = isRegister
        ? await api.register(u.phone, u.password)
        : await api.login(u.phone, u.password)
      if (res.ok) {
        setUser(res.data.user)
        setBalance(res.data.user.balance)
        setPage('game')
      }
      return res
    } catch (err: any) {
      return { ok: false, error: err.message }
    }
  }

  const handleLogout = () => {
    api.logout()
    setUser(null)
    setBalance(0)
    setPage('game')
  }

  const handleGameClick = (game: string) => {
    if (!user) { setPage('login'); return }
    if (['wingo', 'aviator', 'chickenroad'].includes(game)) setPage(game as Page)
  }

  // Auth pages
  if (page === 'login') return <LoginPage onLogin={(creds) => handleLogin(creds, false)} onRegister={() => setPage('register')} onBack={() => setPage('game')} />
  if (page === 'register') return <RegisterPage onRegister={(creds) => handleLogin(creds, true)} onLogin={() => setPage('login')} onBack={() => setPage('game')} />

  // Full-screen pages
  if (page === 'wallet') return <WalletPage balance={balance} onBack={() => setPage('game')} />
  if (page === 'account' && user) {
    return <AccountPage user={user} balance={balance} onLogout={handleLogout} onBack={() => setPage('game')} onAdmin={() => setPage('admin')} onNavigate={(p) => setPage(p as Page)} />
  }
  if (page === 'promotion') return <PromotionPage onBack={() => setPage('game')} />
  if (page === 'activity') return <ActivityPage onBack={() => setPage('game')} onBalanceUpdate={setBalance} />
  if (page === 'wingo') return <WingoPage balance={balance} setBalance={setBalance} onBack={() => setPage('game')} />
  if (page === 'admin') return <AdminPage onBack={() => setPage('game')} />
  if (page === 'leaderboard') return <LeaderboardPage onBack={() => setPage('game')} />
  if (page === 'vip') return <VipPage onBack={() => setPage('game')} />
  if (page === 'paymentinfo') return <PaymentInfoPage onBack={() => setPage('game')} />
  if (page === 'aviator') return <AviatorPage balance={balance} setBalance={setBalance} onBack={() => setPage('game')} />
  if (page === 'chickenroad') return <ChickenRoadPage balance={balance} setBalance={setBalance} onBack={() => setPage('game')} />

  // Main game page
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto relative" style={{ background: '#0d2b2b' }}>
      <Header balance={balance} onWalletClick={() => handleNav('wallet')} userId={user?.id} />

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        <GameBanner />
        <MarqueeBar />
        <CategoryIcons />

        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-[#9333ea]" />
              <h3 className="text-white font-bold text-lg">Popular</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)' }}>HOT</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Wingo', tag: 'HOT', color: '#9333ea', players: '12.5K', route: 'wingo' },
              { name: 'Aviator', tag: 'HOT', color: '#ffd700', players: '18.3K', route: 'aviator' },
              { name: 'Chicken Road', tag: 'HOT', color: '#ff5722', players: '9.7K', route: 'chickenroad' },
              { name: 'TRX Hash', tag: 'NEW', color: '#00bcd4', players: '6.1K', route: '' },
              { name: 'Mines', tag: 'HOT', color: '#00c851', players: '7.3K', route: '' },
              { name: 'Plinko', tag: 'HOT', color: '#e040fb', players: '9.8K', route: '' },
              { name: 'Fast Parity', tag: 'HOT', color: '#ff9800', players: '5.4K', route: '' },
              { name: 'Fortune Gems', tag: 'NEW', color: '#ff6b35', players: '15.1K', route: '' },
              { name: 'Money Coming', tag: 'HOT', color: '#ffd700', players: '8.2K', route: '' },
            ].map(game => (
              <div key={game.name} onClick={() => game.route && handleGameClick(game.route)}
                className="gaming-card cursor-pointer group relative overflow-hidden rounded-2xl"
                style={{ boxShadow: `0 0 20px ${game.color}11` }}>
                <GameThumbnail game={game.name} className="w-full aspect-[3/2]" />
                {/* Dark overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 px-3 py-2"
                  style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xs">{game.name}</span>
                    <span className="text-[9px]" style={{ color: game.color }}>{game.players}</span>
                  </div>
                </div>
                {/* Badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-bold"
                  style={{ background: game.tag === 'HOT' ? '#ffd700' : '#00c851', color: '#0d2b2b' }}>
                  {game.tag}
                </div>
                {/* Glow border */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ border: `1px solid ${game.color}22` }} />
              </div>
            ))}
          </div>
        </div>

        <SlotGames />
      </div>

      <BottomNav active={page} onNavigate={handleNav} />

      {/* Live Chat Widget */}
      <LiveChat userId={user?.id || null} />

      {showPwa && <PwaInstallPopup onDismiss={() => setShowPwa(false)} />}
    </div>
  )
}
