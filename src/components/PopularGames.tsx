import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const games = [
  { name: 'Wingo', tag: 'HOT', color: '#00c851', icon: '🎱', players: '12.5K' },
  { name: 'Money Coming', tag: 'NEW', color: '#ffd700', icon: '💰', players: '8.2K' },
  { name: 'Fortune Gems', tag: 'HOT', color: '#ff6b35', icon: '💎', players: '15.1K' },
  { name: 'Plinko', tag: 'HOT', color: '#e040fb', icon: '🎯', players: '9.8K' },
  { name: 'Mines', tag: 'NEW', color: '#00bcd4', icon: '💣', players: '7.3K' },
  { name: 'Dice', tag: 'HOT', color: '#ff9800', icon: '🎲', players: '11.2K' },
]

export default function PopularGames() {
  const [offset, setOffset] = useState(0)

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-[#00c851]" />
          <h3 className="text-white font-bold text-lg">Popular</h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-black"
            style={{ background: 'linear-gradient(135deg, #00c851, #00a344)' }}>
            More {games.length + 1180}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setOffset(Math.max(0, offset - 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#1a4a4a' }}>
            <ChevronLeft className="w-4 h-4 text-[#00c851]" />
          </button>
          <button
            onClick={() => setOffset(Math.min(games.length - 3, offset + 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#00c851' }}>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {games.slice(offset, offset + 3).map(game => (
          <div key={game.name} className="gaming-card cursor-pointer group">
            <div className="aspect-square flex flex-col items-center justify-center p-3 relative"
              style={{
                background: `linear-gradient(135deg, ${game.color}22, ${game.color}11)`,
              }}>
              <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">{game.icon}</span>
              <span className="text-white font-bold text-sm text-center leading-tight">{game.name}</span>
              <span className="text-[10px] mt-1" style={{ color: game.color }}>{game.players} playing</span>
              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold text-black"
                style={{ background: game.color }}>
                {game.tag}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}