import { Wallet } from 'lucide-react'
import NotificationBell from './NotificationBell'

interface HeaderProps {
  balance: number
  onWalletClick?: () => void
  userId?: string | null
}

export default function Header({ balance, onWalletClick, userId }: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3"
      style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b)' }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)', color: '#fff' }}>
          P
        </div>
        <span className="text-white font-bold text-lg tracking-tight">PurpleWin Club</span>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell userId={userId} />
        <button
          onClick={onWalletClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #1a4a4a, #163d3d)', border: '1px solid #9333ea' }}
        >
          <Wallet className="w-4 h-4 text-[#9333ea]" />
          <span className="text-[#a0b8b8]">Balance</span>
          <span className="text-[#ffd700]">Rs{balance.toFixed(2)}</span>
        </button>
      </div>
    </div>
  )
}
