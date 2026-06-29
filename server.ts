import { Hono } from "hono"
import { cors } from "hono/cors"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import app from "./custom-routes"

const PORT = parseInt(process.env.PORT || "3000")

// Health check at root
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }))

// CORS for all API routes
app.use("/api/*", cors())

// Serve static frontend files from dist/
app.use("/assets/*", serveStatic({ root: "./dist" }))
app.use("/*.css", serveStatic({ root: "./dist" }))
app.use("/*.js", serveStatic({ root: "./dist" }))
app.use("/*.png", serveStatic({ root: "./dist" }))
app.use("/*.ico", serveStatic({ root: "./dist" }))

// SPA fallback — non-API, non-static routes serve index.html
app.get("*", serveStatic({ root: "./dist", path: "index.html" }))

serve({
  fetch: app.fetch,
  port: PORT,
  hostname: "0.0.0.0"
}, (info) => {
  console.log(`Server running on port ${info.port}`)
})
