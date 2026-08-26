import app from '../backend/app.js'
import { connectDB } from '../backend/src/config/db.js'

let isConnected = false

export default async function handler(req, res) {
  if (!isConnected) {
    try {
      await connectDB()
      isConnected = true
    } catch (err) {
      console.warn('[Vercel Serverless DB Warning]:', err.message)
    }
  }
  return app(req, res)
}
