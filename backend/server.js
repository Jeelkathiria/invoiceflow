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
    console.log(`
    ======================================================
    ℹ️ Port ${PORT} is already in use by a running backend process.
    The InvoiceFlow API is ALREADY ACTIVE and listening at:
    📡 http://localhost:${PORT}
    ======================================================
    `)
    process.exit(0)
  } else {
    console.error('Server error:', err)
  }
})
