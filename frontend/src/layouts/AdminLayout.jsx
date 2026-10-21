import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/navigation/AdminNavbar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 relative overflow-x-hidden">
      {/* Background Watermark */}
      <div
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <img
          src="/government-watermark.png"
          alt=""
          className="w-[500px] max-w-[70vw] opacity-[0.06] object-contain pointer-events-none"
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Single, unified Admin Navbar at the top */}
        <AdminNavbar />

        {/* Main Content Area - Full width with max-w-7xl container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
