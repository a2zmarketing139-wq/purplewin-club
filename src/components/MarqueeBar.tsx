import { Volume2 } from 'lucide-react'

export default function MarqueeBar() {
  return (
    <div className="mx-4 mb-3 flex items-center gap-2 px-3 py-2.5 rounded-lg"
      style={{ background: 'linear-gradient(90deg, #163d3d, #1a4a4a, #163d3d)' }}>
      <Volume2 className="w-4 h-4 text-[#00c851] shrink-0" />
      <div className="overflow-hidden flex-1">
        <div className="animate-marquee whitespace-nowrap text-sm text-white font-medium">
          🔔 Be Alert And Avoid Being Get Scammed — Never share your password or OTP with anyone. Stay safe! 🔔
        </div>
      </div>
      <button className="shrink-0 px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1"
        style={{ background: 'linear-gradient(135deg, #00c851, #00a344)' }}>
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        Detail
      </button>
    </div>
  )
}