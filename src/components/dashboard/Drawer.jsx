import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../common/Button.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function Drawer({ open, onClose, invoice }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-stretch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" className="absolute inset-0 bg-slate-950/30" onClick={onClose} aria-label="Close drawer" />
          <motion.div
            className="relative ml-auto flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-2xl"
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Invoice details</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{invoice?.number || 'Invoice #4029'}</h2>
              </div>
              <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 transition hover:bg-slate-200" onClick={onClose}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-[2rem] bg-slate-50 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Vendor</p>
                    <p className="mt-3 text-lg font-semibold text-slate-900">{invoice?.vendor || 'Acme Supplies'}</p>
                  </div>
                  <StatusBadge status={invoice?.status || 'Pending'} />
                </div>
                <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-slate-900">Invoice</p>
                    <p className="mt-2">{invoice?.number || '#4029'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Due date</p>
                    <p className="mt-2">{invoice?.dueDate || 'Sep 24, 2026'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Amount</p>
                    <p className="mt-2">{invoice?.amount || '₹12,840'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">GST</p>
                    <p className="mt-2">{invoice?.gst || '₹1,152'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Line items</p>
                <div className="mt-4 space-y-4">
                  {invoice?.items?.map((item) => (
                    <div key={item.description} className="rounded-3xl bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-slate-900">{item.description}</p>
                        <p className="text-sm text-slate-600">{item.amount}</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">Qty: {item.quantity} · {item.unit}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-[2rem] bg-slate-50 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Uploaded by</p>
                  <p className="text-sm text-slate-600">{invoice?.uploadedBy || 'Aditi Singh'}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Status</p>
                  <StatusBadge status={invoice?.status || 'Pending'} />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="w-full">Approve</Button>
                <Button variant="secondary" className="w-full">Reject</Button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="ghost" className="w-full">Download PDF</Button>
                <Button variant="ghost" className="w-full">Comment</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
