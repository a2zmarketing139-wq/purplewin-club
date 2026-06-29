import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import app from "./custom-routes"

const PORT = parseInt(process.env.PORT || "3000")

// Serve static frontend files from dist/
app.use("/assets/*", serveStatic({ root: "./dist" }))
app.use("/*.css", serveStatic({ root: "./dist" }))
app.use("/*.js", serveStatic({ root: "./dist" }))
app.use("/*.png", serveStatic({ root: "./dist" }))
app.use("/*.ico", serveStatic({ root: "./dist" }))
app.use("/favicon.ico", serveStatic({ root: "./dist" }))

// Serve index.html for all non-API routes (SPA fallback)
app.get("*", serveStatic({ root: "./dist", path: "index.html" }))

serve({
  fetch: app.fetch,
  port: PORT,
  hostname: "0.0.0.0"
}, (info) => {
  console.log(`Server running on port ${info.port}`)
})
