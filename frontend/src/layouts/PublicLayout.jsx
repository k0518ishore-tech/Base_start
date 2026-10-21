import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gov-bg relative overflow-x-hidden">
      {/* Background Watermark matching official government reference */}
      <div
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <img
          src="/government-watermark.png"
          alt=""
          className="w-[780px] max-w-[88vw] opacity-[0.22] object-contain pointer-events-none select-none"
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PublicLayout;
