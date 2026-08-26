import mongoose from 'mongoose'

export const seedDefaultUsers = async () => {
  try {
    const { User } = await import('../models/User.js')

    // Seed or ensure Manager Account: Manager@gmail.com / Manager
    const managerEmail = 'manager@gmail.com'
    let manager = await User.findOne({ email: managerEmail })
    if (!manager) {
      await User.create({
        name: 'Finance Manager',
        email: managerEmail,
        password: 'Manager',
        role: 'manager',
      })
      console.log('[MongoDB Seed] Created fixed Manager account: Manager@gmail.com')
    } else {
      const isPasswordValid = await manager.comparePassword('Manager')
      if (!isPasswordValid || manager.role !== 'manager') {
        manager.password = 'Manager'
        manager.role = 'manager'
        await manager.save()
        console.log('[MongoDB Seed] Updated Manager account: Manager@gmail.com')
      }
    }
  } catch (err) {
    console.warn('[MongoDB Seed Error]:', err.message)
  }
}

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/invoiceflow'
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`)
    
    // Seed single manager
    await seedDefaultUsers()

    return conn
  } catch (error) {
    console.error(`[MongoDB Warning]: Could not connect to MongoDB (${error.message}).`)
    throw error
  }
}
