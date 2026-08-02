import api from './axios'

export const invoiceService = {
  fetchInvoices: async () => api.get('/invoices'),
  fetchInvoiceById: async (invoiceId) => api.get(`/invoices/${invoiceId}`),
  uploadInvoice: async (payload) => api.post('/invoices', payload),
  approveInvoice: async (invoiceId, payload) => api.post(`/invoices/${invoiceId}/approve`, payload),
  rejectInvoice: async (invoiceId, payload) => api.post(`/invoices/${invoiceId}/reject`, payload),
}
