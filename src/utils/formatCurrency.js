/**
 * Formats currency amounts dynamically based on the currency string (USD, INR, EUR, GBP, $, ₹, etc.)
 */
export function getCurrencySymbol(currency = 'INR') {
  if (!currency) return '₹'
  const c = String(currency).toUpperCase().trim()
  if (c === 'USD' || c === '$') return '$'
  if (c === 'EUR' || c === '€') return '€'
  if (c === 'GBP' || c === '£') return '£'
  if (c === 'INR' || c === '₹' || c === 'RS' || c === 'RS.') return '₹'
  return '₹'
}

export function formatCurrency(amount = 0, currency = 'INR') {
  const num = Number(amount) || 0
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${num.toLocaleString('en-IN')}`
}
