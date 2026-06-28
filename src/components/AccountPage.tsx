import { ArrowLeft, User, Copy, Check, LogOut, ChevronRight, Shield, Bell, Headphones, Star, Gift, Trophy, CreditCard, MessageCircle } from 'lucide-react'
import { useState } from 'react'

interface AccountPageProps {
  user: { name: string; phone: string; referralCode?: string; vipLevel?: number }
  balance: number
  onLogout: () => void
  onBack: () => void
  onAdmin?: () => void
  onNavigate?: (page: string) => void
}

export default function AccountPage({ user, balance, onLogout, onBack, onAdmin, onNavigate }: AccountPageProps) {
  const [copied, setCopied] = useState(false)
  const referralCode = user.referralCode || '73720103688'

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const vipNames: Record<number, string> = { 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Platinum', 5: 'Diamond' }
  const vipColors: Record<number, string> = { 1: '#cd7f32', 2: '#c0c0c0', 3: '#ffd700', 4: '#e5e4e2', 5: '#b9f2ff' }
  const vipLevel = user.vipLevel || 1

  const menuItems = [
    { icon: Trophy, label: 'Leaderboard', color: '#ffd700', action: () => onNavigate?.('leaderboard') },
    { icon: Star, label: `VIP Level (${vipNames[vipLevel]})`, color: vipColors[vipLevel] || '#cd7f32', action: () => onNavigate?.('vip') },
    { icon: Gift, label: 'My Referrals', color: '#00c851' },
    { icon: CreditCard, label: 'Deposit Instructions', color: '#00bcd4', action: () => onNavigate?.('paymentinfo') },
    { icon: Bell, label: 'Notifications', color: '#9333ea' },
    { icon: MessageCircle, label: 'Live Chat Support', color: '#9333ea', action: () => onNavigate?.('chat') },
    { icon: Shield, label: 'Admin Panel', color: '#3b82f6', action: onAdmin },
  ]

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b)' }}>
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#163d3d' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="ml-3 text-white font-bold text-lg">Account</span>
      </div>

      {/* Profile Card */}
      <div className="mx-4 mb-4 p-5 rounded-xl" style={{ background: 'linear-gradient(135deg, #0f3535, #163d3d)', border: '1px solid #1a4a4a' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)' }}>
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">{user.name}</h2>
            <p className="text-[#a0b8b8] text-sm">{user.phone}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-[#ffd700]">VIP {vipLevel}</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold"
                style={{ background: `${vipColors[vipLevel]}22`, color: vipColors[vipLevel] }}>
                {vipNames[vipLevel]}
              </span>
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="mt-4 p-3 rounded-lg flex items-center justify-between" style={{ background: '#0a2525', border: '1px dashed #ffd70044' }}>
          <div>
            <span className="text-[10px] text-[#ffd700] block">My Referral Code</span>
            <span className="text-lg font-bold text-[#ffd700]">{referralCode}</span>
          </div>
          <button onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
            style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)', color: '#0d2b2b' }}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="mx-4 mb-4 p-4 rounded-xl flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)' }}>
        <div>
          <p className="text-white/80 text-xs">Wallet Balance</p>
          <p className="text-white text-xl font-bold">Rs{balance.toFixed(2)}</p>
        </div>
        <button onClick={() => onNavigate?.('wallet')} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ background: '#ffffff22', color: '#fff' }}>
          Recharge
        </button>
      </div>

      {/* Menu Items */}
      <div className="mx-4 space-y-2">
        {menuItems.map(item => (
          <button key={item.label}
            onClick={() => item.action?.()}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl"
            style={{ background: '#0f3535', border: '1px solid #1a4a4a' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${item.color}22` }}>
              <item.icon className="w-4.5 h-4.5" style={{ color: item.color }} />
            </div>
            <span className="flex-1 text-left text-white text-sm font-medium">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-[#6b8888]" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="mx-4 mt-6">
        <button onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
          style={{ background: '#1a4a4a', color: '#ff4444', border: '1px solid #ff444433' }}>
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
