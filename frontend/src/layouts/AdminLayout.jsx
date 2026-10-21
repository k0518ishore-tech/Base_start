import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/navigation/AdminNavbar';
import GlobalWatermark from '../components/common/GlobalWatermark';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 relative overflow-x-hidden">
      {/* Global Background Watermark */}
      <GlobalWatermark />

      <div className="relative z-10 flex flex-col min-h-screen">
        <AdminNavbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
