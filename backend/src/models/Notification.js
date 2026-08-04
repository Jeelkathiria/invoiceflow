import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    recipientRole: {
      type: String,
      enum: ['all', 'manager', 'finance'],
      default: 'all',
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'danger', 'success'],
      default: 'info',
    },
    link: {
      type: String,
      default: '/app',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export const Notification = mongoose.model('Notification', notificationSchema)
