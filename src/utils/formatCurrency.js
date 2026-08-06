/**
 * Standard exchange rates relative to 1 USD / 1 EUR / 1 GBP
 */
export const EXCHANGE_RATES_TO_INR = {
  INR: 1,
  RS: 1,
  '₹': 1,
  USD: 83.5,
  '$': 83.5,
  EUR: 91.0,
  '€': 91.0,
  GBP: 106.0,
  '£': 106.0,
}

/**
 * Normalizes currency string to uppercase ISO symbol (INR, USD, EUR, GBP)
 */
export function normalizeCurrency(currency = 'INR') {
  if (!currency) return 'INR'
  const c = String(currency).toUpperCase().trim()
  if (c === 'USD' || c === '$') return 'USD'
  if (c === 'EUR' || c === '€') return 'EUR'
  if (c === 'GBP' || c === '£') return 'GBP'
  return 'INR'
}

/**
 * Returns currency symbol for a currency code
 */
export function getCurrencySymbol(currency = 'INR') {
  const norm = normalizeCurrency(currency)
  if (norm === 'USD') return '$'
  if (norm === 'EUR') return '€'
  if (norm === 'GBP') return '£'
  return '₹'
}

/**
 * Formats currency amounts dynamically based on the currency string
 */
export function formatCurrency(amount = 0, currency = 'INR') {
  const num = Number(amount) || 0
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${num.toLocaleString('en-IN')}`
}

/**
 * Calculates itemized totals per currency AND equivalent converted grand totals
 * @param {Array<{ amount?: number, totalAmount?: number, currency?: string }>} items
 */
export function calculateMultiCurrencyTotals(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      inrTotal: 0,
      usdTotal: 0,
      eurTotal: 0,
      gbpTotal: 0,
      equivalentInr: 0,
      equivalentUsd: 0,
      hasMultipleCurrencies: false,
      formattedInr: '₹0',
      formattedUsd: '$0',
      formattedSummary: '₹0',
      formattedDual: '₹0',
    }
  }

  let inrTotal = 0
  let usdTotal = 0
  let eurTotal = 0
  let gbpTotal = 0

  items.forEach((item) => {
    const val = Number(item.amount || item.totalAmount || item.total || 0) || 0
    const curr = normalizeCurrency(item.currency)
    if (curr === 'USD') usdTotal += val
    else if (curr === 'EUR') eurTotal += val
    else if (curr === 'GBP') gbpTotal += val
    else inrTotal += val
  })

  // Converted equivalents
  const equivalentInr = inrTotal + (usdTotal * 83.5) + (eurTotal * 91.0) + (gbpTotal * 106.0)
  const equivalentUsd = usdTotal + (inrTotal / 83.5) + (eurTotal * (91.0 / 83.5)) + (gbpTotal * (106.0 / 83.5))

  const activeCurrenciesCount = [inrTotal > 0, usdTotal > 0, eurTotal > 0, gbpTotal > 0].filter(Boolean).length
  const hasMultipleCurrencies = activeCurrenciesCount > 1

  // Dual format strings
  const formattedInr = `₹${Math.round(equivalentInr).toLocaleString('en-IN')}`
  const formattedUsd = `$${Math.round(equivalentUsd).toLocaleString('en-US')}`

  const parts = []
  if (inrTotal > 0) parts.push(`₹${Math.round(inrTotal).toLocaleString('en-IN')}`)
  if (usdTotal > 0) parts.push(`$${Math.round(usdTotal).toLocaleString('en-US')}`)
  if (eurTotal > 0) parts.push(`€${Math.round(eurTotal).toLocaleString('de-DE')}`)
  if (gbpTotal > 0) parts.push(`£${Math.round(gbpTotal).toLocaleString('en-GB')}`)

  let formattedDual = '₹0'
  if (parts.length === 1) {
    formattedDual = parts[0]
  } else if (parts.length > 1) {
    formattedDual = parts.join(' + ')
  }

  return {
    inrTotal,
    usdTotal,
    eurTotal,
    gbpTotal,
    equivalentInr,
    equivalentUsd,
    hasMultipleCurrencies,
    formattedInr,
    formattedUsd,
    formattedDual,
    formattedSummary: hasMultipleCurrencies ? `${formattedInr} (${formattedUsd})` : formattedDual,
  }
}
