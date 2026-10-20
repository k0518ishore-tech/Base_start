import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gov-bg">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
