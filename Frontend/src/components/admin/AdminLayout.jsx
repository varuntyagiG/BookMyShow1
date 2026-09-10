import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import { AdminToastProvider } from './AdminToastContext';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-[#F5F5FA] text-[#222432] flex font-sans antialiased selection:bg-[#F84464] selection:text-white">
        {/* Fixed BookMyShow Admin Sidebar */}
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Main Content Column */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Top Header Navbar */}
          <AdminTopbar onMenuToggle={() => setIsSidebarOpen(prev => !prev)} />

          {/* Page Content Canvas */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminToastProvider>
  );
}
