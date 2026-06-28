import { useState, useEffect } from 'react'
import { ArrowLeft, Trophy, Medal, Crown, TrendingUp } from 'lucide-react'
import { api } from '../lib/api'

interface LeaderboardPageProps {
  onBack: () => void
}

function maskPhone(phone: string) {
  if (!phone || phone.length < 5) return '***'
  return phone.slice(0, 3) + '***' + phone.slice(-2)
}

const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32']
const rankIcons = [Crown, Medal, Trophy]

export default function LeaderboardPage({ onBack }: LeaderboardPageProps) {
  const [tab, setTab] = useState<'today' | 'weekly'>('today')
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url = tab === 'today' ? '/leaderboard/today' : '/leaderboard/weekly'
    api.request('GET', url).then((res: any) => {
      if (res.ok) setLeaderboard(res.data.leaderboard || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [tab])

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b)' }}>
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#163d3d' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="ml-3 text-white font-bold text-lg">Leaderboard</span>
      </div>

      <div className="mx-4 mb-4 flex rounded-lg overflow-hidden" style={{ background: '#163d3d' }}>
        <button onClick={() => setTab('today')}
          className="flex-1 py-2.5 text-sm font-bold text-center transition-all"
          style={{ background: tab === 'today' ? 'linear-gradient(135deg, #ffd700, #ffaa00)' : 'transparent', color: tab === 'today' ? '#0d2b2b' : '#a0b8b8' }}>
          Today
        </button>
        <button onClick={() => setTab('weekly')}
          className="flex-1 py-2.5 text-sm font-bold text-center transition-all"
          style={{ background: tab === 'weekly' ? 'linear-gradient(135deg, #ffd700, #ffaa00)' : 'transparent', color: tab === 'weekly' ? '#0d2b2b' : '#a0b8b8' }}>
          This Week
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6b8888] text-sm">Loading...</div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12 text-[#6b8888] text-sm">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-[#6b8888] opacity-30" />
          No winners yet today. Play games to climb the leaderboard!
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {leaderboard.map((entry: any) => {
            const isTop3 = entry.rank <= 3
            const Icon = entry.rank <= 3 ? rankIcons[entry.rank - 1] : TrendingUp
            return (
              <div key={entry.userId}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: isTop3 ? `${rankColors[entry.rank - 1]}11` : '#0f3535',
                  border: isTop3 ? `1px solid ${rankColors[entry.rank - 1]}33` : '1px solid #1a4a4a',
                }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ background: isTop3 ? `${rankColors[entry.rank - 1]}22` : '#1a4a4a', color: isTop3 ? rankColors[entry.rank - 1] : '#6b8888' }}>
                  {isTop3 ? <Icon className="w-5 h-5" /> : `#${entry.rank}`}
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{entry.name}</p>
                  <p className="text-[#6b8888] text-[10px]">{maskPhone(entry.phone)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm" style={{ color: isTop3 ? '#ffd700' : '#00c851' }}>Rs{entry.totalWin.toLocaleString()}</p>
                  <p className="text-[#6b8888] text-[10px]">{entry.gamesWon} wins</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
