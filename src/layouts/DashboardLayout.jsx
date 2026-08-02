import { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar.jsx';
import TopNavbar from '../components/dashboard/TopNavbar.jsx';
import { Outlet } from 'react-router-dom';

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? 'lg:pl-24' : 'lg:pl-72'} pl-0`}>
        <div className="mx-auto max-w-[1600px] px-6 py-6 lg:px-8">
          <TopNavbar
            onMobileMenuToggle={() => setMobileOpen(true)}
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((prev) => !prev)}
          />

          <main className="space-y-6 pb-8 mt-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
