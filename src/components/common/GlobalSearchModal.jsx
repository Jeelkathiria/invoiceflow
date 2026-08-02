import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, FileText, ArrowRight, Building, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react'

const mockSearchData = [
  { id: 'INV-2026-0045', vendor: 'Spectrum Supplies Ltd', amount: '₹158,200', status: 'Pending Review', date: 'Aug 7, 2026', type: 'invoice' },
  { id: 'INV-2026-0044', vendor: 'CloudScale Technologies', amount: '₹412,000', status: 'Approved', date: 'Jul 30, 2026', type: 'invoice' },
  { id: 'INV-2026-0043', vendor: 'Apex Office Logistics', amount: '₹89,500', status: 'Approved', date: 'Jul 28, 2026', type: 'invoice' },
  { id: 'INV-2026-0042', vendor: 'Nexus Software Corp', amount: '₹240,000', status: 'Needs Review', date: 'Jul 26, 2026', type: 'invoice' },
  { id: 'INV-2026-0041', vendor: 'Amazon Web Services', amount: '₹184,300', status: 'Duplicate Alert', date: 'Jul 25, 2026', type: 'invoice' },
  { id: 'INV-2026-0040', vendor: 'Microsoft Azure Services', amount: '₹520,000', status: 'Approved', date: 'Jul 20, 2026', type: 'invoice' },
  { id: 'INV-2026-0039', vendor: 'Adobe Creative Suite', amount: '₹64,200', status: 'Approved', date: 'Jul 15, 2026', type: 'invoice' },
]

export function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else setQuery('')
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filtered = mockSearchData.filter(item => 
    item.id.toLowerCase().includes(query.toLowerCase()) ||
    item.vendor.toLowerCase().includes(query.toLowerCase()) ||
    item.status.toLowerCase().includes(query.toLowerCase()) ||
    item.amount.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (id) => {
    onClose()
    navigate(`/app/invoices/${id}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl overflow-hidden light:border-slate-200 light:bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input Header */}
        <div className="flex items-center px-6 py-4 border-b border-slate-800 light:border-slate-200">
          <Search className="h-5 w-5 text-indigo-400 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoices (e.g. INV-2026, Amazon, Pending, Microsoft)..."
            className="flex-1 bg-transparent text-sm font-semibold text-white placeholder:text-slate-500 outline-none light:text-slate-900"
          />
          <button 
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-slate-800/60 p-1.5 text-slate-400 hover:text-white light:border-slate-200 light:bg-slate-100 light:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-950/60 border-b border-slate-800/60 light:bg-slate-50 light:border-slate-100 text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Quick Filters:</span>
          {['Pending', 'Amazon', 'Microsoft', 'Approved', 'Adobe'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-400 light:border-slate-200 light:bg-white light:text-slate-700"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-400">No matching invoices or vendors found</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for 'INV-2026', 'Amazon', or 'Pending'</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all light:border-slate-200 light:bg-slate-50/80 light:hover:bg-indigo-50/60"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-400 light:text-indigo-600">{item.id}</span>
                      <span className="text-sm font-bold text-white light:text-slate-900">{item.vendor}</span>
                    </div>
                    <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">Amount: <strong className="text-white light:text-slate-800">{item.amount}</strong> • Due: {item.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-extrabold rounded-full border ${
                    item.status === 'Approved' 
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 light:bg-emerald-50 light:text-emerald-700'
                      : item.status === 'Duplicate Alert'
                      ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 light:bg-rose-50 light:text-rose-700'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-400 light:bg-amber-50 light:text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-t border-slate-800 light:bg-slate-100 light:border-slate-200 text-xs text-slate-400">
          <span>Navigate with <kbd className="rounded border border-slate-700 px-1 py-0.5 text-[10px]">↑</kbd> <kbd className="rounded border border-slate-700 px-1 py-0.5 text-[10px]">↓</kbd></span>
          <span>Press <kbd className="rounded border border-slate-700 px-1.5 py-0.5 text-[10px]">ESC</kbd> to exit</span>
        </div>
      </div>
    </div>
  )
}
