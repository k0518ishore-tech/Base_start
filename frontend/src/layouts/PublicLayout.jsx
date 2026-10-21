import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import GlobalWatermark from '../components/common/GlobalWatermark';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gov-bg relative overflow-x-hidden">
      {/* Global Background Watermark */}
      <GlobalWatermark />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PublicLayout;
