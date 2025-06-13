'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { withAdminAuth } from '@/components/withAdminAuth';
import { Menu } from 'lucide-react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-white shadow-md p-4 flex justify-between items-center z-10">
          <h1 className="text-xl font-bold text-red-600">EGC Admin</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-700">
            <Menu className="h-6 w-6" />
          </button>
        </header>
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default withAdminAuth(AdminLayout);
