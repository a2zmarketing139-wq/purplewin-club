import { Home, Gift, Gamepad2, Wallet, User } from 'lucide-react'

interface BottomNavProps {
  active: string
  onNavigate: (page: string) => void
}

const tabs = [
  { id: 'promotion', label: 'Promotion', icon: Gift },
  { id: 'activity', label: 'Activity', icon: Home },
  { id: 'game', label: '', icon: Gamepad2, center: true },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'account', label: 'Account', icon: User },
]

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(180deg, #0a2525ee, #0d2b2bf0)',
        borderTop: '1px solid #1a4a4a',
        backdropFilter: 'blur(10px)',
      }}>
      <div className="flex items-end justify-around px-2 pt-2 pb-4 max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = active === tab.id

          if (tab.center) {
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className="relative -mt-6"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center animate-pulse-glow"
                  style={{
                    background: 'linear-gradient(135deg, #00c851, #00a344)',
                    boxShadow: '0 0 20px rgba(0,200,81,0.5)',
                  }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </button>
            )
          }

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="flex flex-col items-center gap-0.5 min-w-[52px] relative"
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#00c851]' : 'text-[#6b8888]'}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#00c851]' : 'text-[#6b8888]'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#00c851]" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}