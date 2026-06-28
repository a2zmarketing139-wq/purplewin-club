import { useState, useEffect, useCallback } from 'react'

const banners = [
  { id: 1, title: 'Daily Salary Rules', subtitle: 'Earn daily rewards', color: '#ff6b35' },
  { id: 2, title: 'Spin & Win', subtitle: 'Jackpot awaits you', color: '#ffd700' },
  { id: 3, title: 'New Member Bonus', subtitle: 'Get 100% Welcome Bonus', color: '#00c851' },
  { id: 4, title: 'Lucky Draw', subtitle: 'Win big prizes daily', color: '#e040fb' },
  { id: 5, title: 'Refer & Earn', subtitle: 'Invite friends, earn rewards', color: '#00bcd4' },
]

export default function GameBanner() {
  const [active, setActive] = useState(0)

  const next = useCallback(() => {
    setActive(prev => (prev + 1) % banners.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 3500)
    return () => clearInterval(timer)
  }, [next])

  return (
    <div className="px-4 py-3">
      <div className="relative rounded-xl overflow-hidden" style={{ height: '180px' }}>
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className="absolute inset-0 transition-all duration-500 ease-in-out flex items-center justify-center"
            style={{
              opacity: i === active ? 1 : 0,
              transform: `scale(${i === active ? 1 : 1.05})`,
              background: `linear-gradient(135deg, ${banner.color}22, ${banner.color}44)`,
              border: `1px solid ${banner.color}33`,
            }}
          >
            <div className="text-center px-6">
              <div className="text-3xl mb-2">🐉</div>
              <h2 className="text-xl font-bold mb-1" style={{ color: banner.color }}>
                {banner.title}
              </h2>
              <p className="text-sm text-[#a0b8b8]">{banner.subtitle}</p>
              <div className="mt-3 inline-block px-4 py-1.5 rounded-full text-xs font-bold text-black"
                style={{ background: `linear-gradient(135deg, ${banner.color}, ${banner.color}cc)` }}>
                Claim Now
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-3 right-3 w-16 h-16 rounded-full opacity-20"
              style={{ background: banner.color }} />
            <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full opacity-15"
              style={{ background: banner.color }} />
            <div className="absolute top-1/2 right-8 text-2xl opacity-30 animate-float">🎁</div>
          </div>
        ))}
        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: i === active ? '#00c851' : '#ffffff44',
                width: i === active ? '20px' : '8px',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}