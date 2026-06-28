import { Hono } from 'hono'
import { prisma } from './src/lib/db'
import bcrypt from 'bcryptjs'
// @ts-ignore - jsonwebtoken works at runtime
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'ryloxclub-secret-key-2026'
const SALT_ROUNDS = 10

type Variables = { user: any }
const app = new Hono<{ Variables: Variables }>()

// ─── HELPERS ────────────────────────────────────────────
function generateReferralCode(): string {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString()
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}

function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

async function getUserFromRequest(c: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    if (!payload) return null
    // Admin tokens have role but no userId
    if (payload.role === 'admin') {
      return { id: 'admin', phone: ADMIN_PHONE, name: 'Admin', role: 'admin', balance: 0, vipLevel: 5, totalDeposit: 0, totalWithdraw: 0, isActive: true, referralCode: null } as any
    }
    if (!payload.userId) return null
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || !user.isActive) return null
    return user
  } catch {
    return null
  }
}

// ─── AUTH MIDDLEWARE ────────────────────────────────────
const authMiddleware = async (c: any, next: any) => {
  const user = await getUserFromRequest(c)
  if (!user) return c.json({ error: 'Unauthorized. Please login.' }, 401)
  c.set('user', user)
  await next()
}

// ═══════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════

// Register
app.post('/auth/register', async (c) => {
  try {
    const { phone, password, name, referralCode } = await c.req.json()

    if (!phone || !password) {
      return c.json({ error: 'Phone and password are required' }, 400)
    }
    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400)
    }

    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) {
      return c.json({ error: 'Phone number already registered' }, 409)
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    let myReferralCode = generateReferralCode()
    while (await prisma.user.findUnique({ where: { referralCode: myReferralCode } })) {
      myReferralCode = generateReferralCode()
    }

    let referredBy: string | undefined
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } })
      if (referrer) referredBy = referrer.id
    }

    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        name: name || `Player${phone.slice(-4)}`,
        referralCode: myReferralCode,
        referredBy: referredBy || null,
        balance: 0,
      },
    })

    // Give referral bonus to both parties
    if (referredBy) {
      const referrer = await prisma.user.findUnique({ where: { id: referredBy } })
      if (referrer) {
        const bonusAmount = 50
        // Bonus to new user
        await prisma.user.update({
          where: { id: user.id },
          data: { balance: { increment: bonusAmount } },
        })
        await prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'bonus',
            amount: bonusAmount,
            balanceBefore: 0,
            balanceAfter: bonusAmount,
            description: 'Welcome bonus for using referral code',
          },
        })
        // Bonus to referrer
        const referrerBal = referrer.balance
        await prisma.user.update({
          where: { id: referredBy },
          data: { balance: { increment: bonusAmount } },
        })
        await prisma.transaction.create({
          data: {
            userId: referredBy,
            type: 'referral_bonus',
            amount: bonusAmount,
            balanceBefore: referrerBal,
            balanceAfter: referrerBal + bonusAmount,
            description: `Referral bonus for inviting ${user.name}`,
          },
        })
      }
    }

    const token = generateToken(user.id)
    return c.json({
      ok: true,
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          referralCode: user.referralCode,
          balance: user.balance,
          vipLevel: user.vipLevel,
          totalDeposit: user.totalDeposit,
          totalWithdraw: user.totalWithdraw,
          createdAt: user.createdAt,
        },
      },
    })
  } catch (err: any) {
    console.error('Register error:', err)
    return c.json({ error: err.message || 'Registration failed' }, 500)
  }
})

// Login (handles both admin and user login)
app.post('/auth/login', async (c) => {
  try {
    const { phone, password } = await c.req.json()

    if (!phone || !password) {
      return c.json({ error: 'Phone and password are required' }, 400)
    }

    // Admin login
    if (phone === '03052884177' && password === '@ ZainabAbbas732') {
      const adminToken = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
      return c.json({ ok: true, data: { token: adminToken, user: { id: 'admin', name: 'Admin', phone: '03052884177', role: 'admin' } } })
    }

    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      return c.json({ error: 'Invalid phone or password' }, 401)
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return c.json({ error: 'Invalid phone or password' }, 401)
    }

    if (!user.isActive) {
      return c.json({ error: 'Account is disabled' }, 403)
    }

    const token = generateToken(user.id)
    return c.json({
      ok: true,
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          referralCode: user.referralCode,
          balance: user.balance,
          vipLevel: user.vipLevel,
          totalDeposit: user.totalDeposit,
          totalWithdraw: user.totalWithdraw,
          createdAt: user.createdAt,
        },
      },
    })
  } catch (err: any) {
    console.error('Login error:', err)
    return c.json({ error: err.message || 'Login failed' }, 500)
  }
})

// Get current user profile
app.get('/auth/me', authMiddleware, async (c) => {
  const user = c.get('user')
  return c.json({
    ok: true,
    data: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      referralCode: user.referralCode,
      balance: user.balance,
      vipLevel: user.vipLevel,
      totalDeposit: user.totalDeposit,
      totalWithdraw: user.totalWithdraw,
      createdAt: user.createdAt,
    },
  })
})

// Update profile
app.patch('/auth/profile', authMiddleware, async (c) => {
  const user = c.get('user')
  const { name } = await c.req.json()

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { ...(name && { name }) },
  })

  return c.json({
    ok: true,
    data: { id: updated.id, name: updated.name, phone: updated.phone },
  })
})

// ═══════════════════════════════════════════════════════════
// WALLET ROUTES
// ═══════════════════════════════════════════════════════════

// Get balance
app.get('/wallet/balance', authMiddleware, async (c) => {
  const user = c.get('user')
  return c.json({
    ok: true,
    data: {
      balance: user.balance,
      totalDeposit: user.totalDeposit,
      totalWithdraw: user.totalWithdraw,
    },
  })
})

// Get transaction history
app.get('/wallet/transactions', authMiddleware, async (c) => {
  const user = c.get('user')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const skip = (page - 1) * limit

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where: { userId: user.id } }),
  ])

  return c.json({
    ok: true,
    data: {
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        balanceBefore: t.balanceBefore,
        balanceAfter: t.balanceAfter,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  })
})

// Request deposit
app.post('/wallet/deposit', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { amount, method, accountNumber, accountName } = await c.req.json()

    if (!amount || amount <= 0) {
      return c.json({ error: 'Invalid amount' }, 400)
    }
    if (amount < 300) {
      return c.json({ error: 'Minimum deposit is Rs300' }, 400)
    }
    if (!method || !['easypaisa', 'jazzcash', 'bank_transfer'].includes(method)) {
      return c.json({ error: 'Invalid payment method' }, 400)
    }

    const deposit = await prisma.depositRequest.create({
      data: {
        userId: user.id,
        amount,
        method,
        accountNumber: accountNumber || null,
        accountName: accountName || null,
      },
    })

    return c.json({
      ok: true,
      data: {
        id: deposit.id,
        amount: deposit.amount,
        method: deposit.method,
        status: deposit.status,
        createdAt: deposit.createdAt,
      },
    })
  } catch (err: any) {
    console.error('Deposit error:', err)
    return c.json({ error: err.message || 'Deposit request failed' }, 500)
  }
})

// Approve deposit (admin - simplified)
app.post('/wallet/deposit/:id/approve', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param()
    const deposit = await prisma.depositRequest.findUnique({ where: { id } })
    if (!deposit) return c.json({ error: 'Deposit not found' }, 404)
    if (deposit.status !== 'pending') return c.json({ error: 'Deposit already processed' }, 400)

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: deposit.userId } })
      if (!user) throw new Error('User not found')

      const newBalance = user.balance + deposit.amount
      await tx.user.update({
        where: { id: deposit.userId },
        data: {
          balance: newBalance,
          totalDeposit: { increment: deposit.amount },
        },
      })

      await tx.depositRequest.update({
        where: { id },
        data: { status: 'approved' },
      })

      await tx.transaction.create({
        data: {
          userId: deposit.userId,
          type: 'deposit',
          amount: deposit.amount,
          balanceBefore: user.balance,
          balanceAfter: newBalance,
          description: `Deposit via ${deposit.method}`,
          referenceId: id,
        },
      })

      return { newBalance }
    })

    return c.json({ ok: true, data: { balance: result.newBalance } })
  } catch (err: any) {
    console.error('Approve deposit error:', err)
    return c.json({ error: err.message || 'Failed to approve deposit' }, 500)
  }
})

// Request withdrawal
app.post('/wallet/withdraw', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { amount, method, accountNumber, accountName } = await c.req.json()

    if (!amount || amount <= 0) {
      return c.json({ error: 'Invalid amount' }, 400)
    }
    if (amount < 200) {
      return c.json({ error: 'Minimum withdrawal is Rs200' }, 400)
    }
    if (amount > user.balance) {
      return c.json({ error: 'Insufficient balance' }, 400)
    }
    if (!method || !['easypaisa', 'jazzcash', 'bank_transfer'].includes(method)) {
      return c.json({ error: 'Invalid payment method' }, 400)
    }
    if (!accountNumber || !accountName) {
      return c.json({ error: 'Account number and name are required' }, 400)
    }

    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        userId: user.id,
        amount,
        method,
        accountNumber,
        accountName,
      },
    })

    return c.json({
      ok: true,
      data: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        method: withdrawal.method,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt,
      },
    })
  } catch (err: any) {
    console.error('Withdraw error:', err)
    return c.json({ error: err.message || 'Withdrawal request failed' }, 500)
  }
})

// Get deposit history
app.get('/wallet/deposits', authMiddleware, async (c) => {
  const user = c.get('user')
  const deposits = await prisma.depositRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return c.json({ ok: true, data: { deposits } })
})

// Get withdrawal history
app.get('/wallet/withdrawals', authMiddleware, async (c) => {
  const user = c.get('user')
  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return c.json({ ok: true, data: { withdrawals } })
})

// ═══════════════════════════════════════════════════════════
// GAME / BET ROUTES
// ═══════════════════════════════════════════════════════════

// Place a bet (Wingo)
app.post('/game/wingo/bet', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { amount, betType, betChoice, period } = await c.req.json()

    if (!amount || amount <= 0) return c.json({ error: 'Invalid bet amount' }, 400)
    if (amount < 1) return c.json({ error: 'Minimum bet is Rs1' }, 400)
    if (amount > user.balance) return c.json({ error: 'Insufficient balance' }, 400)
    if (!betType || !['number', 'color'].includes(betType)) {
      return c.json({ error: 'Invalid bet type' }, 400)
    }
    if (betChoice === undefined || betChoice === null) {
      return c.json({ error: 'Bet choice is required' }, 400)
    }

    // Generate result
    const result = Math.floor(Math.random() * 10)
    const resultColors: string[] = []
    if (result === 0) resultColors.push('G')
    if (result === 5) resultColors.push('V')
    if (result % 2 === 0) resultColors.push('R')
    else resultColors.push('G')

    let multiplier = 0
    let isWin = false

    if (betType === 'number') {
      const chosen = parseInt(betChoice)
      if (isNaN(chosen) || chosen < 0 || chosen > 9) {
        return c.json({ error: 'Invalid number choice (0-9)' }, 400)
      }
      isWin = result === chosen
      multiplier = isWin ? 9 : 0
    } else if (betType === 'color') {
      const chosen = betChoice
      if (!['G', 'V', 'R'].includes(chosen)) {
        return c.json({ error: 'Invalid color (G, V, R)' }, 400)
      }
      isWin = resultColors.includes(chosen)
      multiplier = isWin ? 2 : 0
    }

    const winAmount = amount * multiplier

    const result2 = await prisma.$transaction(async (tx) => {
      const u = await tx.user.findUnique({ where: { id: user.id } })
      if (!u) throw new Error('User not found')

      const newBalance = u.balance - amount + winAmount
      await tx.user.update({
        where: { id: user.id },
        data: { balance: newBalance },
      })

      const bet = await tx.bet.create({
        data: {
          userId: user.id,
          gameType: 'wingo',
          gamePeriod: period || null,
          betAmount: amount,
          betChoice: `${betType}:${betChoice}`,
          result: `${result}:${resultColors.join(',')}`,
          winAmount,
          multiplier,
          isWin,
          status: isWin ? 'won' : 'lost',
        },
      })

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'bet_place',
          amount: -amount,
          balanceBefore: u.balance,
          balanceAfter: u.balance - amount,
          description: `Wingo bet: ${betType}=${betChoice}`,
          referenceId: bet.id,
        },
      })

      if (isWin) {
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'bet_win',
            amount: winAmount,
            balanceBefore: u.balance - amount,
            balanceAfter: newBalance,
            description: `Wingo win: ${result} (${multiplier}x)`,
            referenceId: bet.id,
          },
        })
      }

      return { bet, newBalance }
    })

    return c.json({
      ok: true,
      data: {
        betId: result2.bet.id,
        result,
        resultColors,
        isWin,
        multiplier,
        winAmount,
        betAmount: amount,
        balance: result2.newBalance,
      },
    })
  } catch (err: any) {
    console.error('Wingo bet error:', err)
    return c.json({ error: err.message || 'Bet failed' }, 500)
  }
})

// Get bet history
app.get('/game/history', authMiddleware, async (c) => {
  const user = c.get('user')
  const gameType = c.req.query('game')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = { userId: user.id }
  if (gameType) where.gameType = gameType

  const [bets, total] = await Promise.all([
    prisma.bet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.bet.count({ where }),
  ])

  const stats = await prisma.bet.aggregate({
    where: { userId: user.id },
    _sum: { betAmount: true, winAmount: true },
    _count: true,
  })

  return c.json({
    ok: true,
    data: {
      bets: bets.map(b => ({
        id: b.id,
        gameType: b.gameType,
        betAmount: b.betAmount,
        betChoice: b.betChoice,
        result: b.result,
        winAmount: b.winAmount,
        multiplier: b.multiplier,
        isWin: b.isWin,
        status: b.status,
        createdAt: b.createdAt,
      })),
      stats: {
        totalBets: stats._count,
        totalWagered: stats._sum.betAmount || 0,
        totalWon: stats._sum.winAmount || 0,
        profit: (stats._sum.winAmount || 0) - (stats._sum.betAmount || 0),
      },
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  })
})

// ═══════════════════════════════════════════════════════════
// REFERRAL ROUTES
// ═══════════════════════════════════════════════════════════

// Get referral info
app.get('/referral/info', authMiddleware, async (c) => {
  const user = c.get('user')

  const [referralCount, referrals, commission] = await Promise.all([
    prisma.user.count({ where: { referredBy: user.id } }),
    prisma.user.findMany({
      where: { referredBy: user.id },
      select: { id: true, name: true, phone: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.transaction.aggregate({
      where: { userId: user.id, type: 'referral_bonus' },
      _sum: { amount: true },
      _count: true,
    }),
  ])

  return c.json({
    ok: true,
    data: {
      referralCode: user.referralCode,
      referralLink: `${c.req.url.split('/referral')[0].replace('api', '')}/register/${user.referralCode}`,
      totalReferrals: referralCount,
      totalCommission: commission._sum.amount || 0,
      referrals: referrals.map(r => ({
        id: r.id,
        name: r.name,
        phone: r.phone.slice(0, 3) + '***' + r.phone.slice(-2),
        joinedAt: r.createdAt,
      })),
    },
  })
})

// ═══════════════════════════════════════════════════════════
// ACTIVITY ROUTES
// ═══════════════════════════════════════════════════════════

// Get user activity summary
app.get('/activity/summary', authMiddleware, async (c) => {
  const user = c.get('user')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [todayBets, todayWins, todayTransactions, totalBets] = await Promise.all([
    prisma.bet.count({
      where: { userId: user.id, createdAt: { gte: today } },
    }),
    prisma.bet.count({
      where: { userId: user.id, createdAt: { gte: today }, isWin: true },
    }),
    prisma.transaction.count({
      where: { userId: user.id, createdAt: { gte: today } },
    }),
    prisma.bet.count({ where: { userId: user.id } }),
  ])

  return c.json({
    ok: true,
    data: {
      todayBets,
      todayWins,
      todayTransactions,
      totalBets,
      vipLevel: user.vipLevel,
    },
  })
})

// ═══════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════

const ADMIN_PHONE = '03052884177'
const ADMIN_PASS = '@ ZainabAbbas732'

// Admin login (separate from user login)
app.post('/admin/login', async (c) => {
  const { phone, password } = await c.req.json()
  if (phone === ADMIN_PHONE && password === ADMIN_PASS) {
    const adminToken = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
    return c.json({ ok: true, data: { token: adminToken } })
  }
  return c.json({ error: 'Invalid admin credentials' }, 401)
})

// Admin auth middleware
const adminMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as any
    if (payload.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

// Admin: dashboard stats
app.get('/admin/stats', adminMiddleware, async (c) => {
  const [totalUsers, totalDeposits, totalWithdrawals, pendingDeposits, pendingWithdrawals, totalBets, totalBetAmount] = await Promise.all([
    prisma.user.count(),
    prisma.depositRequest.aggregate({ where: { status: 'approved' }, _sum: { amount: true } }),
    prisma.withdrawalRequest.aggregate({ where: { status: 'approved' }, _sum: { amount: true } }),
    prisma.depositRequest.count({ where: { status: 'pending' } }),
    prisma.withdrawalRequest.count({ where: { status: 'pending' } }),
    prisma.bet.count(),
    prisma.bet.aggregate({ _sum: { betAmount: true } }),
  ])
  return c.json({
    ok: true,
    data: {
      totalUsers,
      totalDeposits: totalDeposits._sum.amount || 0,
      totalWithdrawals: totalWithdrawals._sum.amount || 0,
      pendingDeposits,
      pendingWithdrawals,
      totalBets,
      totalBetAmount: totalBetAmount._sum.betAmount || 0,
    },
  })
})

// Admin: all users
app.get('/admin/users', adminMiddleware, async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '50')
  const search = c.req.query('search') || ''
  const skip = (page - 1) * limit

  const where: any = search ? {
    OR: [
      { phone: { contains: search } },
      { name: { contains: search } },
    ],
  } : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, phone: true, name: true, referralCode: true,
        balance: true, totalDeposit: true, totalWithdraw: true,
        vipLevel: true, isActive: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    prisma.user.count({ where }),
  ])
  return c.json({ ok: true, data: { users, total, page, totalPages: Math.ceil(total / limit) } })
})

// Admin: manual balance add/deduct
app.post('/admin/user/:id/balance', adminMiddleware, async (c) => {
  const { id } = c.req.param()
  const { amount, description } = await c.req.json()
  if (!amount || typeof amount !== 'number') return c.json({ error: 'Invalid amount' }, 400)

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id } })
    if (!user) throw new Error('User not found')
    const newBalance = user.balance + amount
    if (newBalance < 0) throw new Error('Balance cannot go negative')

    await tx.user.update({ where: { id }, data: { balance: newBalance } })
    await tx.transaction.create({
      data: {
        userId: id,
        type: amount > 0 ? 'admin_credit' : 'admin_debit',
        amount,
        balanceBefore: user.balance,
        balanceAfter: newBalance,
        description: description || (amount > 0 ? 'Admin credit' : 'Admin debit'),
      },
    })
    return { newBalance }
  })
  return c.json({ ok: true, data: { balance: result.newBalance } })
})

// Admin: toggle user active/inactive
app.post('/admin/user/:id/toggle', adminMiddleware, async (c) => {
  const { id } = c.req.param()
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return c.json({ error: 'User not found' }, 404)
  await prisma.user.update({ where: { id }, data: { isActive: !user.isActive } })
  return c.json({ ok: true, data: { isActive: !user.isActive } })
})

// Admin: all deposits
app.get('/admin/deposits', adminMiddleware, async (c) => {
  const status = c.req.query('status') || 'pending'
  const deposits = await prisma.depositRequest.findMany({
    where: { status },
    include: { user: { select: { name: true, phone: true, id: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return c.json({ ok: true, data: { deposits } })
})

// Admin: all withdrawals
app.get('/admin/withdrawals', adminMiddleware, async (c) => {
  const status = c.req.query('status') || 'pending'
  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { status },
    include: { user: { select: { name: true, phone: true, id: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return c.json({ ok: true, data: { withdrawals } })
})

// Admin: approve deposit
app.post('/admin/deposit/:id/approve', adminMiddleware, async (c) => {
  const { id } = c.req.param()
  const deposit = await prisma.depositRequest.findUnique({ where: { id } })
  if (!deposit) return c.json({ error: 'Not found' }, 404)
  if (deposit.status !== 'pending') return c.json({ error: 'Already processed' }, 400)

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: deposit.userId } })
    if (!user) throw new Error('User not found')
    const newBalance = user.balance + deposit.amount
    await tx.user.update({
      where: { id: deposit.userId },
      data: { balance: newBalance, totalDeposit: { increment: deposit.amount } },
    })
    await tx.depositRequest.update({ where: { id }, data: { status: 'approved' } })
    await tx.transaction.create({
      data: {
        userId: deposit.userId,
        type: 'deposit',
        amount: deposit.amount,
        balanceBefore: user.balance,
        balanceAfter: newBalance,
        description: `Deposit via ${deposit.method}`,
        referenceId: id,
      },
    })
  })

  // Send notification and check VIP upgrade (outside transaction)
  await createNotification(deposit.userId, 'Deposit Approved!', `Your deposit of Rs${deposit.amount} has been approved and added to your balance.`, 'deposit_approved')
  await checkVipUpgrade(deposit.userId)

  return c.json({ ok: true })
})

// Admin: reject deposit
app.post('/admin/deposit/:id/reject', adminMiddleware, async (c) => {
  const { id } = c.req.param()
  const { reason } = await c.req.json().catch(() => ({ reason: '' }))
  await prisma.depositRequest.update({ where: { id }, data: { status: 'rejected', adminNote: reason } })
  return c.json({ ok: true })
})

// Admin: approve withdrawal
app.post('/admin/withdrawal/:id/approve', adminMiddleware, async (c) => {
  const { id } = c.req.param()
  const withdrawal = await prisma.withdrawalRequest.findUnique({ where: { id } })
  if (!withdrawal) return c.json({ error: 'Not found' }, 404)
  if (withdrawal.status !== 'pending') return c.json({ error: 'Already processed' }, 400)

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: withdrawal.userId } })
    if (!user) throw new Error('User not found')
    await tx.user.update({
      where: { id: withdrawal.userId },
      data: { totalWithdraw: { increment: withdrawal.amount } },
    })
    await tx.withdrawalRequest.update({ where: { id }, data: { status: 'approved' } })
    await tx.transaction.create({
      data: {
        userId: withdrawal.userId,
        type: 'withdrawal',
        amount: -withdrawal.amount,
        balanceBefore: user.balance,
        balanceAfter: user.balance,
        description: `Withdrawal via ${withdrawal.method}`,
        referenceId: id,
      },
    })
  })
  return c.json({ ok: true })
})

// Admin: reject withdrawal
app.post('/admin/withdrawal/:id/reject', adminMiddleware, async (c) => {
  const { id } = c.req.param()
  const { reason } = await c.req.json().catch(() => ({ reason: '' }))
  await prisma.withdrawalRequest.update({ where: { id }, data: { status: 'rejected', adminNote: reason } })
  return c.json({ ok: true })
})

// ═══════════════════════════════════════════════════════════
// FILE UPLOAD (screenshots)
// ═══════════════════════════════════════════════════════════

app.post('/upload/screenshot', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.parseBody()
    const file = body['screenshot']
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400)
    }
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File too large (max 5MB)' }, 400)
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${user.id}-${Date.now()}.${ext}`
    const filepath = `./uploads/${filename}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fs = await import('fs')
    if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads', { recursive: true })
    fs.writeFileSync(filepath, buffer)

    return c.json({ ok: true, data: { url: `/uploads/${filename}`, filename } })
  } catch (err: any) {
    console.error('Upload error:', err)
    return c.json({ error: err.message || 'Upload failed' }, 500)
  }
})

// Serve uploaded files
app.get('/uploads/:filename', async (c) => {
  const { filename } = c.req.param()
  try {
    const fs = await import('fs')
    const path = await import('path')
    const filepath = path.resolve(`./uploads/${filename}`)
    if (!fs.existsSync(filepath)) return c.json({ error: 'Not found' }, 404)
    const buffer = fs.readFileSync(filepath)
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
    const mimeTypes: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' }
    c.header('Content-Type', mimeTypes[ext] || 'application/octet-stream')
    c.header('Cache-Control', 'public, max-age=31536000')
    return c.body(buffer)
  } catch {
    return c.json({ error: 'Failed to load' }, 500)
  }
})

// ═══════════════════════════════════════════════════════════
// LEGACY ADMIN ROUTES (kept for compatibility)
// ═══════════════════════════════════════════════════════════

app.get('/admin/deposits/pending', async (c) => {
  const deposits = await prisma.depositRequest.findMany({
    where: { status: 'pending' },
    include: { user: { select: { name: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return c.json({ ok: true, data: { deposits } })
})

app.get('/admin/withdrawals/pending', async (c) => {
  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { status: 'pending' },
    include: { user: { select: { name: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return c.json({ ok: true, data: { withdrawals } })
})

// ═══════════════════════════════════════════════════════════
// LEADERBOARD ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/leaderboard/today', async (c) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const topWinners = await prisma.bet.groupBy({
    by: ['userId'],
    where: { isWin: true, createdAt: { gte: today } },
    _sum: { winAmount: true },
    _count: true,
    orderBy: { _sum: { winAmount: 'desc' } },
    take: 10,
  })

  const userIds = topWinners.map(w => w.userId as string)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, phone: true, name: true },
  })
  const userMap: Record<string, any> = Object.fromEntries(users.map(u => [u.id, u]))

  return c.json({
    ok: true,
    data: {
      leaderboard: topWinners.map((w, i) => ({
        rank: i + 1,
        userId: w.userId,
        name: userMap[w.userId as string]?.name || 'Unknown',
        phone: userMap[w.userId as string]?.phone || '',
        totalWin: w._sum.winAmount || 0,
        gamesWon: w._count,
      })),
    },
  })
})

app.get('/leaderboard/weekly', async (c) => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const topWinners = await prisma.bet.groupBy({
    by: ['userId'],
    where: { isWin: true, createdAt: { gte: weekAgo } },
    _sum: { winAmount: true },
    _count: true,
    orderBy: { _sum: { winAmount: 'desc' } },
    take: 10,
  })

  const userIds2 = topWinners.map(w => w.userId as string)
  const users2 = await prisma.user.findMany({
    where: { id: { in: userIds2 } },
    select: { id: true, phone: true, name: true },
  })
  const userMap2: Record<string, any> = Object.fromEntries(users2.map(u => [u.id, u]))

  return c.json({
    ok: true,
    data: {
      leaderboard: topWinners.map((w, i) => ({
        rank: i + 1,
        userId: w.userId,
        name: userMap2[w.userId as string]?.name || 'Unknown',
        phone: userMap2[w.userId as string]?.phone || '',
        totalWin: w._sum.winAmount || 0,
        gamesWon: w._count,
      })),
    },
  })
})

// ═══════════════════════════════════════════════════════════
// CHAT ROUTES
// ═══════════════════════════════════════════════════════════

app.post('/chat/send', authMiddleware, async (c) => {
  const user = c.get('user')
  const { message } = await c.req.json()
  if (!message || !message.trim()) return c.json({ error: 'Message required' }, 400)

  const chatMsg = await prisma.chatMessage.create({
    data: { userId: user.id, message: message.trim(), isAdmin: false },
  })
  return c.json({ ok: true, data: chatMsg })
})

app.get('/chat/messages', authMiddleware, async (c) => {
  const user = c.get('user')
  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    take: 100,
  })
  // Mark admin messages as read
  await prisma.chatMessage.updateMany({
    where: { userId: user.id, isAdmin: true, isRead: false },
    data: { isRead: true },
  })
  return c.json({ ok: true, data: { messages } })
})

app.get('/chat/unread', authMiddleware, async (c) => {
  const user = c.get('user')
  const count = await prisma.chatMessage.count({
    where: { userId: user.id, isAdmin: true, isRead: false },
  })
  return c.json({ ok: true, data: { count } })
})

// Admin chat routes
app.get('/admin/chat/users', adminMiddleware, async (c) => {
  const usersWithChat = await prisma.chatMessage.groupBy({
    by: ['userId'],
    _count: true,
    orderBy: { _count: { userId: 'desc' } },
  })

  const userIds = usersWithChat.map(u => u.userId as string)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, phone: true, name: true },
  })
  const userMap: Record<string, any> = Object.fromEntries(users.map(u => [u.id, u]))

  const unreadCounts = await prisma.chatMessage.groupBy({
    by: ['userId'],
    where: { isAdmin: false, isRead: false },
    _count: true,
  })
  const unreadMap: Record<string, number> = Object.fromEntries(unreadCounts.map(u => [u.userId as string, u._count]))

  return c.json({
    ok: true,
    data: {
      users: usersWithChat.map(u => ({
        userId: u.userId,
        name: userMap[u.userId as string]?.name || 'Unknown',
        phone: userMap[u.userId as string]?.phone || '',
        totalMessages: u._count,
        unreadCount: unreadMap[u.userId as string] || 0,
      })),
    },
  })
})

app.get('/admin/chat/messages/:userId', adminMiddleware, async (c) => {
  const { userId } = c.req.param()
  const messages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: 200,
  })
  // Mark user messages as read
  await prisma.chatMessage.updateMany({
    where: { userId, isAdmin: false, isRead: false },
    data: { isRead: true },
  })
  return c.json({ ok: true, data: { messages } })
})

app.post('/admin/chat/send', adminMiddleware, async (c) => {
  const { userId, message } = await c.req.json()
  if (!userId || !message) return c.json({ error: 'userId and message required' }, 400)

  const chatMsg = await prisma.chatMessage.create({
    data: { userId, message: message.trim(), isAdmin: true },
  })
  return c.json({ ok: true, data: chatMsg })
})

// ═══════════════════════════════════════════════════════════
// VIP ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/vip/info', authMiddleware, async (c) => {
  const user = c.get('user')
  const vipLevels = [
    { level: 1, name: 'Bronze', minDeposit: 0, dailyBonus: 10, color: '#cd7f32' },
    { level: 2, name: 'Silver', minDeposit: 1000, dailyBonus: 20, color: '#c0c0c0' },
    { level: 3, name: 'Gold', minDeposit: 5000, dailyBonus: 50, color: '#ffd700' },
    { level: 4, name: 'Platinum', minDeposit: 10000, dailyBonus: 100, color: '#e5e4e2' },
    { level: 5, name: 'Diamond', minDeposit: 50000, dailyBonus: 200, color: '#b9f2ff' },
  ]

  const currentVip = vipLevels.find(v => v.level === user.vipLevel) || vipLevels[0]
  const nextVip = vipLevels.find(v => v.level === user.vipLevel + 1)

  return c.json({
    ok: true,
    data: {
      currentLevel: user.vipLevel,
      currentVip,
      nextVip,
      totalDeposit: user.totalDeposit,
      progress: nextVip ? Math.min(100, (user.totalDeposit / nextVip.minDeposit) * 100) : 100,
      allLevels: vipLevels,
    },
  })
})

// ═══════════════════════════════════════════════════════════
// DAILY BONUS ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/daily-bonus/status', authMiddleware, async (c) => {
  const user = c.get('user')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayBonus = await prisma.dailyBonus.findUnique({
    where: { userId_loginDate: { userId: user.id, loginDate: today } },
  })

  // Calculate current streak
  const last7Days = await prisma.dailyBonus.findMany({
    where: { userId: user.id, claimed: true },
    orderBy: { loginDate: 'desc' },
    take: 7,
  })

  let streak = 0
  const checkDate = new Date(today)
  for (let i = 0; i < 7; i++) {
    const found = last7Days.find(d => {
      const dDate = new Date(d.loginDate)
      return dDate.toDateString() === checkDate.toDateString()
    })
    if (found) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return c.json({
    ok: true,
    data: {
      claimedToday: !!todayBonus?.claimed,
      streak,
      nextBonus: streak >= 7 ? 100 : 10,
    },
  })
})

app.post('/daily-bonus/claim', authMiddleware, async (c) => {
  const user = c.get('user')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await prisma.dailyBonus.findUnique({
    where: { userId_loginDate: { userId: user.id, loginDate: today } },
  })
  if (existing?.claimed) {
    return c.json({ error: 'Already claimed today' }, 400)
  }

  // Calculate streak
  const last7Days = await prisma.dailyBonus.findMany({
    where: { userId: user.id, claimed: true },
    orderBy: { loginDate: 'desc' },
    take: 7,
  })

  let streak = 0
  const checkDate = new Date(today)
  for (let i = 0; i < 7; i++) {
    const found = last7Days.find(d => {
      const dDate = new Date(d.loginDate)
      return dDate.toDateString() === checkDate.toDateString()
    })
    if (found) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  const newStreak = streak + 1
  const bonusAmount = newStreak >= 7 ? 100 : 10

  await prisma.$transaction(async (tx) => {
    const u = await tx.user.findUnique({ where: { id: user.id } })
    if (!u) throw new Error('User not found')
    const newBalance = u.balance + bonusAmount

    await tx.user.update({ where: { id: user.id }, data: { balance: newBalance } })

    if (existing) {
      await tx.dailyBonus.update({
        where: { userId_loginDate: { userId: user.id, loginDate: today } },
        data: { claimed: true, streakDay: newStreak, bonusAmount },
      })
    } else {
      await tx.dailyBonus.create({
        data: { userId: user.id, loginDate: today, streakDay: newStreak, bonusAmount, claimed: true },
      })
    }

    await tx.transaction.create({
      data: {
        userId: user.id,
        type: 'bonus',
        amount: bonusAmount,
        balanceBefore: u.balance,
        balanceAfter: newBalance,
        description: newStreak >= 7 ? '7-day streak bonus!' : `Daily login bonus (day ${newStreak})`,
      },
    })

    return { newBalance }
  })

  return c.json({
    ok: true,
    data: { bonusAmount, streak: newStreak, message: `Rs${bonusAmount} bonus claimed!` },
  })
})

// ═══════════════════════════════════════════════════════════
// NOTIFICATION ROUTES (prefixed /user/ to avoid CRUD conflict)
// ═══════════════════════════════════════════════════════════

app.get('/user/notifications', authMiddleware, async (c) => {
  const user = c.get('user')
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return c.json({ ok: true, data: { notifications } })
})

app.get('/user/notifications/unread', authMiddleware, async (c) => {
  const user = c.get('user')
  const count = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  })
  return c.json({ ok: true, data: { count } })
})

app.post('/user/notifications/read', authMiddleware, async (c) => {
  const user = c.get('user')
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  })
  return c.json({ ok: true })
})

// Admin: send notification to user
app.post('/admin/notify', adminMiddleware, async (c) => {
  const { userId, title, message, type } = await c.req.json()
  if (!userId || !title || !message) return c.json({ error: 'Missing fields' }, 400)

  const notification = await prisma.notification.create({
    data: { userId, title, message, type: type || 'system' },
  })
  return c.json({ ok: true, data: notification })
})

// ═══════════════════════════════════════════════════════════
// GAME CONTROL (Admin)
// ═══════════════════════════════════════════════════════════

app.get('/admin/bets', adminMiddleware, async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '50')
  const skip = (page - 1) * limit

  const [bets, total] = await Promise.all([
    prisma.bet.findMany({
      include: { user: { select: { phone: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    prisma.bet.count(),
  ])

  const stats = await prisma.bet.aggregate({
    _sum: { betAmount: true, winAmount: true },
    _count: true,
  })

  return c.json({
    ok: true,
    data: {
      bets,
      stats: {
        totalBets: stats._count,
        totalWagered: stats._sum.betAmount || 0,
        totalWon: stats._sum.winAmount || 0,
        profit: (stats._sum.betAmount || 0) - (stats._sum.winAmount || 0),
      },
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  })
})

// Helper to create notification
async function createNotification(userId: string, title: string, message: string, type: string) {
  try {
    await prisma.notification.create({ data: { userId, title, message, type } })
  } catch { /* ignore */ }
}

// Helper to check and upgrade VIP
async function checkVipUpgrade(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  let newLevel = 1
  if (user.totalDeposit >= 100000) newLevel = 5
  else if (user.totalDeposit >= 50000) newLevel = 4
  else if (user.totalDeposit >= 10000) newLevel = 3
  else if (user.totalDeposit >= 5000) newLevel = 2

  if (newLevel > user.vipLevel) {
    await prisma.user.update({ where: { id: userId }, data: { vipLevel: newLevel } })
    const vipNames = ['', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
    await createNotification(userId, 'VIP Upgrade!', `Congratulations! You've been upgraded to VIP ${newLevel} (${vipNames[newLevel]})`, 'vip_upgrade')
  }
}

// ═══════════════════════════════════════════════════════════
// AVIATOR GAME ROUTES
// ═══════════════════════════════════════════════════════════

function generateCrashMultiplier(): number {
  // House edge ~3%. Average crash ~1.03x with some big multipliers
  const e = 0.97
  const u = Math.random()
  if (u === 0) return 100
  const raw = Math.min(100, (1 / (1 - u)) * (1 - e) + 1)
  return Math.round(raw * 100) / 100
}

// Get current/next round
app.get('/aviator/current-round', authMiddleware, async (c) => {
  try {
    let round = await prisma.aviatorRound.findFirst({ where: { status: 'waiting' }, orderBy: { createdAt: 'desc' } })
    if (!round) {
      const crashPoint = generateCrashMultiplier()
      round = await prisma.aviatorRound.create({ data: { crashMultiplier: crashPoint, status: 'waiting' } })
    }
    const recentRounds = await prisma.aviatorRound.findMany({
      where: { status: 'crashed' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { crashMultiplier: true, createdAt: true },
    })
    return c.json({ ok: true, data: { round: { id: round.id, status: round.status, createdAt: round.createdAt }, history: recentRounds } })
  } catch (e: any) {
    console.error('AVIATOR ERROR:', e.message, e.stack)
    return c.json({ error: e.message }, 500)
  }
})

// Place Aviator bet
app.post('/aviator/bet', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { amount, autoCashout, roundId } = await c.req.json()

    if (!amount || amount < 10) return c.json({ error: 'Minimum bet is Rs10' }, 400)
    if (amount > user.balance) return c.json({ error: 'Insufficient balance' }, 400)

    // Get or create round
    let round = roundId ? await prisma.aviatorRound.findUnique({ where: { id: roundId } }) : null
    if (!round || round.status !== 'waiting') {
      round = await prisma.aviatorRound.findFirst({ where: { status: 'waiting' }, orderBy: { createdAt: 'desc' } })
      if (!round) {
        const crashPoint = generateCrashMultiplier()
        round = await prisma.aviatorRound.create({ data: { crashMultiplier: crashPoint, status: 'waiting' } })
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const u = await tx.user.findUnique({ where: { id: user.id } })
      if (!u) throw new Error('User not found')
      if (u.balance < amount) throw new Error('Insufficient balance')
      const newBalance = u.balance - amount
      await tx.user.update({ where: { id: user.id }, data: { balance: newBalance } })

      const bet = await tx.aviatorBet.create({
        data: {
          userId: user.id,
          roundId: round!.id,
          betAmount: amount,
          autoCashout: autoCashout || null,
          status: 'active',
        },
      })

      await tx.transaction.create({
        data: { userId: user.id, type: 'bet_place', amount: -amount, balanceBefore: u.balance, balanceAfter: newBalance, description: `Aviator bet Rs${amount}`, referenceId: bet.id },
      })

      return { bet, newBalance }
    })

    return c.json({ ok: true, data: { betId: result.bet.id, roundId: round.id, balance: result.newBalance } })
  } catch (err: any) {
    return c.json({ error: err.message || 'Bet failed' }, 500)
  }
})

// Cashout Aviator
app.post('/aviator/cashout', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { betId, multiplier } = await c.req.json()

    if (!betId || !multiplier || multiplier < 1) return c.json({ error: 'Invalid cashout' }, 400)

    const bet = await prisma.aviatorBet.findUnique({ where: { id: betId } })
    if (!bet) return c.json({ error: 'Bet not found' }, 404)
    if (bet.userId !== user.id) return c.json({ error: 'Not your bet' }, 403)
    if (bet.status !== 'active') return c.json({ error: 'Bet already settled' }, 400)

    const round = await prisma.aviatorRound.findUnique({ where: { id: bet.roundId } })
    if (!round) return c.json({ error: 'Round not found' }, 404)
    if (round.status === 'crashed') return c.json({ error: 'Round already crashed' }, 400)

    const winAmount = Math.round(bet.betAmount * multiplier * 100) / 100

    const result = await prisma.$transaction(async (tx) => {
      const u = await tx.user.findUnique({ where: { id: user.id } })
      if (!u) throw new Error('User not found')
      const newBalance = u.balance + winAmount

      await tx.user.update({ where: { id: user.id }, data: { balance: newBalance } })
      await tx.aviatorBet.update({
        where: { id: betId },
        data: { status: 'cashed_out', cashoutMultiplier: multiplier, winAmount },
      })

      await tx.transaction.create({
        data: { userId: user.id, type: 'bet_win', amount: winAmount, balanceBefore: u.balance, balanceAfter: newBalance, description: `Aviator cashout ${multiplier}x = Rs${winAmount}`, referenceId: betId },
      })

      return { newBalance }
    })

    return c.json({ ok: true, data: { winAmount, multiplier, balance: result.newBalance } })
  } catch (err: any) {
    return c.json({ error: err.message || 'Cashout failed' }, 500)
  }
})

// Start round (server triggers this — for demo, any bet auto-starts)
app.post('/aviator/start-round', authMiddleware, async (c) => {
  const round = await prisma.aviatorRound.findFirst({ where: { status: 'waiting' }, orderBy: { createdAt: 'desc' } })
  if (!round) return c.json({ error: 'No waiting round' }, 404)

  // Start the round
  await prisma.aviatorRound.update({ where: { id: round.id }, data: { status: 'flying' } })

  // Schedule crash after delay (simulated — in production use websockets)
  const crashAt = round.crashMultiplier
  // Auto-crash after time proportional to crash point
  const flyTime = Math.min(30000, Math.max(2000, Math.log2(crashAt) * 3000))

  setTimeout(async () => {
    try {
      const r = await prisma.aviatorRound.findUnique({ where: { id: round.id } })
      if (!r || r.status !== 'flying') return

      await prisma.aviatorRound.update({ where: { id: round.id }, data: { status: 'crashed', endedAt: new Date() } })

      // Auto-lose active bets (not cashed out)
      const activeBets = await prisma.aviatorBet.findMany({ where: { roundId: round.id, status: 'active' } })
      for (const bet of activeBets) {
        await prisma.aviatorBet.update({ where: { id: bet.id }, data: { status: 'crashed', winAmount: 0 } })
      }

      // Create new waiting round for next game
      const nextCrash = generateCrashMultiplier()
      await prisma.aviatorRound.create({ data: { crashMultiplier: nextCrash, status: 'waiting' } })
    } catch (e) { console.error('Aviator crash error:', e) }
  }, flyTime)

  return c.json({ ok: true, data: { roundId: round.id, status: 'flying' } })
})

// ═══════════════════════════════════════════════════════════
// CHICKEN ROAD GAME ROUTES
// ═══════════════════════════════════════════════════════════

const CHICKEN_DIFFICULTY: Record<string, { totalSteps: number; fireCount: number; multiplierGrowth: number }> = {
  easy:     { totalSteps: 8,  fireCount: 2, multiplierGrowth: 1.2 },
  medium:   { totalSteps: 10, fireCount: 3, multiplierGrowth: 1.5 },
  hard:     { totalSteps: 12, fireCount: 5, multiplierGrowth: 2.0 },
  hardcore: { totalSteps: 15, fireCount: 8, multiplierGrowth: 3.0 },
}

function generateFirePositions(totalSteps: number, fireCount: number): number[] {
  const positions = new Set<number>()
  while (positions.size < fireCount) {
    positions.add(Math.floor(Math.random() * totalSteps) + 1) // steps 1-indexed
  }
  return Array.from(positions).sort((a, b) => a - b)
}

// Start chicken session
app.post('/chicken/start', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { amount, difficulty } = await c.req.json()

    if (!amount || amount < 10) return c.json({ error: 'Minimum bet is Rs10' }, 400)
    if (amount > user.balance) return c.json({ error: 'Insufficient balance' }, 400)
    const diff = CHICKEN_DIFFICULTY[difficulty]
    if (!diff) return c.json({ error: 'Invalid difficulty' }, 400)

    const firePositions = generateFirePositions(diff.totalSteps, diff.fireCount)

    const result = await prisma.$transaction(async (tx) => {
      const u = await tx.user.findUnique({ where: { id: user.id } })
      if (!u) throw new Error('User not found')
      if (u.balance < amount) throw new Error('Insufficient balance')
      const newBalance = u.balance - amount
      await tx.user.update({ where: { id: user.id }, data: { balance: newBalance } })

      const session = await tx.chickenSession.create({
        data: {
          userId: user.id,
          betAmount: amount,
          difficulty,
          totalSteps: diff.totalSteps,
          stepsCompleted: 0,
          currentMultiplier: 1.0,
          firePositions: JSON.stringify(firePositions),
          status: 'playing',
        },
      })

      await tx.transaction.create({
        data: { userId: user.id, type: 'bet_place', amount: -amount, balanceBefore: u.balance, balanceAfter: newBalance, description: `Chicken Road ${difficulty} Rs${amount}`, referenceId: session.id },
      })

      return { session, newBalance }
    })

    return c.json({
      ok: true,
      data: {
        sessionId: result.session.id,
        difficulty,
        totalSteps: diff.totalSteps,
        currentMultiplier: 1.0,
        balance: result.newBalance,
      },
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to start' }, 500)
  }
})

// Step forward in chicken
app.post('/chicken/step', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { sessionId } = await c.req.json()

    const session = await prisma.chickenSession.findUnique({ where: { id: sessionId } })
    if (!session) return c.json({ error: 'Session not found' }, 404)
    if (session.userId !== user.id) return c.json({ error: 'Not your session' }, 403)
    if (session.status !== 'playing') return c.json({ error: 'Session ended' }, 400)

    const newStep = session.stepsCompleted + 1
    const diff = CHICKEN_DIFFICULTY[session.difficulty]
    const firePositions: number[] = JSON.parse(session.firePositions)

    if (firePositions.includes(newStep)) {
      // Chicken hit fire — game over
      await prisma.chickenSession.update({
        where: { id: sessionId },
        data: { status: 'crashed', stepsCompleted: newStep, finalMultiplier: 0, endedAt: new Date() },
      })
      return c.json({ ok: true, data: { status: 'crashed', step: newStep, multiplier: 0 } })
    }

    const newMultiplier = Math.round((1 + newStep * diff.multiplierGrowth) * 100) / 100
    await prisma.chickenSession.update({
      where: { id: sessionId },
      data: { stepsCompleted: newStep, currentMultiplier: newMultiplier },
    })

    return c.json({
      ok: true,
      data: {
        status: newStep >= diff.totalSteps ? 'completed' : 'playing',
        step: newStep,
        totalSteps: diff.totalSteps,
        multiplier: newMultiplier,
        completed: newStep >= diff.totalSteps,
      },
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Step failed' }, 500)
  }
})

// Cashout chicken
app.post('/chicken/cashout', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { sessionId } = await c.req.json()

    const session = await prisma.chickenSession.findUnique({ where: { id: sessionId } })
    if (!session) return c.json({ error: 'Session not found' }, 404)
    if (session.userId !== user.id) return c.json({ error: 'Not your session' }, 403)
    if (session.status !== 'playing') return c.json({ error: 'Session already ended' }, 400)
    if (session.stepsCompleted === 0) return c.json({ error: 'Take at least one step first' }, 400)

    const winAmount = Math.round(session.betAmount * session.currentMultiplier * 100) / 100

    const result = await prisma.$transaction(async (tx) => {
      const u = await tx.user.findUnique({ where: { id: user.id } })
      if (!u) throw new Error('User not found')
      const newBalance = u.balance + winAmount

      await tx.user.update({ where: { id: user.id }, data: { balance: newBalance } })
      await tx.chickenSession.update({
        where: { id: sessionId },
        data: { status: 'cashed_out', cashoutMultiplier: session.currentMultiplier, winAmount, finalMultiplier: session.currentMultiplier, endedAt: new Date() },
      })

      await tx.transaction.create({
        data: { userId: user.id, type: 'bet_win', amount: winAmount, balanceBefore: u.balance, balanceAfter: newBalance, description: `Chicken Road cashout ${session.currentMultiplier}x = Rs${winAmount}`, referenceId: sessionId },
      })

      return { newBalance }
    })

    return c.json({
      ok: true,
      data: { winAmount, multiplier: session.currentMultiplier, balance: result.newBalance },
    })
  } catch (err: any) {
    return c.json({ error: err.message || 'Cashout failed' }, 500)
  }
})

// Get chicken session info (for polling)
app.get('/chicken/session/:id', authMiddleware, async (c) => {
  const { id } = c.req.param()
  const session = await prisma.chickenSession.findUnique({ where: { id }, select: { id: true, betAmount: true, difficulty: true, stepsCompleted: true, totalSteps: true, currentMultiplier: true, status: true, winAmount: true } })
  if (!session) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true, data: session })
})

// ═══════════════════════════════════════════════════════════
// ADMIN: AVIATOR & CHICKEN HISTORY
// ═══════════════════════════════════════════════════════════

app.get('/admin/aviator/rounds', adminMiddleware, async (c) => {
  const rounds = await prisma.aviatorRound.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { bets: { include: { user: { select: { phone: true, name: true } } } } },
  })
  const stats = await prisma.aviatorBet.aggregate({ _sum: { betAmount: true, winAmount: true }, _count: true })
  return c.json({
    ok: true,
    data: {
      rounds,
      stats: {
        totalBets: stats._count,
        totalWagered: stats._sum.betAmount || 0,
        totalWon: stats._sum.winAmount || 0,
        profit: (stats._sum.betAmount || 0) - (stats._sum.winAmount || 0),
      },
    },
  })
})

app.get('/admin/chicken/sessions', adminMiddleware, async (c) => {
  const sessions = await prisma.chickenSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { phone: true, name: true } } },
  })
  const stats = await prisma.chickenSession.aggregate({ _sum: { betAmount: true, winAmount: true }, _count: true })
  return c.json({
    ok: true,
    data: {
      sessions,
      stats: {
        totalSessions: stats._count,
        totalWagered: stats._sum.betAmount || 0,
        totalWon: stats._sum.winAmount || 0,
        profit: (stats._sum.betAmount || 0) - (stats._sum.winAmount || 0),
      },
    },
  })
})

export default app

