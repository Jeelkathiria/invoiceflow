import mongoose from 'mongoose'

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
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
    buyerName: {
      type: String,
      default: '',
    },
    buyerGstin: {
      type: String,
      default: '',
    },
    poNumber: {
      type: String,
      default: '',
    },
    paymentTerms: {
      type: String,
      default: 'Due on Receipt',
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
    cgst: {
      type: Number,
      default: 0,
    },
    sgst: {
      type: Number,
      default: 0,
    },
    igst: {
      type: Number,
      default: 0,
    },
    shippingCharges: {
      type: Number,
      default: 0,
    },
    otherCharges: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      default: 'INR',
    },
    invoiceUrl: {
      type: String,
      default: '',
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
    strategy: {
      type: String,
      enum: ['OCR_ONLY', 'OCR_FALLBACK_GEMINI'],
      default: 'OCR_ONLY',
    },
    extractionSource: {
      type: String,
      enum: ['OCR', 'GEMINI'],
      default: 'OCR',
    },
    ocrConfidence: {
      type: Number,
      default: 0,
    },
    missingMandatoryFields: [{ type: String }],
    missingOptionalFields: [{ type: String }],
    extractionReport: {
      strategy: { type: String, default: 'OCR_ONLY' },
      extractionSource: { type: String, default: 'OCR' },
      ocrConfidence: { type: Number, default: 0 },
      missingMandatoryFields: [{ type: String }],
      missingOptionalFields: [{ type: String }],
      duplicateFlag: { type: Boolean, default: false },
      validationErrors: [{ type: String }],
      processingTime: { type: Number, default: 0 },
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
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

export const Invoice = mongoose.model('Invoice', invoiceSchema)
