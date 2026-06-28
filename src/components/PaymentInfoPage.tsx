import { ArrowLeft, Copy, Check, Smartphone, CreditCard, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

interface PaymentInfoPageProps {
  onBack: () => void
}

export default function PaymentInfoPage({ onBack }: PaymentInfoPageProps) {
  const [copiedField, setCopiedField] = useState('')

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b)' }}>
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#163d3d' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="ml-3 text-white font-bold text-lg">Deposit Instructions</span>
      </div>

      {/* Warning */}
      <div className="mx-4 mb-4 p-3 rounded-xl flex items-start gap-2"
        style={{ background: '#ffd70011', border: '1px solid #ffd70033' }}>
        <AlertTriangle className="w-4 h-4 text-[#ffd700] mt-0.5 shrink-0" />
        <div>
          <p className="text-[#ffd700] text-xs font-bold mb-1">Important</p>
          <p className="text-[#a0b8b8] text-[10px]">Send exact amount. After sending, take a screenshot and upload it in the deposit form. Minimum deposit Rs300.</p>
        </div>
      </div>

      {/* EasyPaisa */}
      <div className="mx-4 mb-4 p-4 rounded-xl" style={{ background: '#0f3535', border: '1px solid #1a4a4a' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#00c85122' }}>
            <Smartphone className="w-5 h-5 text-[#00c851]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">EasyPaisa</p>
            <p className="text-[#6b8888] text-[10px]">Send via EasyPaisa mobile app</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#0a2525', border: '1px dashed #00c85144' }}>
          <div>
            <p className="text-[10px] text-[#a0b8b8]">Account Number</p>
            <p className="text-lg font-bold text-[#00c851] font-mono">03447562330</p>
          </div>
          <button onClick={() => copy('03447562330', 'ep')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
            style={{ background: 'linear-gradient(135deg, #00c851, #00a344)', color: '#fff' }}>
            {copiedField === 'ep' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedField === 'ep' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* JazzCash */}
      <div className="mx-4 mb-4 p-4 rounded-xl" style={{ background: '#0f3535', border: '1px solid #1a4a4a' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#ff572222' }}>
            <Smartphone className="w-5 h-5 text-[#ff5722]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">JazzCash</p>
            <p className="text-[#6b8888] text-[10px]">Send via JazzCash mobile app</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#0a2525', border: '1px dashed #ff572244' }}>
          <div>
            <p className="text-[10px] text-[#a0b8b8]">Account Number</p>
            <p className="text-lg font-bold text-[#ff5722] font-mono">03447562330</p>
          </div>
          <button onClick={() => copy('03447562330', 'jc')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
            style={{ background: 'linear-gradient(135deg, #ff5722, #e64a19)', color: '#fff' }}>
            {copiedField === 'jc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedField === 'jc' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* USDT */}
      <div className="mx-4 mb-6 p-4 rounded-xl" style={{ background: '#0f3535', border: '1px solid #1a4a4a' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#ffd70022' }}>
            <CreditCard className="w-5 h-5 text-[#ffd700]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">USDT (TRC20)</p>
            <p className="text-[#6b8888] text-[10px]">Send USDT via TRC20 network</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#0a2525', border: '1px dashed #ffd70044' }}>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-[#a0b8b8]">Wallet Address</p>
            <p className="text-xs font-bold text-[#ffd700] font-mono truncate">Contact support for USDT address</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="mx-4">
        <h3 className="text-white font-bold text-sm mb-3">How to Deposit</h3>
        <div className="space-y-3">
          {[
            { step: 1, text: 'Open EasyPaisa or JazzCash app', color: '#00c851' },
            { step: 2, text: 'Send money to the number above', color: '#ff5722' },
            { step: 3, text: 'Take a screenshot of the payment confirmation', color: '#ffd700' },
            { step: 4, text: 'Go to Wallet → Deposit in this app', color: '#9333ea' },
            { step: 5, text: 'Upload screenshot and enter amount', color: '#00bcd4' },
            { step: 6, text: 'Wait 10-30 minutes for approval', color: '#ff9800' },
          ].map(s => (
            <div key={s.step} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#0f3535', border: '1px solid #1a4a4a' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: `${s.color}22`, color: s.color }}>{s.step}</div>
              <p className="text-white text-sm">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
