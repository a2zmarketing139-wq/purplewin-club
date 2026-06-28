import { ArrowLeft, Copy, Check, Users, TrendingUp } from 'lucide-react'
import { useState } from 'react'

interface PromotionPageProps {
  onBack: () => void
}

export default function PromotionPage({ onBack }: PromotionPageProps) {
  const [copied, setCopied] = useState(false)
  const referralCode = '73720103688'
  const referralLink = `${window.location.origin}/register/${referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const commissionLevels = [
    { level: 'Level 1', percent: '30%', members: 12 },
    { level: 'Level 2', percent: '15%', members: 45 },
    { level: 'Level 3', percent: '5%', members: 128 },
  ]

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b)' }}>
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: '#163d3d' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="ml-3 text-white font-bold text-lg">Promotion Center</span>
      </div>

      {/* Referral Banner */}
      <div className="mx-4 mb-4 p-5 rounded-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
          boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
        }}>
        <div className="absolute top-0 right-0 text-6xl opacity-20">🎁</div>
        <h2 className="text-[#0d2b2b] font-bold text-xl mb-1">Invite Friends & Earn</h2>
        <p className="text-[#0d2b2b]/70 text-sm mb-4">Earn commission on every friend's activity</p>
        
        <div className="bg-white/30 rounded-lg p-3 flex items-center justify-between">
          <span className="text-[#0d2b2b] text-xs truncate flex-1 mr-2">{referralLink}</span>
          <button onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
            style={{ background: '#0d2b2b', color: '#ffd700' }}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-4 mb-4 grid grid-cols-3 gap-2">
        {[
          { label: 'Total Referrals', value: '185', icon: Users, color: '#00c851' },
          { label: 'Active Today', value: '12', icon: TrendingUp, color: '#ffd700' },
          { label: 'Commission', value: 'Rs2,450', icon: TrendingUp, color: '#ff9800' },
        ].map(stat => (
          <div key={stat.label} className="p-3 rounded-xl text-center"
            style={{ background: '#0f3535', border: '1px solid #1a4a4a' }}>
            <stat.icon className="w-5 h-5 mx-auto mb-1" style={{ color: stat.color }} />
            <p className="text-white font-bold text-sm">{stat.value}</p>
            <p className="text-[#6b8888] text-[10px]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Commission Structure */}
      <div className="mx-4 mb-4">
        <h3 className="text-white font-bold text-sm mb-3">Commission Structure</h3>
        <div className="space-y-2">
          {commissionLevels.map(l => (
            <div key={l.level} className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: '#0f3535', border: '1px solid #1a4a4a' }}>
              <div>
                <span className="text-white text-sm font-bold">{l.level}</span>
                <span className="text-[#6b8888] text-xs ml-2">({l.members} members)</span>
              </div>
              <span className="text-[#00c851] font-bold text-sm">{l.percent}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Promotions List */}
      <div className="mx-4">
        <h3 className="text-white font-bold text-sm mb-3">Active Promotions</h3>
        {[
          { title: 'Daily Salary Bonus', desc: 'Earn daily salary based on your level', color: '#00c851', emoji: '💰' },
          { title: 'First Deposit Bonus', desc: 'Get 100% bonus on first deposit', color: '#ffd700', emoji: '🎉' },
          { title: 'Lucky Draw Event', desc: 'Win prizes every Friday', color: '#e040fb', emoji: '🎰' },
        ].map(promo => (
          <div key={promo.title} className="flex items-center gap-3 p-3 mb-2 rounded-xl"
            style={{ background: '#0f3535', border: '1px solid #1a4a4a' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: `${promo.color}22` }}>
              {promo.emoji}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-bold">{promo.title}</p>
              <p className="text-[#6b8888] text-[11px]">{promo.desc}</p>
            </div>
            <button className="px-3 py-1 rounded-lg text-xs font-bold"
              style={{ background: `${promo.color}22`, color: promo.color }}>
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}