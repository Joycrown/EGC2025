'use client';

import React, { useState } from 'react';
import withAuth from '@/components/withAuth';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { TokenPayload } from '@/lib/auth/utils';

interface DashboardLayoutClientProps {
  user: TokenPayload | null;
  children: React.ReactNode;
}

const NavLink = ({ href, icon, children, isActive }: { href: string; icon: JSX.Element; children: React.ReactNode; isActive?: boolean }) => (
  <a 
    href={href} 
    className={`flex items-center px-3 py-3 rounded-lg transition-colors duration-200 
                ${isActive ? 'bg-red-700 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
  >
    {icon}
    <span className="ml-3 text-sm font-medium whitespace-nowrap">{children}</span>
  </a>
);

function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const sidebarContent = (
    <nav className="space-y-3">
      <NavLink href="/dashboard" isActive={pathname === '/dashboard'} icon={<svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>}>Dashboard</NavLink>
      <NavLink href="#" isActive={pathname === '/games'} icon={<svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>}>Games</NavLink>
      <NavLink href="#" isActive={pathname === '/schedule'} icon={<svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>Conference Schedule</NavLink>
      {(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMIN') && (
        <>
          <NavLink href="/admin" isActive={pathname.startsWith('/admin') && pathname !== '/dashboard/admin/register-member'} icon={<svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>Admin Panel</NavLink>
          <NavLink href="/dashboard/admin/register-member" isActive={pathname === '/dashboard/admin/register-member'} icon={<svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}>Register a Member</NavLink>
        </>
      )}
    </nav>
  );

  return (
    <div className="flex h-screen bg-gray-800 font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-gray-800 text-white p-5 pt-8 hidden md:flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center mb-10">
            <Image
              src="/images/GofamintLogo.png"
              alt="GOFAMINT Logo"
              width={40}
              height={40}
              className="mr-3 rounded-sm"
            />
            <h1 className="text-xl font-bold text-white">EGC Portal</h1>
          </div>
          {sidebarContent}
        </div>
        <button
            onClick={() => { Cookies.remove('auth-token'); router.push('/login'); }}
            className="flex items-center w-full mt-auto px-3 py-3 rounded-lg text-gray-300 hover:bg-red-700 hover:text-white transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="ml-3 text-sm font-medium">Logout</span>
        </button>
      </aside>

      {/* Mobile Nav Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black opacity-50" aria-hidden="true" onClick={() => setIsMobileNavOpen(false)}></div>
          <aside className="relative w-64 bg-gray-800 text-white p-5 pt-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center mb-10">
                <Image
                  src="/images/GofamintLogo.png"
                  alt="GOFAMINT Logo"
                  width={40}
                  height={40}
                  className="mr-3 rounded-sm"
                />
                <h1 className="text-xl font-bold text-white">EGC Portal</h1>
              </div>
              {sidebarContent}
            </div>
            <button
                onClick={() => { Cookies.remove('auth-token'); router.push('/login'); }}
                className="flex items-center w-full mt-auto px-3 py-3 rounded-lg text-gray-300 hover:bg-red-700 hover:text-white transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="ml-3 text-sm font-medium">Logout</span>
            </button>
          </aside>
        </div>
      )}

      {/* Main Content Area Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile-only header */}
        <header className="md:hidden bg-gray-900 shadow-md p-4 flex justify-between items-center text-white">
          <button onClick={() => setIsMobileNavOpen(true)} aria-label="Open sidebar">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
          <h1 className="text-xl font-bold">EGC Portal</h1>
        </header>
        
        <main 
          className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8"
          style={{
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url('/images/Churchimage.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default withAuth(DashboardLayoutClient);
