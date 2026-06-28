const categories = [
  { name: 'Slot', color: '#ff4444', bgColor: '#ff4444', icon: (
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <rect x="5" y="8" width="30" height="24" rx="4" fill="none" stroke="#ffd700" strokeWidth="1.5" />
      <rect x="12" y="14" width="5" height="10" rx="1" fill="#ff4444" />
      <rect x="17.5" y="14" width="5" height="10" rx="1" fill="#ffd700" />
      <rect x="23" y="14" width="5" height="10" rx="1" fill="#00c851" />
      <circle cx="12" cy="8" r="3" fill="#ffd700" />
      <circle cx="20" cy="8" r="3" fill="#ffd700" />
      <circle cx="28" cy="8" r="3" fill="#ffd700" />
    </svg>
  )},
  { name: 'Original', color: '#ffd700', bgColor: '#ffd700', icon: (
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <rect x="10" y="10" width="20" height="20" rx="4" fill="none" stroke="#ffd700" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="2" fill="#ffd700" />
      <circle cx="24" cy="16" r="2" fill="#ffd700" />
      <circle cx="16" cy="24" r="2" fill="#ffd700" />
      <circle cx="24" cy="24" r="2" fill="#ffd700" />
      <circle cx="20" cy="20" r="2" fill="#ffd700" />
      <circle cx="16" cy="20" r="2" fill="#ffd700" />
      <circle cx="24" cy="20" r="2" fill="#ffd700" />
    </svg>
  )},
  { name: 'Lottery', color: '#9333ea', bgColor: '#9333ea', icon: (
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <defs><radialGradient id="lb1" cx="35%" cy="35%"><stop offset="0%" stopColor="#ff6666" /><stop offset="100%" stopColor="#cc0000" /></radialGradient></defs>
      <defs><radialGradient id="lb2" cx="35%" cy="35%"><stop offset="0%" stopColor="#66ff66" /><stop offset="100%" stopColor="#00aa00" /></radialGradient></defs>
      <defs><radialGradient id="lb3" cx="35%" cy="35%"><stop offset="0%" stopColor="#8888ff" /><stop offset="100%" stopColor="#3333cc" /></radialGradient></defs>
      <circle cx="14" cy="18" r="9" fill="url(#lb1)" />
      <text x="14" y="22" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">3</text>
      <circle cx="26" cy="18" r="9" fill="url(#lb2)" />
      <text x="26" y="22" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">7</text>
      <circle cx="20" cy="28" r="9" fill="url(#lb3)" />
      <text x="20" y="32" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">1</text>
    </svg>
  )},
  { name: 'Crash', color: '#ff9800', bgColor: '#ff9800', icon: (
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <line x1="5" y1="35" x2="35" y2="5" stroke="#00c851" strokeWidth="2" />
      <polygon points="30,5 35,8 32,12" fill="#ffd700" transform="rotate(-45, 32, 8)" />
      <circle cx="32" cy="7" r="5" fill="#ffd700" opacity="0.3" />
      <text x="8" y="32" fill="#ff9800" fontSize="8" fontWeight="bold">x2.5</text>
    </svg>
  )},
  { name: 'Casino', color: '#00c851', bgColor: '#00c851', icon: (
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <rect x="8" y="10" width="12" height="18" rx="2" fill="white" transform="rotate(-8, 14, 19)" />
      <text x="14" y="22" textAnchor="middle" fill="#cc0000" fontSize="10" fontWeight="bold" transform="rotate(-8, 14, 19)">A♠</text>
      <rect x="18" y="10" width="12" height="18" rx="2" fill="white" transform="rotate(8, 24, 19)" />
      <text x="24" y="22" textAnchor="middle" fill="#cc0000" fontSize="10" fontWeight="bold" transform="rotate(8, 24, 19)">K♥</text>
    </svg>
  )},
  { name: 'Fishing', color: '#00bcd4', bgColor: '#00bcd4', icon: (
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <path d="M8,20 Q15,12 22,20 Q15,28 8,20Z" fill="#00bcd4" />
      <circle cx="18" cy="19" r="1.5" fill="white" />
      <circle cx="18" cy="19" r="0.7" fill="black" />
      <path d="M22,20 L30,16 L30,24Z" fill="#00bcd4" opacity="0.8" />
      <line x1="6" y1="20" x2="4" y2="18" stroke="#ffd700" strokeWidth="1" />
      <line x1="4" y1="18" x2="3" y2="12" stroke="#ffd700" strokeWidth="0.8" />
      <circle cx="3" cy="12" r="1" fill="#ffd700" />
    </svg>
  )},
]

export default function CategoryIcons() {
  return (
    <div className="px-4 mb-4">
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {categories.map(cat => (
          <button
            key={cat.name}
            className="flex flex-col items-center gap-1.5 min-w-[64px]"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center relative"
              style={{
                background: `linear-gradient(135deg, ${cat.bgColor}33, ${cat.bgColor}11)`,
                border: `2px solid ${cat.bgColor}55`,
                boxShadow: `0 0 12px ${cat.bgColor}22`,
              }}>
              {cat.icon}
              <div className="absolute inset-0 rounded-full animate-shimmer" />
            </div>
            <span className="text-xs text-[#a0b8b8] font-medium">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
