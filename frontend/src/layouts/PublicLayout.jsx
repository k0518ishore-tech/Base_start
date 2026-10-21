import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import GlobalWatermark from '../components/common/GlobalWatermark';

const PublicLayout = () => {
  const location = useLocation();
  // On Scheme Assistant, the watermark is specifically centered inside the chat message display area
  const isAssistantPage = location.pathname.startsWith('/assistant');

  return (
    <div className="min-h-screen flex flex-col bg-gov-bg relative overflow-x-hidden">
      <Navbar />
      <main className="flex-1 relative min-h-[calc(100vh-4rem)] flex flex-col">
        {!isAssistantPage && <GlobalWatermark />}
        <div className="relative z-10 flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PublicLayout;
