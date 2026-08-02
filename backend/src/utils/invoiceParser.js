/**
 * Sanitizes and normalizes raw JSON data extracted from Google Gemini API
 */
export const sanitizeInvoiceData = (rawData = {}) => {
  return {
    invoiceNumber: rawData.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
    vendorName: rawData.vendorName || 'Unknown Vendor',
    invoiceDate: rawData.invoiceDate ? new Date(rawData.invoiceDate) : new Date(),
    dueDate: rawData.dueDate ? new Date(rawData.dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    amount: Number(rawData.amount) || 0,
    gst: Number(rawData.gst) || 0,
    currency: rawData.currency || 'INR',
    lineItems: Array.isArray(rawData.lineItems)
      ? rawData.lineItems.map(item => ({
          description: item.description || 'Line Item',
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || Number(item.amount) || 0,
          amount: Number(item.amount) || 0,
        }))
      : [],
    confidenceScore: Number(rawData.confidenceScore) || 96.5,
  }
}
