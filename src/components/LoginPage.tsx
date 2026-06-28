import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

interface LoginPageProps {
  onLogin: (creds: { phone: string; password: string }) => Promise<{ ok: boolean; error?: string }>
  onRegister: () => void
  onBack: () => void
}

export default function LoginPage({ onLogin, onRegister, onBack }: LoginPageProps) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !password) return
    setLoading(true)
    setError('')
    const res = await onLogin({ phone, password })
    if (!res.ok) setError(res.error || 'Login failed')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b, #0a2525)' }}>
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: '#163d3d' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="ml-3 text-white font-bold text-lg">Login</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 text-3xl font-bold"
          style={{ background: 'linear-gradient(135deg, #00c851, #00a344)', color: '#fff' }}>
          R
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Welcome Back!</h1>
        <p className="text-sm text-[#a0b8b8] mb-8">Login to your PurpleWin Club account</p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
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
                placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-white text-sm mt-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #00c851, #00a344)' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-[#6b8888]">Don't have an account? </span>
          <button onClick={onRegister} className="text-sm font-bold text-[#00c851]">
            Register now
          </button>
        </div>
      </div>
    </div>
  )
}