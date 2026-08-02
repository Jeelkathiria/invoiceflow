import { AnimatePresence, motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  FolderOpen,
  Inbox,
  LayoutDashboard,
  UserCircle2,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import Button from '../common/Button.jsx';

const user = {
  name: 'John Morris',
  role: 'Finance Manager',
};

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Upload Invoice', path: '/upload', icon: FileText },
  { label: 'Approval Queue', path: '/approval-queue', icon: Inbox },
  { label: 'All Invoices', path: '/invoices', icon: FolderOpen },
  { label: 'Profile', path: '/profile', icon: UserCircle2 },
];

const footerItems = [
  { label: 'Logout', icon: LogOut },
];

export default function Sidebar({ collapsed, mobileOpen, onClose, onToggle }) {
  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/40"
              onClick={onClose}
              aria-label="Close sidebar"
            />
            <motion.aside
              className="relative flex w-80 flex-col bg-white shadow-soft"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-brand-600 text-white shadow-sm">
                    <span className="text-lg font-semibold">IF</span>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-brand-600">InvoiceFlow</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">Finance Workspace</p>
                  </div>
                </div>
                <Button variant="secondary" onClick={onClose} className="px-3 py-2">
                  Close
                </Button>
              </div>
              <div className="space-y-3 border-b border-slate-200 p-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-500">{user.role}</p>
                </div>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/10'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
              <div className="space-y-3 border-t border-slate-200 p-4">
                {footerItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-3xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.status ? <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">{item.status}</span> : null}
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
          collapsed ? 'w-24' : 'w-72'
        }`}
      >
        <div className="flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-brand-600 text-white shadow-sm">
              <span className="text-base font-semibold">IF</span>
            </div>
            {!collapsed ? (
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-600">InvoiceFlow</p>
                <p className="text-lg font-semibold text-slate-900">Finance Workspace</p>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`h-5 w-5 transition ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {!collapsed ? (
          <div className="mx-4 rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-700 shadow-sm">
            <p className="font-semibold text-slate-900">{user.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-500">{user.role}</p>
          </div>
        ) : null}

        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/10'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span className={`${collapsed ? 'hidden' : 'block'}`}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-slate-200 px-4 py-5">
          {footerItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="group flex w-full items-center justify-between gap-3 rounded-3xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                title={item.label}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span className={`${collapsed ? 'hidden' : 'block'}`}>{item.label}</span>
                </div>
                {item.status ? <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-500 md:inline-flex">{item.status}</span> : null}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
