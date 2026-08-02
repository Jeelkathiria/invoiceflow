import { motion } from 'framer-motion';

export default function QuickActionCard({ title, description, icon: Icon }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="group flex w-full items-start gap-4 rounded-[2rem] border border-slate-200 bg-white px-6 py-6 text-left shadow-soft transition hover:-translate-y-1 hover:border-brand-200 hover:bg-slate-50"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 transition group-hover:bg-brand-600 group-hover:text-white">
        {Icon ? <Icon className="h-5 w-5" /> : null}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </motion.button>
  );
}
