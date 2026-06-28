const API_BASE = '/api'

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    if (token) localStorage.setItem('rylox_token', token)
    else localStorage.removeItem('rylox_token')
  }

  getToken(): string | null {
    if (!this.token) this.token = localStorage.getItem('rylox_token')
    return this.token
  }

  async request<T = any>(method: string, path: string, body?: any): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = this.getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    return data
  }

  // Auth
  async register(phone: string, password: string, name?: string, referralCode?: string) {
    const res = await this.request('POST', '/auth/register', { phone, password, name, referralCode })
    if (res.ok) this.setToken(res.data.token)
    return res
  }

  async login(phone: string, password: string) {
    const res = await this.request('POST', '/auth/login', { phone, password })
    if (res.ok) this.setToken(res.data.token)
    return res
  }

  async getMe() {
    return this.request('GET', '/auth/me')
  }

  async updateProfile(data: { name?: string }) {
    return this.request('PATCH', '/auth/profile', data)
  }

  logout() {
    this.setToken(null)
  }

  // Wallet
  async getBalance() {
    return this.request('GET', '/wallet/balance')
  }

  async getTransactions(page = 1, limit = 20) {
    return this.request('GET', `/wallet/transactions?page=${page}&limit=${limit}`)
  }

  async requestDeposit(amount: number, method: string, accountNumber?: string, accountName?: string) {
    return this.request('POST', '/wallet/deposit', { amount, method, accountNumber, accountName })
  }

  async requestWithdraw(amount: number, method: string, accountNumber: string, accountName: string) {
    return this.request('POST', '/wallet/withdraw', { amount, method, accountNumber, accountName })
  }

  async getDeposits() {
    return this.request('GET', '/wallet/deposits')
  }

  async getWithdrawals() {
    return this.request('GET', '/wallet/withdrawals')
  }

  // Games
  async placeWingoBet(amount: number, betType: string, betChoice: string | number, period?: string) {
    return this.request('POST', '/game/wingo/bet', { amount, betType, betChoice: String(betChoice), period })
  }

  async getBetHistory(game?: string, page = 1) {
    return this.request('GET', `/game/history?game=${game || ''}&page=${page}`)
  }

  // Referrals
  async getReferralInfo() {
    return this.request('GET', '/referral/info')
  }

  // Activity
  async getActivitySummary() {
    return this.request('GET', '/activity/summary')
  }

  // Leaderboard
  async getLeaderboard(period: 'today' | 'weekly' = 'today') {
    return this.request('GET', `/leaderboard/${period}`)
  }

  // VIP
  async getVipInfo() {
    return this.request('GET', '/vip/info')
  }

  // Daily Bonus
  async getDailyBonusStatus() {
    return this.request('GET', '/daily-bonus/status')
  }

  async claimDailyBonus() {
    return this.request('POST', '/daily-bonus/claim')
  }

  // Notifications
  async getNotifications() {
    return this.request('GET', '/user/notifications')
  }

  async getUnreadNotifications() {
    return this.request('GET', '/user/notifications/unread')
  }

  async markNotificationsRead() {
    return this.request('POST', '/user/notifications/read')
  }

  // Chat
  async sendChatMessage(message: string) {
    return this.request('POST', '/chat/send', { message })
  }

  async getChatMessages() {
    return this.request('GET', '/chat/messages')
  }

  async getChatUnread() {
    return this.request('GET', '/chat/unread')
  }

}

export const api = new ApiClient()