import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CinemaPartnerSidebar from './CinemaPartnerSidebar';
import CinemaPartnerTopbar from './CinemaPartnerTopbar';
import { CinemaPartnerToastProvider } from './CinemaPartnerToastContext';

export default function CinemaPartnerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <CinemaPartnerToastProvider>
      <div className="min-h-screen bg-[#F5F5FA] text-[#222432] flex font-sans antialiased selection:bg-[#F84464] selection:text-white">
        {/* Fixed B2B Cinema Partner Sidebar */}
        <CinemaPartnerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <CinemaPartnerTopbar onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </CinemaPartnerToastProvider>
  );
}
