import { useState } from 'react';
import { Bell, Menu, Moon, Search, Sun, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button.jsx';
import SearchBar from './SearchBar.jsx';

export default function TopNavbar({ onMobileMenuToggle, collapsed, onToggleSidebar }) {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <SearchBar placeholder="Search invoices..." />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-end">
        <button
          type="button"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="hidden items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">J</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">John Morris</p>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Finance Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
