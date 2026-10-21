import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import UserSidebar from '../components/navigation/UserSidebar';
import GlobalWatermark from '../components/common/GlobalWatermark';

const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gov-bg relative overflow-x-hidden">
      {/* Global Background Watermark */}
      <GlobalWatermark />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
          <UserSidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
