import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Plane, Zap } from 'lucide-react'
import { api } from '../lib/api'

interface AviatorPageProps {
  balance: number
  setBalance: (b: number) => void
  onBack: () => void
}

const BET_AMOUNTS = [10, 50, 100, 500]

export default function AviatorPage({ balance, setBalance, onBack }: AviatorPageProps) {
  const [roundId, setRoundId] = useState('')
  const [roundStatus, setRoundStatus] = useState<'waiting' | 'flying' | 'crashed'>('waiting')
  const [multiplier, setMultiplier] = useState(1.0)
  const [crashPoint, setCrashPoint] = useState(0)
  const [history, setHistory] = useState<any[]>([])
  const [bet1Amount, setBet1Amount] = useState(100)
  const [bet2Amount, setBet2Amount] = useState(100)
  const [bet1Active, setBet1Active] = useState(false)
  const [bet2Active, setBet2Active] = useState(false)
  const [bet1Id, setBet1Id] = useState('')
  const [bet2Id, setBet2Id] = useState('')
  const [bet1CashedOut, setBet1CashedOut] = useState(false)
  const [bet2CashedOut, setBet2CashedOut] = useState(false)
  const [autoCash1, setAutoCash1] = useState('')
  const [autoCash2, setAutoCash2] = useState('')
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [graphPoints, setGraphPoints] = useState<number[]>([])
  const [planeX, setPlaneX] = useState(0)
  const animRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  // Load current round
  const loadRound = useCallback(async () => {
    try {
      const res: any = await api.request('GET', '/aviator/current-round')
      if (res.ok) {
        setRoundId(res.data.round.id)
        setRoundStatus(res.data.round.status)
        setHistory(res.data.history || [])
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadRound() }, [loadRound])

  // Poll round status
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res: any = await api.request('GET', '/aviator/current-round')
        if (res.ok) {
          const newStatus = res.data.round.status
          if (newStatus !== roundStatus) {
            if (newStatus === 'waiting') {
              setMultiplier(1.0)
              setGraphPoints([])
              setPlaneX(0)
              setBet1CashedOut(false)
              setBet2CashedOut(false)
              setBet1Active(false)
              setBet2Active(false)
              setBet1Id('')
              setBet2Id('')
              setCrashPoint(0)
              setCountdown(5)
            } else if (newStatus === 'flying') {
              startFlying()
            }
            setRoundStatus(newStatus)
            setRoundId(res.data.round.id)
          }
          setHistory(res.data.history || [])
        }
      } catch { /* ignore */ }
    }, 1000)
    return () => clearInterval(poll)
  }, [roundStatus])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown(prev => {
      if (prev <= 1) { clearInterval(t); return 0 }
      return prev - 1
    }), 1000)
    return () => clearInterval(t)
  }, [countdown])

  // Flying animation
  const startFlying = useCallback(() => {
    startTimeRef.current = Date.now()
    setGraphPoints([1.0])
    setPlaneX(5)

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const growth = Math.pow(Math.E, elapsed * 0.15)
      const currentMult = Math.round(growth * 100) / 100
      setMultiplier(currentMult)
      setPlaneX(Math.min(90, 5 + (elapsed / 20) * 85))
      setGraphPoints(prev => {
        const next = [...prev, currentMult]
        return next.length > 100 ? next.slice(-100) : next
      })

      // Check auto cashout
      if (bet1Active && !bet1CashedOut && autoCash1) {
        const auto = parseFloat(autoCash1)
        if (currentMult >= auto) handleCashout('1', currentMult)
      }
      if (bet2Active && !bet2CashedOut && autoCash2) {
        const auto = parseFloat(autoCash2)
        if (currentMult >= auto) handleCashout('2', currentMult)
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
  }, [bet1Active, bet2Active, bet1CashedOut, bet2CashedOut, autoCash1, autoCash2])

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  // Place bet
  const handleBet = async (slot: '1' | '2') => {
    const amount = slot === '1' ? bet1Amount : bet2Amount
    if (balance < amount) { setMessage('Insufficient balance!'); setTimeout(() => setMessage(''), 2000); return }

    try {
      const autoCash = slot === '1' ? autoCash1 : autoCash2
      const res: any = await api.request('POST', '/aviator/bet', { amount, roundId, autoCashout: autoCash ? parseFloat(autoCash) : null })
      if (res.ok) {
        setBalance(res.data.balance)
        if (slot === '1') { setBet1Active(true); setBet1Id(res.data.betId) }
        else { setBet2Active(true); setBet2Id(res.data.betId) }
      } else {
        setMessage(res.error || 'Bet failed'); setTimeout(() => setMessage(''), 2000)
      }
    } catch (e: any) {
      setMessage(e.message || 'Bet failed'); setTimeout(() => setMessage(''), 2000)
    }
  }

  // Cashout
  const handleCashout = async (slot: string, currentMult: number) => {
    const betId = slot === '1' ? bet1Id : bet2Id
    if (!betId) return

    try {
      const res: any = await api.request('POST', '/aviator/cashout', { betId, multiplier: currentMult })
      if (res.ok) {
        setBalance(res.data.balance)
        if (slot === '1') { setBet1CashedOut(true); setBet1Active(false) }
        else { setBet2CashedOut(true); setBet2Active(false) }
        setMessage(`Cashed out at ${currentMult}x = Rs${res.data.winAmount}!`)
        setTimeout(() => setMessage(''), 3000)
      } else {
        if (res.error !== 'Round already crashed') {
          setMessage(res.error || 'Cashout failed'); setTimeout(() => setMessage(''), 2000)
        }
        if (slot === '1') setBet1Active(false)
        else setBet2Active(false)
      }
    } catch (e: any) {
      setMessage(e.message || 'Cashout failed'); setTimeout(() => setMessage(''), 2000)
    }
  }

  const maxGraph = Math.max(...graphPoints, 1)

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b)' }}>
      {/* Header */}
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#163d3d' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="ml-3 text-white font-bold text-lg">Aviator</span>
        <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: '#ffd70022', color: '#ffd700' }}>HOT</span>
        <div className="ml-auto flex items-center gap-1 text-[#a0b8b8] text-sm">
          <Zap className="w-3 h-3 text-[#ffd700]" />
          Rs{balance.toFixed(2)}
        </div>
      </div>

      {/* Game Area */}
      <div className="mx-4 mb-4 rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #0a1a1a, #0f2828)', border: '1px solid #1a4a4a', height: '260px' }}>
        {/* Background grid */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#9333ea" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Multiplier display */}
        {roundStatus === 'flying' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <p className="text-6xl font-black drop-shadow-lg" style={{ color: multiplier >= 5 ? '#ffd700' : multiplier >= 2 ? '#00c851' : '#fff', textShadow: `0 0 30px ${multiplier >= 5 ? '#ffd700' : '#9333ea'}` }}>
                {multiplier.toFixed(2)}x
              </p>
            </div>
          </div>
        )}

        {roundStatus === 'waiting' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              {countdown > 0 ? (
                <>
                  <p className="text-5xl font-black text-[#ffd700]" style={{ textShadow: '0 0 20px #ffd70066' }}>{countdown}</p>
                  <p className="text-[#a0b8b8] text-sm mt-1">Next round starting...</p>
                </>
              ) : (
                <p className="text-[#6b8888] text-sm">Place your bets!</p>
              )}
            </div>
          </div>
        )}

        {roundStatus === 'crashed' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <p className="text-5xl font-black text-red-500" style={{ textShadow: '0 0 20px #ef444466' }}>CRASHED</p>
              <p className="text-red-400 text-lg font-bold mt-1">{crashPoint}x</p>
            </div>
          </div>
        )}

        {/* Plane icon */}
        {roundStatus === 'flying' && (
          <div className="absolute z-20 transition-all duration-100" style={{ left: `${planeX}%`, bottom: `${Math.min(70, 10 + (multiplier / maxGraph) * 60)}%`, transform: 'translateX(-50%)' }}>
            <div style={{ transform: 'rotate(-30deg)' }}>
              <Plane className="w-8 h-8" style={{ color: '#9333ea', filter: 'drop-shadow(0 0 10px #9333ea)' }} />
            </div>
          </div>
        )}

        {/* Graph line */}
        {graphPoints.length > 1 && (
          <svg className="absolute inset-0 w-full h-full z-5" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9333ea" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke="#9333ea"
              strokeWidth="0.5"
              points={graphPoints.map((p, i) => `${(i / Math.max(graphPoints.length - 1, 1)) * 100},${100 - (p / maxGraph) * 80}`).join(' ')}
            />
          </svg>
        )}
      </div>

      {/* Message popup */}
      {message && (
        <div className="mx-4 mb-3 px-4 py-2.5 rounded-xl text-center text-sm font-bold" style={{ background: message.includes('!') || message.includes('Cashed') ? '#22c55e22' : '#ef444422', border: `1px solid ${message.includes('!') || message.includes('Cashed') ? '#22c55e' : '#ef4444'}`, color: message.includes('!') || message.includes('Cashed') ? '#22c55e' : '#ef4444' }}>
          {message}
        </div>
      )}

      {/* Bet Slots */}
      <div className="mx-4 grid grid-cols-2 gap-3 mb-4">
        {[{ slot: '1', amount: bet1Amount, setAmount: setBet1Amount, active: bet1Active, cashedOut: bet1CashedOut, auto: autoCash1, setAuto: setAutoCash1 },
          { slot: '2', amount: bet2Amount, setAmount: setBet2Amount, active: bet2Active, cashedOut: bet2CashedOut, auto: autoCash2, setAuto: setAutoCash2 }
        ].map(s => (
          <div key={s.slot} className="rounded-xl p-3" style={{ background: '#0f3535', border: s.active ? '1px solid #9333ea' : '1px solid #1a4a4a' }}>
            <p className="text-[#6b8888] text-[10px] mb-1">Bet {s.slot}</p>

            {/* Amount selector */}
            <div className="grid grid-cols-4 gap-1 mb-2">
              {BET_AMOUNTS.map(amt => (
                <button key={amt} onClick={() => !s.active && s.setAmount(amt)}
                  className="py-1 rounded text-[10px] font-bold disabled:opacity-50"
                  style={{ background: s.amount === amt ? '#9333ea' : '#1a4a4a', color: s.amount === amt ? '#fff' : '#6b8888' }}>
                  {amt}
                </button>
              ))}
            </div>

            {/* Auto cashout */}
            <input value={s.auto} onChange={e => s.setAuto(e.target.value)} placeholder="Auto cash (e.g. 2.0)"
              disabled={s.active}
              className="w-full px-2 py-1.5 rounded text-white text-[10px] outline-none mb-2 disabled:opacity-50"
              style={{ background: '#0a2525', border: '1px solid #1a4a4a' }} />

            {/* Bet/Cashout button */}
            {s.cashedOut ? (
              <div className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-[#ffd700]" style={{ background: '#ffd70011' }}>
                ✅ Cashed Out!
              </div>
            ) : s.active ? (
              <button onClick={() => handleCashout(s.slot, multiplier)}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #00c851, #00a344)' }}>
                Cashout ({multiplier.toFixed(2)}x) = Rs{Math.round(s.amount * multiplier)}
              </button>
            ) : (
              <button onClick={() => handleBet(s.slot)} disabled={roundStatus !== 'waiting' || balance < s.amount}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-40"
                style={{ background: roundStatus === 'waiting' ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : '#1a4a4a' }}>
                Bet Rs{s.amount}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* History */}
      <div className="mx-4">
        <p className="text-white font-bold text-sm mb-2">Recent Rounds</p>
        <div className="flex gap-2 flex-wrap">
          {history.map((h, i) => {
            const mult = h.crashMultiplier
            const isHigh = mult >= 5
            const isLow = mult < 1.5
            return (
              <div key={i} className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: isHigh ? '#ffd70022' : isLow ? '#ef444422' : '#0f3535', color: isHigh ? '#ffd700' : isLow ? '#ef4444' : '#a0b8b8' }}>
                {mult}x
              </div>
            )
          })}
          {history.length === 0 && <p className="text-[#6b8888] text-xs">No rounds yet</p>}
        </div>
      </div>
    </div>
  )
}
