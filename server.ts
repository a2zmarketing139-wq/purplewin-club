import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { prisma } from './src/lib/db'
import customRoutes from './custom-routes'

const app = new Hono()

// CORS
app.use('*', async (c, next) => {
  c.res.headers.set('Access-Control-Allow-Origin', '*')
  c.res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (c.req.method === 'OPTIONS') return c.text('', 204)
  await next()
})

// Health check
app.get('/health', (c) => c.json({ ok: true, timestamp: new Date().toISOString() }))

// All custom API routes
app.route('/api', customRoutes)

// Serve built frontend
app.use('/*', serveStatic({ root: './dist' }))
app.get('*', serveStatic({ path: './dist/index.html' }))

const port = Number(process.env.PORT) || 3000
console.log(`🚀 PurpleWin Club running on http://localhost:${port}`)

serve({ port, fetch: app.fetch })
