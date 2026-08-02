import mongoose from 'mongoose'

const approvalLogSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['Approved', 'Rejected', 'Flagged'],
    required: true,
  },
  comment: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export const ApprovalLog = mongoose.model('ApprovalLog', approvalLogSchema)
