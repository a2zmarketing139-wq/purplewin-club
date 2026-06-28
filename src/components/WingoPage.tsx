import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Clock, TrendingUp } from 'lucide-react'
import { api } from '../lib/api'

interface WingoPageProps {
  balance: number
  setBalance: (b: number) => void
  onBack: () => void
}

const colors = [
  { name: 'Green', value: 'G', color: '#00c851', bg: '#00c85122' },
  { name: 'Violet', value: 'V', color: '#e040fb', bg: '#e040fb22' },
  { name: 'Red', value: 'R', color: '#ff4444', bg: '#ff444422' },
]

const numbers = Array.from({ length: 10 }, (_, i) => i)

function getNumberColor(n: number) {
  if (n === 0) return '#00c851'
  if (n === 5) return '#e040fb'
  if (n % 2 === 0) return '#ff4444'
  return '#00c851'
}

export default function WingoPage({ balance, setBalance, onBack }: WingoPageProps) {
  const [timer, setTimer] = useState(60)
  const [betAmount, setBetAmount] = useState(10)
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [history, setHistory] = useState<number[]>([3, 7, 0, 5, 8, 2, 9, 1, 6, 4])
  const [isRolling, setIsRolling] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setShowResult(false)
          setSelectedNumber(null)
          setSelectedColor(null)
          return 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const placeBet = async (type: 'number' | 'color', value: number | string) => {
    if (balance < betAmount || isRolling) return
    setIsRolling(true)

    try {
      const period = `2026${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}001`
      const res = await api.placeWingoBet(betAmount, type, value, period)
      if (res.ok) {
        const d = res.data
        setResult(d.result)
        setBalance(d.balance)
        setHistory(prev => [d.result, ...prev.slice(0, 9)])
        setShowResult(true)
        setTimeout(() => {
          setShowResult(false)
          setSelectedNumber(null)
          setSelectedColor(null)
        }, 3000)
      }
    } catch (err) {
      console.error('Bet failed:', err)
    }
    setIsRolling(false)
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b)' }}>
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: '#163d3d' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="ml-3 text-white font-bold text-lg">Wingo</span>
        <div className="ml-auto flex items-center gap-1 text-[#00c851] text-sm font-bold">
          <Clock className="w-4 h-4" /> {formatTime(timer)}
        </div>
      </div>

      {/* Timer & Period */}
      <div className="mx-4 mb-4 p-4 rounded-xl text-center"
        style={{ background: 'linear-gradient(135deg, #0f3535, #163d3d)', border: '1px solid #1a4a4a' }}>
        <p className="text-[#a0b8b8] text-xs mb-1">Period</p>
        <p className="text-white font-bold text-lg">2026{String(new Date().getMonth() + 1).padStart(2, '0')}{String(new Date().getDate()).padStart(2, '0')}001</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-[#a0b8b8] text-sm">Time Remaining</span>
          <span className="text-[#ffd700] font-bold text-xl">{formatTime(timer)}</span>
        </div>
      </div>

      {/* Result display */}
      {showResult && result !== null && (
        <div className="mx-4 mb-4 p-4 rounded-xl text-center animate-slide-up"
          style={{ background: `${getNumberColor(result)}22`, border: `1px solid ${getNumberColor(result)}44` }}>
          <p className="text-white font-bold text-3xl">{result}</p>
          <p className="text-sm mt-1" style={{ color: getNumberColor(result) }}>Result</p>
        </div>
      )}

      {/* Color betting */}
      <div className="mx-4 mb-4">
        <p className="text-[#a0b8b8] text-xs mb-2">Select Color</p>
        <div className="grid grid-cols-3 gap-2">
          {colors.map(c => (
            <button key={c.value}
              onClick={() => placeBet('color', c.value)}
              className="py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: c.bg,
                border: selectedColor === c.value ? `2px solid ${c.color}` : '1px solid #1a4a4a',
                color: c.color,
              }}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Number grid */}
      <div className="mx-4 mb-4">
        <p className="text-[#a0b8b8] text-xs mb-2">Select Number</p>
        <div className="grid grid-cols-5 gap-2">
          {numbers.map(n => (
            <button key={n}
              onClick={() => placeBet('number', n)}
              className="aspect-square rounded-xl font-bold text-lg flex items-center justify-center transition-all"
              style={{
                background: `${getNumberColor(n)}22`,
                border: selectedNumber === n ? `2px solid ${getNumberColor(n)}` : '1px solid #1a4a4a',
                color: getNumberColor(n),
              }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Bet amount */}
      <div className="mx-4 mb-4">
        <p className="text-[#a0b8b8] text-xs mb-2">Bet Amount</p>
        <div className="grid grid-cols-4 gap-2">
          {[10, 50, 100, 500].map(a => (
            <button key={a}
              onClick={() => setBetAmount(a)}
              className="py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                background: betAmount === a ? 'linear-gradient(135deg, #00c851, #00a344)' : '#163d3d',
                color: betAmount === a ? '#fff' : '#a0b8b8',
              }}>
              Rs{a}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="mx-4">
        <p className="text-[#a0b8b8] text-xs mb-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Recent Results
        </p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {history.map((n, i) => (
            <div key={i}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: `${getNumberColor(n)}33`, color: getNumberColor(n) }}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}