import { motion } from 'framer-motion'
import { Code2, Server, Database, Cloud, Cpu, Brain, Layers, Globe, Sparkles } from 'lucide-react'

const techBadges = [
  { name: 'React 19', category: 'Frontend Framework', icon: Code2, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
  { name: 'Tailwind CSS', category: 'Styling & Tokens', icon: Layers, color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10' },
  { name: 'Node.js', category: 'Backend Runtime', icon: Server, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { name: 'Express.js', category: 'REST API Engine', icon: Server, color: 'text-slate-300', border: 'border-slate-700', bg: 'bg-slate-800/80' },
  { name: 'MongoDB', category: 'NoSQL Database', icon: Database, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { name: 'Mongoose', category: 'ODM Schema Modeling', icon: Database, color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' },
  { name: 'Cloudinary', category: 'Document CDN', icon: Cloud, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  { name: 'Tesseract OCR', category: 'Local Pre-Parser', icon: Cpu, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { name: 'Gemini AI', category: 'Multimodal Vision', icon: Brain, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  { name: 'Vercel', category: 'Frontend Deployment', icon: Globe, color: 'text-white', border: 'border-slate-700', bg: 'bg-slate-900' },
  { name: 'Render', category: 'Backend Cloud Host', icon: Server, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
]

export function TechStackSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-blue-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" /> MODERN TECH STACK
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Engineered with Enterprise-Grade Technologies
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
          Production-tested stack combining fullstack React & Node.js with MongoDB and multimodal AI vision models.
        </p>
      </div>

      {/* TECH BADGES GRID */}
      <div className="flex flex-wrap items-center justify-center gap-3 max-w-5xl mx-auto">
        {techBadges.map((tech, idx) => {
          const IconComp = tech.icon
          return (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-2.5 rounded-2xl border ${tech.border} ${tech.bg} px-4 py-2.5 shadow-md backdrop-blur-md transition-all`}
            >
              <IconComp className={`h-4.5 w-4.5 ${tech.color}`} />
              <div>
                <span className="text-xs font-bold text-white block leading-none">{tech.name}</span>
                <span className="text-[9px] font-mono text-slate-400 block mt-1">{tech.category}</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
