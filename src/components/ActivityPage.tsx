import { useState, useEffect } from 'react'
import { ArrowLeft, Trophy, Flame, Clock, Gift, Check } from 'lucide-react'
import { api } from '../lib/api'

interface ActivityPageProps {
  onBack: () => void
  onBalanceUpdate?: (balance: number) => void
}

export default function ActivityPage({ onBack, onBalanceUpdate }: ActivityPageProps) {
  const [dailyBonus, setDailyBonus] = useState<any>(null)
  const [claiming, setClaiming] = useState(false)
  const [bonusMessage, setBonusMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.request('GET', '/daily-bonus/status').then((res: any) => {
      if (res.ok) setDailyBonus(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const claimBonus = async () => {
    setClaiming(true)
    setBonusMessage('')
    try {
      const res: any = await api.request('POST', '/daily-bonus/claim')
      if (res.ok) {
        setBonusMessage(res.data.message)
        setDailyBonus({ ...dailyBonus, claimedToday: true, streak: res.data.streak })
        if (onBalanceUpdate) {
          const balRes: any = await api.request('GET', '/wallet/balance')
          if (balRes.ok) onBalanceUpdate(balRes.data.balance)
        }
      } else {
        setBonusMessage(res.error || 'Failed')
      }
    } catch (err: any) {
      setBonusMessage(err.message || 'Failed')
    }
    setClaiming(false)
    setTimeout(() => setBonusMessage(''), 3000)
  }

  const streak = dailyBonus?.streak || 0
  const streakDays = Array.from({ length: 7 }, (_, i) => i < streak)

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b)' }}>
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#163d3d' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="ml-3 text-white font-bold text-lg">Activity Center</span>
      </div>

      {/* Daily Bonus Section */}
      <div className="mx-4 mb-4 p-5 rounded-xl" style={{ background: 'linear-gradient(135deg, #ffd70015, #ff8c0010)', border: '1px solid #ffd70033' }}>
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5 text-[#ffd700]" />
          <h3 className="text-white font-bold text-sm">Daily Login Bonus</h3>
        </div>

        {/* Streak circles */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {streakDays.map((filled, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: filled ? 'linear-gradient(135deg, #ffd700, #ffaa00)' : '#1a4a4a',
                  color: filled ? '#0d2b2b' : '#6b8888',
                }}>
                {filled ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-[8px]" style={{ color: filled ? '#ffd700' : '#6b8888' }}>Day {i + 1}</span>
            </div>
          ))}
        </div>

        {/* Streak info */}
        <div className="text-center mb-3">
          <p className="text-[#a0b8b8] text-xs">Current Streak: <span className="text-[#ffd700] font-bold">{streak} days</span></p>
          <p className="text-[#6b8888] text-[10px] mt-1">
            {streak >= 7 ? '7-day streak! Earn Rs100 bonus!' : `Login ${7 - streak} more days for Rs100 bonus!`}
          </p>
        </div>

        {/* Claim button */}
        {dailyBonus?.claimedToday ? (
          <div className="w-full py-3 rounded-xl text-center text-sm font-bold text-[#ffd700]"
            style={{ background: '#ffd70011', border: '1px solid #ffd70033' }}>
            ✅ Today's bonus claimed! Come back tomorrow.
          </div>
        ) : (
          <button onClick={claimBonus} disabled={claiming}
            className="w-full py-3 rounded-xl font-bold text-sm text-[#0d2b2b] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)' }}>
            {claiming ? 'Claiming...' : `Claim Rs${dailyBonus?.nextBonus || 10} Bonus`}
          </button>
        )}

        {bonusMessage && (
          <p className="text-center text-xs mt-2 font-bold" style={{ color: bonusMessage.includes('claimed') || bonusMessage.includes('!') ? '#ffd700' : '#ff4444' }}>
            {bonusMessage}
          </p>
        )}
      </div>

      {/* Challenges */}
      <div className="mx-4">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#ffd700]" /> Challenges
        </h3>
        <div className="space-y-2">
          {[
            { title: 'Login Streak', progress: streak, target: 7, reward: 'Rs100', icon: Flame, color: '#ff5722' },
            { title: 'Daily Login', progress: dailyBonus?.claimedToday ? 1 : 0, target: 1, reward: 'Rs10', icon: Gift, color: '#ffd700' },
          ].map(c => {
            const pct = Math.min(100, (c.progress / c.target) * 100)
            return (
              <div key={c.title} className="p-3 rounded-xl" style={{ background: '#0f3535', border: '1px solid #1a4a4a' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <c.icon className="w-4 h-4" style={{ color: c.color }} />
                    <span className="text-white text-sm font-bold">{c.title}</span>
                  </div>
                  <span className="text-[#00c851] text-xs font-bold">{c.reward}</span>
                </div>
                <div className="w-full h-2 rounded-full mb-1" style={{ background: '#1a4a4a' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? 'linear-gradient(135deg, #ffd700, #ff8c00)' : 'linear-gradient(135deg, #00c851, #00a344)' }} />
                </div>
                <span className="text-[10px] text-[#6b8888]">{c.progress}/{c.target}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
