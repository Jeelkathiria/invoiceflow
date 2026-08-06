import { motion } from 'framer-motion'
import { Sparkles, Zap, ShieldCheck, Clock } from 'lucide-react'

const stats = [
  {
    value: '98%',
    label: 'Extraction Accuracy',
    description: 'Hybrid OCR & Gemini Vision field accuracy',
    icon: Sparkles,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
  },
  {
    value: '80%',
    label: 'Less Manual Work',
    description: 'Automated accounts payable processing',
    icon: Zap,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
  },
  {
    value: '3s',
    label: 'Average Processing',
    description: 'End-to-end document parsing latency',
    icon: Clock,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/10',
  },
  {
    value: '100%',
    label: 'Audit Trail Coverage',
    description: 'Timestamped signoffs & rejection logs',
    icon: ShieldCheck,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
  },
]

export function StatsSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => {
            const IconComp = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative rounded-2xl border border-slate-800 bg-slate-950/80 p-5 backdrop-blur-md flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor} ${stat.color} border ${stat.borderColor}`}>
                    <IconComp className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Metric 0{idx + 1}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className={`text-3xl font-black font-mono ${stat.color} tracking-tight`}>
                    {stat.value}
                  </h3>
                  <p className="text-sm font-bold text-white mt-1">{stat.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
