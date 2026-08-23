import app from './app.js'
import { connectDB } from './src/config/db.js'

const PORT = process.env.PORT || 5001

const server = app.listen(PORT, () => {
  console.log(`
  ======================================================
  🚀 InvoiceFlow Enterprise Backend Server Running
  📡 URL: http://localhost:${PORT}
  🛠️  Environment: ${process.env.NODE_ENV || 'development'}
  ======================================================
  `)

  // Asynchronously connect to MongoDB
  connectDB()
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`
    ======================================================
    ⚠️  PORT CONFLICT DETECTED: Port ${PORT} is already in use.
    An existing Node process is running in the background.

    To stop the old process and free Port ${PORT}:
    👉 Run: npx kill-port ${PORT}
    or: taskkill /F /IM node.exe
    ======================================================
    `)
    process.exit(1)
  } else {
    console.error('Server error:', err)
  }
})

process.on('uncaughtException', (err) => {
  console.warn('[Server Process Uncaught Exception Safe Guard]:', err?.message || err)
})

process.on('unhandledRejection', (reason) => {
  console.warn('[Server Process Unhandled Rejection Safe Guard]:', reason?.message || reason)
})
