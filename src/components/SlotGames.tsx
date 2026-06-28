import { useState } from 'react'
import GameThumbnail from './GameThumbnail'

const providers = ['All', 'PG', 'JILI', 'Pragmatic', 'CQ9', 'NetEnt']
const slotGames = [
  { name: 'Fortune Tiger', provider: 'PG', color: '#ff9800' },
  { name: 'Mahjong Ways', provider: 'PG', color: '#00c851' },
  { name: 'Super Ace', provider: 'PG', color: '#ffd700' },
  { name: 'Candy Bonanza', provider: 'PG', color: '#e040fb' },
  { name: 'Gates of Olympus', provider: 'Pragmatic', color: '#00bcd4' },
  { name: 'Starlight Princess', provider: 'Pragmatic', color: '#ff6b35' },
  { name: 'Bounty Gold', provider: 'JILI', color: '#ffd700' },
  { name: 'Golden Empire', provider: 'JILI', color: '#ff9800' },
  { name: 'Boxing King', provider: 'JILI', color: '#f44336' },
  { name: 'Fa Cai Shen', provider: 'CQ9', color: '#ff5722' },
  { name: 'God of Martial Arts', provider: 'CQ9', color: '#9c27b0' },
  { name: 'Zeus', provider: 'NetEnt', color: '#2196f3' },
]

export default function SlotGames() {
  const [activeProvider, setActiveProvider] = useState('All')

  const filtered = activeProvider === 'All'
    ? slotGames
    : slotGames.filter(g => g.provider === activeProvider)

  return (
    <div className="px-4 mb-24">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 rounded-full bg-[#ffd700]" />
        <h3 className="text-white font-bold text-lg">Slot</h3>
      </div>

      {/* Provider tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar pb-1">
        {providers.map(p => (
          <button
            key={p}
            onClick={() => setActiveProvider(p)}
            className="px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all"
            style={{
              background: activeProvider === p
                ? 'linear-gradient(135deg, #ffd700, #ffaa00)'
                : '#163d3d',
              color: activeProvider === p ? '#0d2b2b' : '#a0b8b8',
              border: activeProvider === p ? 'none' : '1px solid #1a4a4a',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Game grid */}
      <div className="grid grid-cols-3 gap-2">
        {filtered.map(game => (
          <div key={game.name} className="gaming-card cursor-pointer group relative overflow-hidden rounded-xl"
            style={{ boxShadow: `0 0 15px ${game.color}11` }}>
            <GameThumbnail game={game.name} className="w-full aspect-[4/3]" />
            {/* Overlay */}
            <div className="absolute inset-x-0 bottom-0 px-2 py-1.5"
              style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
              <span className="text-white text-[10px] font-bold text-center leading-tight block">{game.name}</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full inline-block mt-0.5"
                style={{ background: `${game.color}33`, color: game.color }}>
                {game.provider}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}