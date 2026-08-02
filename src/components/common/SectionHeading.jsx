function SectionHeading({ title, subtitle }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">InvoiceFlow</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-4 text-slate-600 leading-8">{subtitle}</p> : null}
    </div>
  );
}

export default SectionHeading;
