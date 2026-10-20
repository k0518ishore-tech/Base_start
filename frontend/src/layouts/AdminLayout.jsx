import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/navigation/AdminNavbar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Single, unified Admin Navbar at the top */}
      <AdminNavbar />

      {/* Main Content Area - Full width with max-w-7xl container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
