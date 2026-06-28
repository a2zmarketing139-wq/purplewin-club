import { useState, useEffect } from 'react'
import { ArrowLeft, Star, ChevronRight, Gift } from 'lucide-react'
import { api } from '../lib/api'

interface VipPageProps {
  onBack: () => void
}

const vipColors: Record<number, string> = { 1: '#cd7f32', 2: '#c0c0c0', 3: '#ffd700', 4: '#e5e4e2', 5: '#b9f2ff' }

export default function VipPage({ onBack }: VipPageProps) {
  const [vipData, setVipData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.request('GET', '/vip/info').then((res: any) => {
      if (res.ok) setVipData(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b)' }}>
      <div className="text-[#6b8888] text-sm">Loading...</div>
    </div>
  )

  const current = vipData?.currentVip || { level: 1, name: 'Bronze', color: '#cd7f32', dailyBonus: 10 }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b)' }}>
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#163d3d' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="ml-3 text-white font-bold text-lg">VIP Club</span>
      </div>

      {/* Current VIP Card */}
      <div className="mx-4 mb-6 p-6 rounded-2xl relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${current.color}33, ${current.color}11)`, border: `1px solid ${current.color}44` }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
          style={{ background: current.color, transform: 'translate(30%, -30%)' }} />
        <div className="flex items-center gap-3 mb-3">
          <Star className="w-8 h-8" style={{ color: current.color }} />
          <div>
            <p className="text-[#a0b8b8] text-xs">Current Level</p>
            <p className="font-bold text-xl" style={{ color: current.color }}>VIP {vipData?.currentLevel} — {current.name}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-[#a0b8b8] mb-2">
          <span>Total Deposit: Rs{(vipData?.totalDeposit || 0).toLocaleString()}</span>
          <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Daily Bonus: Rs{current.dailyBonus}</span>
        </div>
        {vipData?.nextVip && (
          <div>
            <div className="flex items-center justify-between text-[10px] text-[#6b8888] mb-1">
              <span>Progress to VIP {vipData.nextVip.level}</span>
              <span>Rs{(vipData?.totalDeposit || 0).toLocaleString()} / Rs{vipData.nextVip.minDeposit.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: '#1a4a4a' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${vipData.progress || 0}%`, background: `linear-gradient(90deg, ${current.color}, ${vipData.nextVip.color})` }} />
            </div>
          </div>
        )}
      </div>

      {/* All VIP Levels */}
      <div className="px-4">
        <h3 className="text-white font-bold text-sm mb-3">All VIP Levels</h3>
        <div className="space-y-2">
          {(vipData?.allLevels || []).map((level: any) => {
            const isActive = level.level === vipData?.currentLevel
            const isUnlocked = level.level <= vipData?.currentLevel
            return (
              <div key={level.level}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: isActive ? `${level.color}15` : '#0f3535',
                  border: isActive ? `2px solid ${level.color}` : '1px solid #1a4a4a',
                }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: isUnlocked ? `${level.color}22` : '#1a4a4a' }}>
                  <Star className="w-6 h-6" style={{ color: isUnlocked ? level.color : '#6b8888' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm" style={{ color: isUnlocked ? '#fff' : '#6b8888' }}>
                      VIP {level.level} — {level.name}
                    </span>
                    {isActive && <span className="px-2 py-0.5 rounded text-[8px] font-bold"
                      style={{ background: level.color, color: '#0d2b2b' }}>YOU</span>}
                  </div>
                  <p className="text-[#6b8888] text-[10px]">Min Deposit: Rs{level.minDeposit.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm" style={{ color: level.color }}>Rs{level.dailyBonus}</p>
                  <p className="text-[#6b8888] text-[10px]">daily bonus</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6b8888]" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
