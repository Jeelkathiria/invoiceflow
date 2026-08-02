import { motion } from 'framer-motion';

const accentStyles = {
  blue: 'bg-brand-500/10 text-brand-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  slate: 'bg-slate-100 text-slate-700',
};

export default function MetricCard({ title, value, description, icon: Icon, accent = 'blue' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-3xl p-3 ${accentStyles[accent]}`}>
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
      </div>
      <p className="mt-4 text-sm leading-5 text-slate-500">{description}</p>
    </motion.div>
  );
}
