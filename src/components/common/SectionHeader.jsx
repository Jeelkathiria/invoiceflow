export function SectionHeader({ title, description }) {
  return (
    <div className="space-y-2">
      <p className="text-sm uppercase tracking-[0.3em] text-brand-300">{title}</p>
      <p className="max-w-2xl text-3xl font-semibold text-slate-50 sm:text-4xl">{description}</p>
    </div>
  )
}
