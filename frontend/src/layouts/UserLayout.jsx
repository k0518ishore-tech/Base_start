import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import UserSidebar from '../components/navigation/UserSidebar';

const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gov-bg relative overflow-x-hidden">
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
