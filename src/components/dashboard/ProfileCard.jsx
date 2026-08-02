export default function ProfileCard({ user }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-500/10 text-brand-700 text-2xl font-semibold">
          {user?.initials || 'AS'}
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-brand-600">Profile</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{user?.name || 'Aditi Singh'}</p>
          <p className="mt-1 text-sm text-slate-500">{user?.role || 'Finance Lead'}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.75rem] bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</p>
          <p className="mt-2 font-medium text-slate-900">{user?.email || 'aditi@invoiceflow.com'}</p>
        </div>
        <div className="rounded-[1.75rem] bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Member since</p>
          <p className="mt-2 font-medium text-slate-900">{user?.memberSince || 'Jan 2024'}</p>
        </div>
      </div>
    </div>
  );
}
