import app from '../backend/app.js'
import { connectDB } from '../backend/src/config/db.js'

export default async function handler(req, res) {
  try {
    await connectDB()
  } catch (err) {
    console.error('[Vercel DB Connection Error]:', err.message)
    return res.status(500).json({
      success: false,
      message: 'Database Connection Error: Please ensure MONGO_URI is added to Vercel Environment Variables and IP 0.0.0.0/0 is allowed in MongoDB Atlas.',
      error: err.message,
    })
  }
  return app(req, res)
}
