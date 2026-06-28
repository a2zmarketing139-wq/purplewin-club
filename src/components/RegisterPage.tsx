import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft, Copy, Check } from 'lucide-react'

interface RegisterPageProps {
  onRegister: (creds: { phone: string; password: string }) => Promise<{ ok: boolean; error?: string }>
  onLogin: () => void
  onBack: () => void
}

export default function RegisterPage({ onRegister, onLogin, onBack }: RegisterPageProps) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [referral, setReferral] = useState('73720103688')
  const [showPass, setShowPass] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const referralCode = '73720103688'
  const referralLink = `${window.location.origin}/register/${referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !password) return
    if (password !== confirmPass) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    const res = await onRegister({ phone, password })
    if (!res.ok) setError(res.error || 'Registration failed')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b, #0a2525)' }}>
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: '#163d3d' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="ml-3 text-white font-bold text-lg">Register</span>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-4 pb-8">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 text-3xl font-bold"
          style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)', color: '#0d2b2b' }}>
          R
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Join PurpleWin Club</h1>
        <p className="text-sm text-[#a0b8b8] mb-6">Create your account & start winning</p>

        {/* Referral Link Section */}
        <div className="w-full p-3 rounded-xl mb-6"
          style={{ background: 'linear-gradient(135deg, #ffd70015, #ffd70008)', border: '1px solid #ffd70033' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#ffd700] font-bold">🎁 My Referral Link</span>
            <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-[#00c851]">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="text-xs text-white truncate" style={{ wordBreak: 'break-all' }}>
            {referralLink}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-[#a0b8b8]">My Code:</span>
            <span className="text-sm font-bold text-[#ffd700]">{referralCode}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {error && (
            <div className="px-4 py-2 rounded-lg text-sm text-white" style={{ background: '#ff444433', border: '1px solid #ff4444' }}>
              {error}
            </div>
          )}
          <div>
            <label className="text-xs text-[#a0b8b8] mb-1.5 block">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none"
              style={{ background: '#163d3d', border: '1px solid #1a4a4a' }}
            />
          </div>
          <div>
            <label className="text-xs text-[#a0b8b8] mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full px-4 py-3 pr-10 rounded-lg text-white text-sm outline-none"
                style={{ background: '#163d3d', border: '1px solid #1a4a4a' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPass
                  ? <EyeOff className="w-4 h-4 text-[#6b8888]" />
                  : <Eye className="w-4 h-4 text-[#6b8888]" />
                }
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-[#a0b8b8] mb-1.5 block">Confirm Password</label>
            <input
              type="password"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none"
              style={{ background: '#163d3d', border: '1px solid #1a4a4a' }}
            />
          </div>
          <div>
            <label className="text-xs text-[#a0b8b8] mb-1.5 block">Referral Code (optional)</label>
            <input
              type="text"
              value={referral}
              onChange={e => setReferral(e.target.value)}
              placeholder="Enter referral code"
              className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none"
              style={{ background: '#163d3d', border: '1px solid #1a4a4a' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-sm mt-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #ffd700, #ffaa00)', color: '#0d2b2b' }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-[#6b8888]">Already have an account? </span>
          <button onClick={onLogin} className="text-sm font-bold text-[#00c851]">
            Login
          </button>
        </div>
      </div>
    </div>
  )
}