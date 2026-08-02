import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 shadow-sm transition hover:border-indigo-500/50 hover:bg-slate-700/80 active:scale-95 light:border-slate-300 light:bg-slate-100 light:text-slate-700 light:hover:bg-slate-200"
      title="Toggle Theme"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4 text-amber-400" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-indigo-500" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  )
}

