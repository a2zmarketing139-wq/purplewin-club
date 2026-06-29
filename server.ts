import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import customApp from "./custom-routes"

const app = new Hono()

// Health check — Railway uses this to verify the app is alive
app.get("/health", (c) => c.json({ ok: true }))

// Mount API routes at /api (frontend fetches /api/auth/login etc.)
app.route("/api", customApp)

// Serve static frontend files from dist/
app.use("/assets/*", serveStatic({ root: "./dist" }))
app.use("/*.css", serveStatic({ root: "./dist" }))
app.use("/*.js", serveStatic({ root: "./dist" }))

// SPA fallback — catch-all returns index.html for client-side routing
app.get("*", serveStatic({ root: "./dist", path: "index.html" }))

const PORT = parseInt(process.env.PORT || "3000")

serve({
  fetch: app.fetch,
  port: PORT,
  hostname: "0.0.0.0"
}, (info) => {
  console.log(`Server running on port ${info.port}`)
})
