import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { Bell, FileText, Home, ListChecks, LogOut, User, Search, Plus, Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GlobalSearchModal } from '../components/common/GlobalSearchModal'
import { NotificationDrawer } from '../components/common/NotificationDrawer'
import api from '../services/axios'

export function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications')
        if (res.data && res.data.data) {
          setUnreadCount(res.data.data.unreadCount || 0)
        }
      } catch (err) {
        // quiet error
      }
    }
    fetchUnreadCount()
  }, [isNotificationsOpen])

  const userRole = (user?.role || 'finance').toLowerCase()
  const isManager = userRole.includes('manager')
  const isFinance = userRole.includes('finance') || !isManager

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Dynamic navigation items based on user role
  const navItems = isManager
    ? [
        { to: '/app', label: 'Dashboard', icon: Home, badge: null },
        { to: '/app/approval-queue', label: 'Approval Queue', icon: ListChecks, badge: null },
        { to: '/app/invoices', label: 'All Invoices', icon: FileText, badge: null },
        { to: '/app/profile', label: 'Profile', icon: User, badge: null },
      ]
    : [
        { to: '/app', label: 'Dashboard', icon: Home, badge: null },
        { to: '/app/upload', label: 'Upload Invoice', icon: Plus, badge: null },
        { to: '/app/invoices', label: 'All Invoices', icon: FileText, badge: null },
        { to: '/app/profile', label: 'Profile', icon: User, badge: null },
      ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

      {/* Mobile Top Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Link to="/app" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-sm">
            IF
          </div>
          <span className="font-extrabold text-base text-slate-900">InvoiceFlow</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Edge-Docked Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col justify-between border-r border-slate-200 bg-white transition-all duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-60'} w-60`}
      >
        <div>
          {/* Sidebar Header Brand */}
          <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
            <Link to="/app" className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white shadow-sm">
                IF
              </div>
              {!sidebarCollapsed && (
                <div className="whitespace-nowrap">
                  <h1 className="text-sm font-extrabold text-slate-900 leading-none">InvoiceFlow</h1>
                  <p className="mt-0.5 text-[11px] font-bold text-blue-600 capitalize leading-none">
                    {isManager ? 'Manager Workspace' : 'Finance Workspace'}
                  </p>
                </div>
              )}
            </Link>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          {/* Quick Action Button - Render Upload Invoice ONLY for Finance */}
          {isFinance && (
            <div className="p-3">
              <button
                onClick={() => navigate('/app/upload')}
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-98 ${
                  sidebarCollapsed ? 'p-2.5' : ''
                }`}
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                {!sidebarCollapsed && <span>Upload Invoice</span>}
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="mt-2 space-y-1 px-3">
            {!sidebarCollapsed && (
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isManager ? 'Manager Menu' : 'Finance Menu'}
              </p>
            )}
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                onClick={() => setMobileMenuOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center ${sidebarCollapsed ? 'justify-center py-2.5 px-0' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-600">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 ${
              sidebarCollapsed ? 'p-2.5' : 'px-3 py-2'
            } text-xs font-bold text-rose-700 hover:bg-rose-100 transition active:scale-95`}
            title="Sign Out of Account"
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md">
          {/* Global Search Bar */}
          <div
            onClick={() => setIsSearchOpen(true)}
            className="relative w-full max-w-md cursor-pointer"
          >
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-12 text-xs text-slate-500">
              Search invoices (INV-2026, Amazon, Pending)...
            </div>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
              ⌘K
            </span>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 transition"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/app/profile')}
              className="flex items-center gap-3 border-l border-slate-200 pl-4 text-left hover:opacity-80 transition"
              title="View Profile Settings"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white text-xs shadow-xs">
                {user?.name?.split(' ').map((n) => n[0]).join('') || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || 'User'}</p>
                <p className="mt-0.5 text-[10px] font-bold text-blue-600 leading-none capitalize">
                  {isManager ? 'Manager' : 'Finance'}
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* Dynamic Page Component Outlet */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
