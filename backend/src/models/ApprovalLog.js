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
    enum: ['Approved', 'Rejected', 'Flagged', 'SUBMITTED', 'APPROVED', 'REJECTED', 'RESUBMITTED'],
    required: true,
  },
  reason: {
    type: String,
    default: '',
  },
  comment: {
    type: String,
    default: '',
  },
  revisionNumber: {
    type: Number,
    default: 1,
  },
  changes: [
    {
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export const ApprovalLog = mongoose.model('ApprovalLog', approvalLogSchema)
