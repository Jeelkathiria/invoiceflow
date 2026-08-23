import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../../.env') })

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/invoiceflow'

async function removeFinanceAccount() {
  try {
    console.log(`Connecting to MongoDB at ${mongoUri}...`)
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB.')

    const result = await mongoose.connection.db.collection('users').deleteOne({ email: 'finance@gmail.com' })
    if (result.deletedCount > 0) {
      console.log('Successfully deleted finance@gmail.com account from MongoDB.')
    } else {
      console.log('Account finance@gmail.com was not found or already deleted.')
    }

    const remainingUsers = await mongoose.connection.db.collection('users').find({}).toArray()
    console.log('Remaining User Accounts in DB:')
    remainingUsers.forEach(u => console.log(` - ${u.name} (${u.email}) [Role: ${u.role}]`))

    await mongoose.disconnect()
    console.log('Disconnected from DB successfully.')
    process.exit(0)
  } catch (err) {
    console.error('Error deleting account:', err)
    process.exit(1)
  }
}

removeFinanceAccount()
