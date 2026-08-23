import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../../.env') })

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/invoiceflow'

async function clearInvoices() {
  try {
    console.log(`Connecting to MongoDB at ${mongoUri}...`)
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB.')

    const invoiceCountBefore = await mongoose.connection.db.collection('invoices').countDocuments()
    console.log(`Found ${invoiceCountBefore} invoices in DB. Deleting all invoices...`)

    await mongoose.connection.db.collection('invoices').deleteMany({})
    console.log('All invoices cleared from MongoDB!')

    // Optionally clear notifications and approval logs as well
    try {
      await mongoose.connection.db.collection('notifications').deleteMany({})
      console.log('All notifications cleared from MongoDB.')
    } catch (e) {}

    try {
      await mongoose.connection.db.collection('approvallogs').deleteMany({})
      console.log('All approval logs cleared from MongoDB.')
    } catch (e) {}

    const remainingUsers = await mongoose.connection.db.collection('users').find({}).toArray()
    console.log('Preserved users in DB:')
    remainingUsers.forEach(u => console.log(` - ${u.name} (${u.email}) [Role: ${u.role}]`))

    await mongoose.disconnect()
    console.log('Disconnected from DB successfully.')
    process.exit(0)
  } catch (err) {
    console.error('Error clearing invoices:', err)
    process.exit(1)
  }
}

clearInvoices()
