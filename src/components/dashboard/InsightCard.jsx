import { motion } from 'framer-motion';

export default function InsightCard({ title, value, details, icon: Icon, accent = 'bg-slate-100 text-slate-700' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-3xl p-3 ${accent}`}>
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-500">{details}</p>
    </motion.div>
  );
}
