import { useState, useCallback } from 'react'
import { ArrowLeft, Zap } from 'lucide-react'
import { api } from '../lib/api'

interface ChickenRoadPageProps {
  balance: number
  setBalance: (b: number) => void
  onBack: () => void
}

const BET_AMOUNTS = [10, 50, 100, 500]
const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', color: '#00c851', fireCount: 2, steps: 8 },
  { id: 'medium', label: 'Medium', color: '#ffd700', fireCount: 3, steps: 10 },
  { id: 'hard', label: 'Hard', color: '#ff5722', fireCount: 5, steps: 12 },
  { id: 'hardcore', label: 'Hardcore', color: '#ef4444', fireCount: 8, steps: 15 },
]

export default function ChickenRoadPage({ balance, setBalance, onBack }: ChickenRoadPageProps) {
  const [betAmount, setBetAmount] = useState(100)
  const [difficulty, setDifficulty] = useState('medium')
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'crashed' | 'won'>('idle')
  const [sessionId, setSessionId] = useState('')
  const [step, setStep] = useState(0)
  const [multiplier, setMultiplier] = useState(1.0)
  const [totalSteps, setTotalSteps] = useState(10)
  const [winAmount, setWinAmount] = useState(0)
  const [message, setMessage] = useState('')
  const [steps, setSteps] = useState<('safe' | 'fire' | 'unknown')[]>([])

  const diffInfo = DIFFICULTIES.find(d => d.id === difficulty)!

  const startGame = async () => {
    if (balance < betAmount) { setMessage('Insufficient balance!'); setTimeout(() => setMessage(''), 2000); return }
    try {
      const res: any = await api.request('POST', '/chicken/start', { amount: betAmount, difficulty })
      if (res.ok) {
        setBalance(res.data.balance)
        setSessionId(res.data.sessionId)
        setTotalSteps(res.data.totalSteps)
        setStep(0)
        setMultiplier(1.0)
        setGameState('playing')
        setWinAmount(0)
        setMessage('')
        setSteps(Array(res.data.totalSteps).fill('unknown'))
      } else {
        setMessage(res.error || 'Failed'); setTimeout(() => setMessage(''), 2000)
      }
    } catch (e: any) {
      setMessage(e.message || 'Failed'); setTimeout(() => setMessage(''), 2000)
    }
  }

  const takeStep = async () => {
    try {
      const res: any = await api.request('POST', '/chicken/step', { sessionId })
      if (res.ok) {
        setStep(res.data.step)
        setMultiplier(res.data.multiplier)
        setSteps(prev => {
          const next = [...prev]
          next[res.data.step - 1] = res.data.status === 'crashed' ? 'fire' : 'safe'
          return next
        })

        if (res.data.status === 'crashed') {
          setGameState('crashed')
          setMessage('🔥 Chicken hit fire! Bet lost!')
          setTimeout(() => setMessage(''), 3000)
        } else if (res.data.completed) {
          // Auto cashout at max
          handleCashout()
        }
      } else {
        setMessage(res.error || 'Failed'); setTimeout(() => setMessage(''), 2000)
      }
    } catch (e: any) {
      setMessage(e.message || 'Failed'); setTimeout(() => setMessage(''), 2000)
    }
  }

  const handleCashout = async () => {
    try {
      const res: any = await api.request('POST', '/chicken/cashout', { sessionId })
      if (res.ok) {
        setBalance(res.data.balance)
        setWinAmount(res.data.winAmount)
        setMultiplier(res.data.multiplier)
        setGameState('won')
        setMessage(`🎉 Won Rs${res.data.winAmount} at ${res.data.multiplier}x!`)
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(res.error || 'Failed'); setTimeout(() => setMessage(''), 2000)
      }
    } catch (e: any) {
      setMessage(e.message || 'Failed'); setTimeout(() => setMessage(''), 3000)
    }
  }

  const resetGame = () => {
    setGameState('idle')
    setStep(0)
    setMultiplier(1.0)
    setWinAmount(0)
    setSteps([])
    setSessionId('')
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b)' }}>
      {/* Header */}
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#163d3d' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="ml-3 text-white font-bold text-lg">Chicken Road</span>
        <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: '#ffd70022', color: '#ffd700' }}>HOT</span>
        <div className="ml-auto flex items-center gap-1 text-[#a0b8b8] text-sm">
          <Zap className="w-3 h-3 text-[#ffd700]" />
          Rs{balance.toFixed(2)}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mx-4 mb-3 px-4 py-2.5 rounded-xl text-center text-sm font-bold"
          style={{
            background: message.includes('Won') || message.includes('🎉') ? '#22c55e22' : message.includes('fire') || message.includes('Lost') ? '#ef444422' : '#ffd70022',
            border: `1px solid ${message.includes('Won') || message.includes('🎉') ? '#22c55e' : message.includes('fire') ? '#ef4444' : '#ffd700'}`,
            color: message.includes('Won') || message.includes('🎉') ? '#22c55e' : message.includes('fire') ? '#ef4444' : '#ffd700',
          }}>
          {message}
        </div>
      )}

      {/* Game Board */}
      <div className="mx-4 mb-4 rounded-2xl p-4 relative" style={{ background: '#0f2828', border: '1px solid #1a4a4a', minHeight: '200px' }}>
        {gameState === 'idle' ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">🐔</p>
            <p className="text-white font-bold text-lg mb-1">Chicken Road</p>
            <p className="text-[#6b8888] text-xs mb-4">Help the chicken cross the road! Each step = higher multiplier.</p>
            <p className="text-[#6b8888] text-[10px]">Cashout anytime before hitting 🔥</p>
          </div>
        ) : (
          <>
            {/* Multiplier display */}
            <div className="text-center mb-4">
              {gameState === 'crashed' ? (
                <p className="text-4xl font-black text-red-500">🔥 BURNED!</p>
              ) : gameState === 'won' ? (
                <div>
                  <p className="text-4xl font-black text-[#ffd700]">{multiplier}x</p>
                  <p className="text-[#ffd700] text-sm font-bold">+Rs{winAmount}</p>
                </div>
              ) : (
                <p className="text-5xl font-black" style={{ color: multiplier >= 5 ? '#ffd700' : multiplier >= 3 ? '#00c851' : '#fff', textShadow: `0 0 20px ${multiplier >= 5 ? '#ffd70044' : '#9333ea44'}` }}>
                  {multiplier}x
                </p>
              )}
            </div>

            {/* Road / Steps */}
            <div className="flex flex-wrap gap-1.5 justify-center mb-4">
              {steps.map((s, i) => (
                <div key={i}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-300"
                  style={{
                    background: s === 'safe' ? '#00c85122' : s === 'fire' ? '#ef444422' : i < step ? '#9333ea22' : '#1a4a4a',
                    border: `1px solid ${s === 'safe' ? '#00c851' : s === 'fire' ? '#ef4444' : i === step ? '#9333ea' : '#1a4a4a'}`,
                    transform: i === step && gameState === 'playing' ? 'scale(1.1)' : 'scale(1)',
                  }}>
                  {s === 'safe' ? '✅' : s === 'fire' ? '🔥' : i < step ? '🐔' : i === step && gameState === 'playing' ? '🍗' : '🟫'}
                </div>
              ))}
            </div>

            {/* Step indicator */}
            <div className="text-center">
              <p className="text-[#a0b8b8] text-xs">Step {step} / {totalSteps}</p>
              <div className="w-full h-2 rounded-full mt-2" style={{ background: '#1a4a4a' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${(step / totalSteps) * 100}%`, background: `linear-gradient(90deg, ${diffInfo.color}, #ffd700)` }} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      {gameState === 'idle' && (
        <>
          {/* Difficulty */}
          <div className="mx-4 mb-4">
            <p className="text-white font-bold text-sm mb-2">Difficulty</p>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTIES.map(d => (
                <button key={d.id} onClick={() => setDifficulty(d.id)}
                  className="py-2.5 rounded-xl text-xs font-bold text-center"
                  style={{ background: difficulty === d.id ? `${d.color}22` : '#0f3535', border: difficulty === d.id ? `2px solid ${d.color}` : '1px solid #1a4a4a', color: difficulty === d.id ? d.color : '#6b8888' }}>
                  {d.label}
                  <span className="block text-[8px] mt-0.5 opacity-70">{d.fireCount} fires</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bet Amount */}
          <div className="mx-4 mb-4">
            <p className="text-white font-bold text-sm mb-2">Bet Amount</p>
            <div className="grid grid-cols-4 gap-2">
              {BET_AMOUNTS.map(amt => (
                <button key={amt} onClick={() => setBetAmount(amt)}
                  className="py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: betAmount === amt ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : '#0f3535', border: betAmount === amt ? 'none' : '1px solid #1a4a4a', color: '#fff' }}>
                  Rs{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <div className="mx-4 mb-4">
            <button onClick={startGame} disabled={balance < betAmount}
              className="w-full py-4 rounded-xl font-bold text-lg text-white disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)', color: '#0d2b2b' }}>
              Start Game — Rs{betAmount}
            </button>
          </div>
        </>
      )}

      {gameState === 'playing' && (
        <div className="mx-4 mb-4 flex gap-3">
          <button onClick={handleCashout} disabled={step === 0}
            className="flex-1 py-4 rounded-xl font-bold text-lg text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #00c851, #00a344)' }}>
            💰 Cashout Rs{Math.round(betAmount * multiplier)}
          </button>
          <button onClick={takeStep}
            className="flex-1 py-4 rounded-xl font-bold text-lg"
            style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)', color: '#0d2b2b' }}>
            🍗 Next Step
          </button>
        </div>
      )}

      {(gameState === 'crashed' || gameState === 'won') && (
        <div className="mx-4 mb-4">
          <button onClick={resetGame}
            className="w-full py-4 rounded-xl font-bold text-lg text-white"
            style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)' }}>
            Play Again
          </button>
        </div>
      )}

      {/* How to play */}
      <div className="mx-4 p-4 rounded-xl" style={{ background: '#0f3535', border: '1px solid #1a4a4a' }}>
        <p className="text-white font-bold text-sm mb-2">How to Play</p>
        <div className="space-y-1.5 text-[10px] text-[#a0b8b8]">
          <p>🐔 Click <b>Next Step</b> to move the chicken forward</p>
          <p>📈 Each step increases your multiplier</p>
          <p>🔥 If the chicken hits fire = <b style={{ color: '#ef4444' }}>YOU LOSE</b></p>
          <p>💰 Click <b>Cashout</b> anytime to take your winnings</p>
          <p>⚡ Hardcore mode: more fires but much higher multipliers!</p>
        </div>
      </div>
    </div>
  )
}
