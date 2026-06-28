import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, History, CreditCard, Smartphone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface WalletPageProps {
  balance: number
  onBack: () => void
}

export default function WalletPage({ balance, onBack }: WalletPageProps) {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('easypaisa')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    api.getTransactions(1, 10).then(res => {
      if (res.ok) setTransactions(res.data.transactions)
    }).catch(() => {})
  }, [])
  const quickAmounts = [300, 500, 1000, 2000, 5000]

  const handleScreenshotUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('screenshot', file)
      const token = localStorage.getItem('rylox_token')
      const res = await fetch('/api/upload/screenshot', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (data.ok) {
        setScreenshotUrl(data.data.filename)
      } else {
        setMessage(data.error || 'Upload failed')
      }
    } catch (err) {
      setMessage('Screenshot upload failed')
    }
    setUploading(false)
  }

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return
    setLoading(true)
    setMessage('')
    try {
      if (tab === 'deposit') {
        const res = await api.requestDeposit(Number(amount), method, accountNumber, accountName)
        if (res.ok) {
          if (screenshot) await handleScreenshotUpload(screenshot)
          setMessage('Deposit request submitted! Waiting for approval.')
        } else setMessage(res.error || 'Deposit failed')
      } else {
        if (!accountNumber || !accountName) { setMessage('Account number and name required'); setLoading(false); return }
        const res = await api.requestWithdraw(Number(amount), method, accountNumber, accountName)
        if (res.ok) setMessage('Withdrawal request submitted! Processing soon.')
        else setMessage(res.error || 'Withdrawal failed')
      }
    } catch (err: any) {
      setMessage(err.message || 'Request failed')
    }
    setLoading(false)
  }

  const getTxIcon = (type: string) => {
    if (type === 'deposit' || type === 'bet_win' || type === 'bonus' || type === 'referral_bonus') return '↓'
    return '↑'
  }

  const getTxColor = (amount: number) => amount >= 0 ? '#00c851' : '#ff4444'

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a2525, #0d2b2b)' }}>
      <div className="flex items-center px-4 py-4">
        <button onClick={onBack} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: '#163d3d' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="ml-3 text-white font-bold text-lg">Wallet</span>
      </div>

      {/* Balance Card */}
      <div className="mx-4 mb-4 p-5 rounded-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #00c851, #00a344)',
          boxShadow: '0 4px 20px rgba(0,200,81,0.3)',
        }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
          style={{ background: '#fff', transform: 'translate(30%, -30%)' }} />
        <p className="text-white/80 text-sm mb-1">Total Balance</p>
        <p className="text-white text-3xl font-bold">Rs{balance.toFixed(2)}</p>
        <div className="flex gap-3 mt-4">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold"
            style={{ background: '#ffffff22', color: '#fff' }}>
            <ArrowDownToLine className="w-3.5 h-3.5" /> Deposit
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold"
            style={{ background: '#ffffff22', color: '#fff' }}>
            <ArrowUpFromLine className="w-3.5 h-3.5" /> Withdraw
          </button>
        </div>
      </div>

      {/* Deposit / Withdraw tabs */}
      <div className="mx-4 mb-4 flex rounded-lg overflow-hidden" style={{ background: '#163d3d' }}>
        <button
          onClick={() => setTab('deposit')}
          className="flex-1 py-2.5 text-sm font-bold text-center transition-all"
          style={{
            background: tab === 'deposit' ? 'linear-gradient(135deg, #00c851, #00a344)' : 'transparent',
            color: '#fff',
          }}
        >
          Deposit
        </button>
        <button
          onClick={() => setTab('withdraw')}
          className="flex-1 py-2.5 text-sm font-bold text-center transition-all"
          style={{
            background: tab === 'withdraw' ? 'linear-gradient(135deg, #ffd700, #ffaa00)' : 'transparent',
            color: tab === 'withdraw' ? '#0d2b2b' : '#a0b8b8',
          }}
        >
          Withdraw
        </button>
      </div>

      <div className="px-4">
        {/* Amount Input */}
        <div className="mb-3">
          <label className="text-xs text-[#a0b8b8] mb-1.5 block">Amount (Rs)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-3 rounded-lg text-white text-lg font-bold outline-none"
            style={{ background: '#163d3d', border: '1px solid #1a4a4a' }}
          />
        </div>

        {/* Quick amounts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickAmounts.map(a => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className="py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: amount === String(a) ? 'linear-gradient(135deg, #00c851, #00a344)' : '#163d3d',
                color: amount === String(a) ? '#fff' : '#a0b8b8',
                border: amount === String(a) ? 'none' : '1px solid #1a4a4a',
              }}
            >
              Rs{a}
            </button>
          ))}
        </div>

        {/* Payment methods */}
        <p className="text-xs text-[#a0b8b8] mb-2">Payment Method</p>
        <div className="space-y-2 mb-4">
          {[
            { id: 'easypaisa', name: 'Easypaisa', icon: Smartphone, color: '#00c851' },
            { id: 'jazzcash', name: 'JazzCash', icon: Smartphone, color: '#ff5722' },
            { id: 'bank_transfer', name: 'Bank Transfer', icon: CreditCard, color: '#ffd700' },
          ].map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg"
              style={{ background: '#163d3d', border: method === m.id ? `2px solid ${m.color}` : '1px solid #1a4a4a' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${m.color}22` }}>
                <m.icon className="w-5 h-5" style={{ color: m.color }} />
              </div>
              <span className="text-white text-sm font-medium">{m.name}</span>
            </button>
          ))}
        </div>

        {/* Account details for withdrawal */}
        {tab === 'withdraw' && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs text-[#a0b8b8] mb-1.5 block">Account Number</label>
              <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none"
                style={{ background: '#163d3d', border: '1px solid #1a4a4a' }} />
            </div>
            <div>
              <label className="text-xs text-[#a0b8b8] mb-1.5 block">Account Name</label>
              <input value={accountName} onChange={e => setAccountName(e.target.value)}
                placeholder="Enter account holder name"
                className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none"
                style={{ background: '#163d3d', border: '1px solid #1a4a4a' }} />
            </div>
          </div>
        )}

        {/* Screenshot upload for deposits */}
        {tab === 'deposit' && (
          <div className="mb-4">
            <label className="text-xs text-[#a0b8b8] mb-1.5 block">Payment Screenshot (optional)</label>
            <div className="relative rounded-lg p-3 text-center" style={{ background: '#163d3d', border: '1px dashed #1a4a4a' }}>
              {screenshotUrl ? (
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-green-400 text-sm">✅ Screenshot uploaded</span>
                  <button onClick={() => { setScreenshotUrl(''); setScreenshot(null) }} className="text-red-400 text-xs">Remove</button>
                </div>
              ) : (
                <>
                  <input type="file" accept="image/*" onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) { setScreenshot(file); handleScreenshotUpload(file) }
                  }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <p className="text-[#6b8888] text-xs">{uploading ? 'Uploading...' : '📷 Tap to upload payment screenshot'}</p>
                </>
              )}
            </div>
          </div>
        )}

        {message && (
          <div className="mb-3 px-4 py-2 rounded-lg text-sm text-white"
            style={{ background: message.includes('submitted') ? '#00c85133' : '#ff444433', border: `1px solid ${message.includes('submitted') ? '#00c851' : '#ff4444'}` }}>
            {message}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading || !amount}
          className="w-full py-3 rounded-lg font-bold text-white text-sm disabled:opacity-50"
          style={{
            background: tab === 'deposit'
              ? 'linear-gradient(135deg, #00c851, #00a344)'
              : 'linear-gradient(135deg, #ffd700, #ffaa00)',
            color: tab === 'withdraw' ? '#0d2b2b' : '#fff',
          }}
        >
          {loading ? 'Processing...' : tab === 'deposit' ? `Deposit Rs${amount || '0'}` : `Withdraw Rs${amount || '0'}`}
        </button>

        {/* Transaction History */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-[#a0b8b8]" />
            <span className="text-sm text-[#a0b8b8] font-bold">Recent Transactions</span>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-[#6b8888] text-sm">No transactions yet</div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: '#0f3535', border: '1px solid #1a4a4a' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: `${getTxColor(tx.amount)}22`, color: getTxColor(tx.amount) }}>
                      {getTxIcon(tx.type)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{tx.description || tx.type}</p>
                      <p className="text-[#6b8888] text-[10px]">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm" style={{ color: getTxColor(tx.amount) }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}