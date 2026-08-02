import mongoose from 'mongoose'

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
})

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      trim: true,
      index: true,
    },
    vendorName: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
    },
    vendorGstin: {
      type: String,
      default: '',
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    invoiceUrl: {
      type: String,
      default: '',
    },
    lineItems: [lineItemSchema],
    confidenceScore: {
      type: Number,
      default: 95.0,
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    duplicate: {
      type: Boolean,
      default: false,
    },
    matchedInvoice: {
      invoiceNumber: { type: String, default: '' },
      vendorName: { type: String, default: '' },
      amount: { type: Number, default: 0 },
      status: { type: String, default: '' },
      createdAt: { type: Date },
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

export const Invoice = mongoose.model('Invoice', invoiceSchema)
