import { useState, useEffect } from 'react'
import { FileText, ExternalLink, Download } from 'lucide-react'

export function generateInvoiceSVG(invoice) {
  const invNumber = invoice?.invoiceNumber || invoice?.id || 'INV-2026-001'
  const vendor = invoice?.vendorName || invoice?.vendor || 'Vendor Business Ltd'
  const gstin = invoice?.vendorGstin || '22-AAAAA0000A-1-Z-5'
  const date = invoice?.invoiceDate || '-'
  const due = (invoice?.dueDate && invoice.dueDate !== 'null' && invoice.dueDate !== 'undefined' && invoice.dueDate !== '-') ? (typeof invoice.dueDate === 'string' && !invoice.dueDate.includes('T') ? invoice.dueDate : new Date(invoice.dueDate).toLocaleDateString()) : '-'
  const sym = (invoice?.currency === 'USD' || invoice?.currency === '$') ? '$' : (invoice?.currency === 'EUR' || invoice?.currency === '€' ? '€' : (invoice?.currency === 'GBP' || invoice?.currency === '£' ? '£' : '₹'))
  const total = (invoice?.totalAmount || invoice?.amount || 0).toLocaleString('en-IN')
  const subtotal = (invoice?.subtotal || Math.round((invoice?.totalAmount || invoice?.amount || 0) * 0.85)).toLocaleString('en-IN')
  const gst = (invoice?.gst || invoice?.gstAmount || Math.round((invoice?.totalAmount || invoice?.amount || 0) * 0.15)).toLocaleString('en-IN')
  const items = invoice?.lineItems || []

  const itemRowsSvg =
    items.length > 0
      ? items
          .slice(0, 6)
          .map((item, idx) => {
            const y = 235 + idx * 28
            const desc = (item.description || item.desc || 'Line Item').replace(/&/g, '&amp;').substring(0, 34)
            const qty = item.quantity || item.qty || 1
            const rate = (item.unitPrice || item.rate || 0).toLocaleString('en-IN')
            const itemTotal = (item.total || item.amount || (qty * (item.unitPrice || 0))).toLocaleString('en-IN')
            return `
      <rect x="40" y="${y - 16}" width="520" height="24" fill="${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}" rx="4"/>
      <text x="52" y="${y}" font-size="10" font-weight="600" fill="#1e293b">${desc}</text>
      <text x="310" y="${y}" font-size="10" fill="#475569">${qty}</text>
      <text x="420" y="${y}" font-size="10" fill="#475569" text-anchor="end">${sym}${rate}</text>
      <text x="548" y="${y}" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="end">${sym}${itemTotal}</text>
    `
          })
          .join('')
      : `
      <rect x="40" y="219" width="520" height="24" fill="#ffffff" rx="4"/>
      <text x="52" y="235" font-size="10" font-weight="600" fill="#1e293b">General Extracted Line Goods &amp; Services</text>
      <text x="310" y="235" font-size="10" fill="#475569">1</text>
      <text x="420" y="235" font-size="10" fill="#475569" text-anchor="end">${sym}${subtotal}</text>
      <text x="548" y="235" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="end">${sym}${total}</text>
    `

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="100%" height="100%" style="background:#ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <rect width="600" height="750" fill="#ffffff" rx="12"/>
      <rect width="600" height="10" fill="#2563eb"/>
      
      <!-- Vendor Info Header -->
      <text x="40" y="52" font-size="18" font-weight="900" fill="#0f172a">${vendor.replace(/&/g, '&amp;')}</text>
      <text x="40" y="70" font-size="10" font-weight="700" fill="#64748b">OFFICIAL TAX INVOICE • GSTIN: ${gstin}</text>
      
      <text x="560" y="48" font-size="15" font-weight="800" fill="#2563eb" text-anchor="end">#${invNumber}</text>
      <text x="560" y="66" font-size="10" fill="#64748b" text-anchor="end">Date: ${date}</text>
      <text x="560" y="82" font-size="10" fill="#b45309" text-anchor="end" font-weight="bold">Due Date: ${due}</text>

      <line x1="40" y1="98" x2="560" y2="98" stroke="#cbd5e1" stroke-width="1"/>

      <!-- Bill To & Metadata -->
      <rect x="40" y="112" width="250" height="65" fill="#f8fafc" rx="8" stroke="#e2e8f0"/>
      <text x="52" y="130" font-size="9" font-weight="bold" fill="#94a3b8">BILLED TO</text>
      <text x="52" y="146" font-size="11" font-weight="bold" fill="#0f172a">Enterprise Finance Operations</text>
      <text x="52" y="161" font-size="10" fill="#64748b">Verified Receiver • Tax Id: 27AAACS1234F1Z5</text>

      <rect x="310" y="112" width="250" height="65" fill="#eff6ff" rx="8" stroke="#bfdbfe"/>
      <text x="322" y="130" font-size="9" font-weight="bold" fill="#1d4ed8">PAYMENT SUMMARY</text>
      <text x="322" y="150" font-size="13" font-weight="900" fill="#1e40af">TOTAL PAYABLE: ${sym}${total}</text>
      <text x="322" y="164" font-size="9" fill="#3b82f6" font-weight="bold">InvoiceFlow AI Document Guard</text>

      <!-- Table Header -->
      <rect x="40" y="192" width="520" height="26" fill="#f1f5f9" rx="4"/>
      <text x="52" y="209" font-size="10" font-weight="bold" fill="#475569">Item Description</text>
      <text x="310" y="209" font-size="10" font-weight="bold" fill="#475569">Qty</text>
      <text x="420" y="209" font-size="10" font-weight="bold" fill="#475569" text-anchor="end">Rate</text>
      <text x="548" y="209" font-size="10" font-weight="bold" fill="#475569" text-anchor="end">Total</text>

      <!-- Pure SVG Table Rows -->
      ${itemRowsSvg}

      <!-- Footer Financial Totals -->
      <rect x="330" y="575" width="230" height="85" fill="#f8fafc" rx="8" stroke="#e2e8f0"/>
      <text x="345" y="598" font-size="10" fill="#64748b">Subtotal:</text>
      <text x="545" y="598" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="end">${sym}${subtotal}</text>

      <text x="345" y="616" font-size="10" fill="#64748b">Tax / GST:</text>
      <text x="545" y="616" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="end">${sym}${gst}</text>

      <line x1="345" y1="626" x2="545" y2="626" stroke="#cbd5e1" stroke-width="1"/>
      <text x="345" y="645" font-size="11" font-weight="900" fill="#0f172a">Grand Total:</text>
      <text x="545" y="645" font-size="12" font-weight="900" fill="#2563eb" text-anchor="end">${sym}${total}</text>

      <!-- Verification Seal -->
      <circle cx="110" cy="618" r="32" fill="none" stroke="#16a34a" stroke-width="2" stroke-dasharray="4 2"/>
      <text x="110" y="614" font-size="8" font-weight="900" fill="#16a34a" text-anchor="middle">OFFICIAL TAX</text>
      <text x="110" y="624" font-size="8" font-weight="bold" fill="#16a34a" text-anchor="middle">INVOICE</text>
      <text x="110" y="633" font-size="7" fill="#15803d" text-anchor="middle">VERIFIED</text>

      <!-- Bottom Bar -->
      <line x1="40" y1="685" x2="560" y2="685" stroke="#e2e8f0" stroke-width="1"/>
      <text x="40" y="705" font-size="9" fill="#94a3b8">InvoiceFlow Engine • Original Document Inspection Copy</text>
      <text x="560" y="705" font-size="9" fill="#94a3b8" text-anchor="end">Page 1 of 1</text>
    </svg>
  `
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent)
}

export function DocumentViewer({ invoice, invoiceUrl, fileName, className = '' }) {
  const [loadError, setLoadError] = useState(false)

  // Prioritize previewUrl (actual local file blob URL) or invoiceUrl
  const rawUrl = invoice?.previewUrl || invoiceUrl || invoice?.invoiceUrl || invoice?.fileUrl
  const name = fileName || invoice?.fileName || invoice?.name || invoice?.invoiceNumber || 'Invoice_Document.pdf'

  useEffect(() => {
    setLoadError(false)
  }, [rawUrl, invoice])

  // Determine if file is PDF or Image
  const isPdf =
    name.toLowerCase().endsWith('.pdf') ||
    (typeof rawUrl === 'string' && (rawUrl.includes('.pdf') || rawUrl.startsWith('data:application/pdf')))

  const fallbackSvgUrl = generateInvoiceSVG(invoice)

  // Use actual uploaded file blob URL or Cloudinary URL; fallback only if missing or errored
  const effectiveUrl = (loadError || !rawUrl || rawUrl.includes('unsplash')) ? fallbackSvgUrl : rawUrl

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Viewer Container */}
      <div className="relative rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden flex flex-col items-center justify-center min-h-[300px] p-2 shadow-inner">
        {isPdf && !loadError && !effectiveUrl.startsWith('data:image/svg') ? (
          <iframe
            src={effectiveUrl}
            title="PDF Document Preview"
            className="w-full h-[320px] rounded-xl border-0 bg-white shadow-md"
            onError={() => setLoadError(true)}
          />
        ) : (
          <img
            src={effectiveUrl}
            alt="Original Invoice Document"
            className="max-h-[320px] w-auto object-contain rounded-lg shadow-md transition-all duration-200"
            onError={() => setLoadError(true)}
          />
        )}
      </div>

      {/* Control Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <FileText className="h-4 w-4 shrink-0 text-blue-600" />
          <span className="font-bold text-slate-800 truncate max-w-[180px] sm:max-w-[240px]">{name}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={effectiveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-50 hover:border-blue-300 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open Document ↗
          </a>

          <a
            href={effectiveUrl}
            download={name.endsWith('.pdf') ? name : `${name}.svg`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-900 transition"
          >
            <Download className="h-3.5 w-3.5" /> Download File
          </a>
        </div>
      </div>
    </div>
  )
}
