import React from 'react'

interface GameThumbnailProps {
  game: string
  className?: string
}

// Individual SVG renderers for each game
const thumbnails: Record<string, (w: number, h: number) => React.ReactElement> = {

  // ═══════ WINGO ═══════
  Wingo: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="wg-bg" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#1a237e" />
          <stop offset="100%" stopColor="#0a0e2a" />
        </radialGradient>
        <radialGradient id="wg-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
        </radialGradient>
        <filter id="wg-blur"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      <rect width={w} height={h} fill="url(#wg-bg)" />
      {/* Sparkles */}
      {[...Array(12)].map((_, i) => (
        <circle key={i} cx={20 + Math.random() * (w - 40)} cy={10 + Math.random() * (h - 40)}
          r={0.5 + Math.random()} fill="#ffd700" opacity={0.3 + Math.random() * 0.5} />
      ))}
      {/* Glow */}
      <ellipse cx={w * 0.5} cy={h * 0.45} rx="50" ry="40" fill="url(#wg-glow)" />
      {/* Red ball */}
      <circle cx={w * 0.25} cy={h * 0.38} r="22" fill="url(#wg-rball)" filter="url(#wg-blur)" opacity="0.15" />
      <circle cx={w * 0.25} cy={h * 0.38} r="20">
        <animate attributeName="cy" values={`${h * 0.38};${h * 0.35};${h * 0.38}`} dur="3s" repeatCount="indefinite" />
      </circle>
      <defs><radialGradient id="wg-rball" cx="35%" cy="35%"><stop offset="0%" stopColor="#ff6666" /><stop offset="100%" stopColor="#cc0000" /></radialGradient></defs>
      <circle cx={w * 0.25} cy={h * 0.38} r="20" fill="none" stroke="#ff4444" strokeWidth="1" opacity="0.5">
        <animate attributeName="cy" values={`${h * 0.38};${h * 0.35};${h * 0.38}`} dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx={w * 0.25} cy={h * 0.38} r="18" fill="#cc0000">
        <animate attributeName="cy" values={`${h * 0.38};${h * 0.35};${h * 0.38}`} dur="3s" repeatCount="indefinite" />
      </circle>
      <text x={w * 0.25} y={h * 0.38 + 6} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">
        <animate attributeName="y" values={`${h * 0.38 + 6};${h * 0.35 + 6};${h * 0.38 + 6}`} dur="3s" repeatCount="indefinite" />
        3
      </text>
      {/* Green ball */}
      <defs><radialGradient id="wg-gball" cx="35%" cy="35%"><stop offset="0%" stopColor="#66ff66" /><stop offset="100%" stopColor="#00aa00" /></radialGradient></defs>
      <circle cx={w * 0.5} cy={h * 0.3} r="18" fill="#00aa00">
        <animate attributeName="cy" values={`${h * 0.3};${h * 0.27};${h * 0.3}`} dur="2.5s" repeatCount="indefinite" />
      </circle>
      <text x={w * 0.5} y={h * 0.3 + 6} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">
        <animate attributeName="y" values={`${h * 0.3 + 6};${h * 0.27 + 6};${h * 0.3 + 6}`} dur="2.5s" repeatCount="indefinite" />
        7
      </text>
      {/* Violet ball */}
      <defs><radialGradient id="wg-vball" cx="35%" cy="35%"><stop offset="0%" stopColor="#e080ff" /><stop offset="100%" stopColor="#9333ea" /></radialGradient></defs>
      <circle cx={w * 0.72} cy={h * 0.42} r="20" fill="#9333ea">
        <animate attributeName="cy" values={`${h * 0.42};${h * 0.39};${h * 0.42}`} dur="3.5s" repeatCount="indefinite" />
      </circle>
      <text x={w * 0.72} y={h * 0.42 + 6} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">
        <animate attributeName="y" values={`${h * 0.42 + 6};${h * 0.39 + 6};${h * 0.42 + 6}`} dur="3.5s" repeatCount="indefinite" />
        0
      </text>
      {/* Title */}
      <text x={w * 0.5} y={h * 0.75} textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="Arial" style={{ textShadow: '0 0 10px #ffd700' }}>
        WINGO
      </text>
      <text x={w * 0.5} y={h * 0.75} textAnchor="middle" fill="#ffd700" fontSize="22" fontWeight="900" fontFamily="Arial" opacity="0.3">
        WINGO
      </text>
      <text x={w * 0.5} y={h * 0.9} textAnchor="middle" fill="#ffd700" fontSize="10" fontWeight="bold" fontFamily="Arial" opacity="0.8">
        Win Up To 9x
      </text>
    </svg>
  ),

  // ═══════ AVIATOR ═══════
  Aviator: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="av-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0e2a" />
          <stop offset="100%" stopColor="#1a1a3a" />
        </linearGradient>
        <linearGradient id="av-line" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#00c851" stopOpacity="0" />
          <stop offset="50%" stopColor="#00c851" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffd700" />
        </linearGradient>
        <filter id="av-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width={w} height={h} fill="url(#av-bg)" />
      {/* Stars */}
      {[...Array(20)].map((_, i) => (
        <circle key={i} cx={Math.random() * w} cy={Math.random() * h * 0.5} r={0.3 + Math.random() * 0.8} fill="white" opacity={0.2 + Math.random() * 0.6} />
      ))}
      {/* Crash zone glow */}
      <rect x="0" y={h * 0.85} width={w} height={h * 0.15} fill="#ff4400" opacity="0.15" />
      <rect x="0" y={h * 0.9} width={w} height={h * 0.1} fill="#ff4400" opacity="0.1" />
      {/* Graph line going up */}
      <polyline points={`0,${h * 0.85} ${w * 0.15},${h * 0.7} ${w * 0.3},${h * 0.55} ${w * 0.5},${h * 0.35} ${w * 0.7},${h * 0.2} ${w * 0.85},${h * 0.12}`}
        fill="none" stroke="url(#av-line)" strokeWidth="3" strokeLinecap="round" filter="url(#av-glow)" />
      {/* Glow under line */}
      <polyline points={`0,${h * 0.85} ${w * 0.15},${h * 0.7} ${w * 0.3},${h * 0.55} ${w * 0.5},${h * 0.35} ${w * 0.7},${h * 0.2} ${w * 0.85},${h * 0.12} ${w * 0.85},${h} 0,${h}`}
        fill="#00c851" opacity="0.06" />
      {/* Airplane */}
      <g transform={`translate(${w * 0.72}, ${h * 0.12}) rotate(-25)`} filter="url(#av-glow)">
        <polygon points="0,-12 -6,6 0,3 6,6" fill="white" opacity="0.95" />
        <polygon points="-4,0 -12,6 -6,4" fill="white" opacity="0.7" />
        <polygon points="4,0 12,6 6,4" fill="white" opacity="0.7" />
        <polygon points="0,3 -2,8 2,8" fill="#ff8800" opacity="0.8" />
      </g>
      {/* Multiplier */}
      <text x={w * 0.35} y={h * 0.42} fill="#00c851" fontSize="28" fontWeight="900" fontFamily="Arial" filter="url(#av-glow)" opacity="0.9">
        x2.50
      </text>
      {/* Title */}
      <text x={w * 0.5} y={h * 0.95} textAnchor="middle" fill="white" fontSize="20" fontWeight="900" fontFamily="Arial" letterSpacing="3">
        AVIATOR
      </text>
    </svg>
  ),

  // ═══════ CHICKEN ROAD ═══════
  'Chicken Road': (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="cr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a148c" />
          <stop offset="100%" stopColor="#1a237e" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#cr-bg)" />
      {/* Road */}
      <rect x={w * 0.1} y={h * 0.5} width={w * 0.8} height={h * 0.2} rx="4" fill="#333" />
      <line x1={w * 0.15} y1={h * 0.6} x2={w * 0.85} y2={h * 0.6} stroke="#ffd700" strokeWidth="1" strokeDasharray="8 6" />
      {/* Ovens */}
      {[0.15, 0.35, 0.55, 0.75, 0.9].map((x, i) => (
        <g key={i} transform={`translate(${w * x}, ${h * 0.52})`}>
          <rect x="-10" y="0" width="20" height="15" rx="3" fill={i === 1 || i === 3 ? '#ff4444' : '#666'} opacity={i === 1 || i === 3 ? 0.8 : 0.4} />
          {i === 1 || i === 3 ? (
            <text x="0" y="12" textAnchor="middle" fontSize="10">🔥</text>
          ) : (
            <text x="0" y="12" textAnchor="middle" fontSize="8">⬛</text>
          )}
        </g>
      ))}
      {/* Chicken */}
      <g transform={`translate(${w * 0.3}, ${h * 0.44})`}>
        <circle cx="0" cy="-5" r="10" fill="#ffd700" />
        <circle cx="3" cy="-7" r="2" fill="white" />
        <circle cx="3" cy="-7" r="1" fill="black" />
        <polygon points="-3,-3 -8,-1 -3,0" fill="#ff8800" />
        <path d="M-2,-15 Q0,-22 2,-15" fill="#ff4444" />
        <rect x="-4" y="5" width="8" height="8" rx="2" fill="#ffd700" />
        <line x1="-3" y1="13" x2="-5" y2="18" stroke="#ff8800" strokeWidth="1.5" />
        <line x1="3" y1="13" x2="5" y2="18" stroke="#ff8800" strokeWidth="1.5" />
      </g>
      {/* Multiplier */}
      <text x={w * 0.78} y={h * 0.35} fill="#ffd700" fontSize="22" fontWeight="900" fontFamily="Arial">
        x3.00
      </text>
      {/* Title */}
      <text x={w * 0.5} y={h * 0.88} textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="Arial">
        CHICKEN ROAD
      </text>
      <text x={w * 0.5} y={h * 0.97} textAnchor="middle" fill="#ffd700" fontSize="8" fontWeight="bold" fontFamily="Arial" opacity="0.8">
        Cross the road, win big!
      </text>
    </svg>
  ),

  // ═══════ TRX HASH ═══════
  'TRX Hash': (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width={w} height={h} fill="#0a1a0a" />
      {/* Matrix rain */}
      {[...Array(30)].map((_, i) => (
        <text key={i} x={5 + (i % 10) * (w / 10)} y={10 + Math.floor(i / 10) * 25 + (i % 3) * 8}
          fill="#00ff00" fontSize="8" fontFamily="monospace" opacity={0.15 + (i % 4) * 0.1}>
          {['01', '10', '11', '00', 'A3', 'FF', 'B7', '4E'][i % 8]}
        </text>
      ))}
      {/* Tron logo */}
      <g transform={`translate(${w * 0.5}, ${h * 0.4})`}>
        <polygon points="0,-20 -18,10 0,3 18,10" fill="none" stroke="#ff0000" strokeWidth="2.5" />
        <polygon points="0,-12 -10,6 0,2 10,6" fill="#ff0000" opacity="0.3" />
      </g>
      {/* Title */}
      <text x={w * 0.5} y={h * 0.72} textAnchor="middle" fill="#00ff00" fontSize="22" fontWeight="900" fontFamily="monospace" opacity="0.9">
        TRX HASH
      </text>
      <text x={w * 0.5} y={h * 0.88} textAnchor="middle" fill="#00ff00" fontSize="8" fontFamily="monospace" opacity="0.4">
        0x4a7f...e3b2 → BLOCK #88271
      </text>
    </svg>
  ),

  // ═══════ K3 LOTTERY ═══════
  'K3 Lottery': (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="k3-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a148c" />
          <stop offset="100%" stopColor="#1a237e" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#k3-bg)" />
      {[...Array(8)].map((_, i) => (
        <circle key={i} cx={10 + Math.random() * (w - 20)} cy={10 + Math.random() * (h - 20)}
          r={1 + Math.random() * 2} fill="#ffd700" opacity={0.1 + Math.random() * 0.2} />
      ))}
      {/* Dice 1 */}
      <g transform={`translate(${w * 0.2}, ${h * 0.4}) rotate(-10)`}>
        <rect x="-18" y="-18" width="36" height="36" rx="6" fill="white" />
        <circle cx="-8" cy="-8" r="3" fill="#9333ea" /><circle cx="8" cy="8" r="3" fill="#9333ea" />
        <circle cx="-8" cy="8" r="3" fill="#9333ea" /><circle cx="8" cy="-8" r="3" fill="#9333ea" />
        <circle cx="0" cy="0" r="3" fill="#9333ea" />
      </g>
      {/* Dice 2 */}
      <g transform={`translate(${w * 0.45}, ${h * 0.35}) rotate(5)`}>
        <rect x="-18" y="-18" width="36" height="36" rx="6" fill="white" />
        <circle cx="0" cy="-8" r="3" fill="#ffd700" /><circle cx="0" cy="8" r="3" fill="#ffd700" />
        <circle cx="-8" cy="0" r="3" fill="#ffd700" /><circle cx="8" cy="0" r="3" fill="#ffd700" />
      </g>
      {/* Dice 3 */}
      <g transform={`translate(${w * 0.7}, ${h * 0.42}) rotate(15)`}>
        <rect x="-18" y="-18" width="36" height="36" rx="6" fill="white" />
        <circle cx="-8" cy="-8" r="3" fill="#ff4444" /><circle cx="8" cy="8" r="3" fill="#ff4444" />
        <circle cx="0" cy="0" r="3" fill="#ff4444" /><circle cx="-8" cy="8" r="3" fill="#ff4444" />
      </g>
      {/* K3 Title */}
      <text x={w * 0.5} y={h * 0.78} textAnchor="middle" fill="white" fontSize="32" fontWeight="900" fontFamily="Arial">
        K3
      </text>
      <text x={w * 0.5} y={h * 0.78} textAnchor="middle" fill="#ffd700" fontSize="32" fontWeight="900" fontFamily="Arial" opacity="0.2">
        K3
      </text>
      <text x={w * 0.5} y={h * 0.93} textAnchor="middle" fill="#ffd700" fontSize="9" fontFamily="Arial" opacity="0.7">
        Lucky Dice
      </text>
    </svg>
  ),

  // ═══════ FAST PARITY ═══════
  'Fast Parity': (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="fp-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#cc0000" />
          <stop offset="100%" stopColor="#ff4444" />
        </linearGradient>
        <linearGradient id="fp-right" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00aa00" />
          <stop offset="100%" stopColor="#00cc44" />
        </linearGradient>
        <filter id="fp-glow"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <rect width={w / 2} height={h} fill="url(#fp-left)" />
      <rect x={w / 2} width={w / 2} height={h} fill="url(#fp-right)" />
      {/* Center lightning */}
      <line x1={w * 0.5} y1="0" x2={w * 0.5} y2={h} stroke="#ffd700" strokeWidth="3" filter="url(#fp-glow)" />
      <polygon points={`${w * 0.5 - 8},${h * 0.15} ${w * 0.5 + 4},${h * 0.4} ${w * 0.5 - 2},${h * 0.4} ${w * 0.5 + 8},${h * 0.7}`}
        fill="#ffd700" />
      {/* Timer badge */}
      <circle cx={w * 0.5} cy={h * 0.22} r="16" fill="#0a0a0a" stroke="#ffd700" strokeWidth="2" />
      <text x={w * 0.5} y={h * 0.22 + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial">30s</text>
      {/* Title */}
      <text x={w * 0.5} y={h * 0.85} textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="Arial" style={{ textShadow: '0 0 8px #ffd700' }}>
        FAST PARITY
      </text>
    </svg>
  ),

  // ═══════ 5D LOTTERY ═══════
  '5D Lottery': (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width={w} height={h} fill="#1a0a2e" />
      {[...Array(15)].map((_, i) => (
        <circle key={i} cx={Math.random() * w} cy={Math.random() * h} r={1 + Math.random() * 2} fill="#ffd700" opacity={0.1 + Math.random() * 0.15} />
      ))}
      {/* 5 balls */}
      {['#ff4444', '#00cc44', '#ffd700', '#00aaff', '#ff66ff'].map((color, i) => (
        <g key={i}>
          <defs><radialGradient id={`5d-${i}`} cx="35%" cy="35%"><stop offset="0%" stopColor={color} stopOpacity="0.9" /><stop offset="100%" stopColor={color} stopOpacity="0.5" /></radialGradient></defs>
          <circle cx={w * 0.13 + i * (w * 0.19)} cy={h * 0.4} r="16" fill={`url(#5d-${i})`} />
          <text x={w * 0.13 + i * (w * 0.19)} y={h * 0.4 + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{i}</text>
        </g>
      ))}
      <text x={w * 0.5} y={h * 0.72} textAnchor="middle" fill="white" fontSize="28" fontWeight="900" fontFamily="Arial">
        5D
      </text>
      <text x={w * 0.5} y={h * 0.72} textAnchor="middle" fill="#ffd700" fontSize="28" fontWeight="900" fontFamily="Arial" opacity="0.15">
        5D
      </text>
      <text x={w * 0.5} y={h * 0.9} textAnchor="middle" fill="#ffd700" fontSize="9" fontWeight="bold" fontFamily="Arial" opacity="0.7">
        Pick 5 Numbers Win Big!
      </text>
    </svg>
  ),

  // ═══════ PLINKO ═══════
  Plinko: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="pl-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a0845" />
          <stop offset="100%" stopColor="#1a0033" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#pl-bg)" />
      {/* Peg grid */}
      {[...Array(5)].map((_, row) =>
        [...Array(5 + row)].map((_, col) => (
          <circle key={`${row}-${col}`}
            cx={w * 0.22 + (w * 0.6 / (5 + row)) * (col + 0.5)}
            cy={h * 0.15 + row * (h * 0.1)}
            r="2" fill="#9333ea" opacity="0.6" />
        ))
      )}
      {/* Ball dropping */}
      <circle cx={w * 0.5} cy={h * 0.1} r="5" fill="#ffd700" filter="url(#pl-bg)" />
      <circle cx={w * 0.5} cy={h * 0.1} r="4" fill="#ffd700" />
      {/* Multiplier slots at bottom */}
      {['0.5x', '1x', '2x', '5x', '10x'].map((mult, i) => {
        const colors = ['#666', '#00c851', '#00aaff', '#ffd700', '#ff4444']
        return (
          <g key={i}>
            <rect x={w * 0.1 + i * (w * 0.17)} y={h * 0.7} width={w * 0.15} height={h * 0.12} rx="3" fill={colors[i]} opacity="0.3" />
            <text x={w * 0.1 + i * (w * 0.17) + w * 0.075} y={h * 0.78} textAnchor="middle" fill={colors[i]} fontSize="10" fontWeight="900" fontFamily="Arial">{mult}</text>
          </g>
        )
      })}
      <text x={w * 0.5} y={h * 0.95} textAnchor="middle" fill="white" fontSize="20" fontWeight="900" fontFamily="Arial">
        PLINKO
      </text>
    </svg>
  ),

  // ═══════ MINES ═══════
  Mines: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width={w} height={h} fill="#1a0a0a" />
      {/* Grid */}
      {[...Array(5)].map((_, row) =>
        [...Array(5)].map((_, col) => {
          const isGem = (row + col) % 3 === 0
          const isBomb = row === 2 && col === 3
          return (
            <g key={`${row}-${col}`}>
              <rect x={w * 0.08 + col * (w * 0.17)} y={h * 0.05 + row * (h * 0.17)}
                width={w * 0.15} height={h * 0.15} rx="4"
                fill={isBomb ? '#ff222233' : isGem ? '#00ff0011' : '#1a1a2a'}
                stroke={isBomb ? '#ff4444' : '#2a2a3a'} strokeWidth="0.5" />
              {isGem && <text x={w * 0.08 + col * (w * 0.17) + w * 0.075} y={h * 0.05 + row * (h * 0.17) + h * 0.09} textAnchor="middle" fontSize="12">💎</text>}
              {isBomb && <text x={w * 0.08 + col * (w * 0.17) + w * 0.075} y={h * 0.05 + row * (h * 0.17) + h * 0.09} textAnchor="middle" fontSize="12">💣</text>}
            </g>
          )
        })
      )}
      <text x={w * 0.5} y={h * 0.95} textAnchor="middle" fill="#ff4444" fontSize="20" fontWeight="900" fontFamily="Arial" style={{ textShadow: '0 0 8px #ff4444' }}>
        MINES
      </text>
    </svg>
  ),

  // ═══════ MONEY COMING ═══════
  'Money Coming': (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="mc-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a4a0a" />
          <stop offset="100%" stopColor="#0a2a0a" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#mc-bg)" />
      {/* Coins flying */}
      {[...Array(10)].map((_, i) => (
        <g key={i}>
          <circle cx={w * 0.1 + Math.random() * w * 0.8} cy={h * 0.1 + Math.random() * h * 0.4} r={4 + Math.random() * 4} fill="#ffd700" opacity={0.3 + Math.random() * 0.4} />
          <text x={w * 0.1 + Math.random() * w * 0.8} y={h * 0.1 + Math.random() * h * 0.4 + 3} textAnchor="middle" fill="#aa8800" fontSize="5" fontWeight="bold">$</text>
        </g>
      ))}
      {/* Slot reels */}
      {[0.25, 0.5, 0.75].map((x, i) => (
        <g key={i}>
          <rect x={w * x - 16} y={h * 0.2} width="32" height="40" rx="4" fill="#1a3a1a" stroke="#ffd700" strokeWidth="1" />
          <text x={w * x} y={h * 0.46} textAnchor="middle" fontSize="22">
            {['💰', '💎', '7️⃣'][i]}
          </text>
        </g>
      ))}
      <text x={w * 0.5} y={h * 0.82} textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="Arial">
        MONEY COMING
      </text>
      <text x={w * 0.5} y={h * 0.93} textAnchor="middle" fill="#ffd700" fontSize="8" fontWeight="bold" fontFamily="Arial" opacity="0.7">
        💰 Spin & Win 💰
      </text>
    </svg>
  ),

  // ═══════ FORTUNE GEMS ═══════
  'Fortune Gems': (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="fg-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a0a2e" />
          <stop offset="100%" stopColor="#0a0a1a" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#fg-bg)" />
      {/* Gems */}
      <g transform={`translate(${w * 0.2}, ${h * 0.35})`}>
        <polygon points="0,-14 12,6 -12,6" fill="#ff1744" opacity="0.9" />
        <polygon points="0,-14 12,6 -12,6" fill="white" opacity="0.1" />
        <polygon points="0,-10 8,4 -8,4" fill="white" opacity="0.2" />
      </g>
      <g transform={`translate(${w * 0.5}, ${h * 0.3})`}>
        <polygon points="0,-16 14,5 -14,5" fill="#00c851" opacity="0.9" />
        <polygon points="0,-16 14,5 -14,5" fill="white" opacity="0.1" />
        <polygon points="0,-12 10,4 -10,4" fill="white" opacity="0.2" />
      </g>
      <g transform={`translate(${w * 0.8}, ${h * 0.35})`}>
        <polygon points="0,-14 12,6 -12,6" fill="#2196f3" opacity="0.9" />
        <polygon points="0,-14 12,6 -12,6" fill="white" opacity="0.1" />
        <polygon points="0,-10 8,4 -8,4" fill="white" opacity="0.2" />
      </g>
      {/* Sparkle */}
      {[...Array(6)].map((_, i) => (
        <line key={i} x1={w * 0.15 + i * w * 0.14} y1={h * 0.15} x2={w * 0.15 + i * w * 0.14 + 3} y2={h * 0.12}
          stroke="#ffd700" strokeWidth="0.5" opacity="0.4" />
      ))}
      <text x={w * 0.5} y={h * 0.7} textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="Arial">
        FORTUNE
      </text>
      <text x={w * 0.5} y={h * 0.85} textAnchor="middle" fill="#ffd700" fontSize="16" fontWeight="900" fontFamily="Arial">
        GEMS
      </text>
    </svg>
  ),

  // ═══════ DICE ═══════
  Dice: (w, h) => (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="di-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a148c" />
          <stop offset="100%" stopColor="#1a0a2e" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill="url(#di-bg)" />
      {/* Glow */}
      <ellipse cx={w * 0.5} cy={h * 0.4} rx="40" ry="35" fill="#ffd700" opacity="0.06" />
      {/* 3D Dice */}
      <g transform={`translate(${w * 0.5}, ${h * 0.38}) rotate(-12)`}>
        <rect x="-25" y="-25" width="50" height="50" rx="8" fill="white" />
        {/* Front face */}
        <circle cx="-12" cy="-12" r="4" fill="#9333ea" />
        <circle cx="12" cy="-12" r="4" fill="#9333ea" />
        <circle cx="0" cy="0" r="4" fill="#9333ea" />
        <circle cx="-12" cy="12" r="4" fill="#9333ea" />
        <circle cx="12" cy="12" r="4" fill="#9333ea" />
        <circle cx="-12" cy="0" r="4" fill="#9333ea" />
        <circle cx="12" cy="0" r="4" fill="#9333ea" />
      </g>
      <text x={w * 0.5} y={h * 0.82} textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="Arial">
        DICE
      </text>
    </svg>
  ),
}

// Generic fallback
const defaultThumbnail = (gameName: string, w: number, h: number) => (
  <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width={w} height={h} fill="#163d3d" />
    <text x={w / 2} y={h / 2} textAnchor="middle" fill="white" fontSize="24" fontWeight="900" fontFamily="Arial">{gameName}</text>
  </svg>
)

export default function GameThumbnail({ game, className = '' }: GameThumbnailProps) {
  const renderer = thumbnails[game] || (() => defaultThumbnail(game, 300, 200))
  return (
    <div className={`${className} overflow-hidden`}>
      {renderer(300, 200)}
    </div>
  )
}
