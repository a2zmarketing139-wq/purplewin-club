import { serve } from "@hono/node-server"
import app from "./custom-routes"

const PORT = parseInt(process.env.PORT || "3000")

serve({
  fetch: app.fetch,
  port: PORT,
  hostname: "0.0.0.0"
}, (info) => {
  console.log(`Server running on port ${info.port}`)
})
