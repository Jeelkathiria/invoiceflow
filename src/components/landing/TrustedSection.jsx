const companies = ['Stripe', 'Salesforce', 'Dropbox', 'Notion', 'Airbnb', 'Zendesk'];

function TrustedSection() {
  return (
    <section className="border-t border-slate-800/80 bg-slate-950 py-14 text-slate-200">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-brand-400">Trusted by finance teams worldwide</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {companies.map((company) => (
            <div key={company} className="flex h-16 items-center justify-center rounded-3xl bg-slate-900 shadow-soft border border-slate-800">
              <span className="text-sm font-semibold text-slate-100">{company}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustedSection;
