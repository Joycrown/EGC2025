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

const NavLink = ({ href, icon, children, isActive }: { href: string; icon: React.ReactNode; children: React.ReactNode; isActive?: boolean }) => (
  <a
    href={href}
    className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
      ${isActive
        ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
        : 'text-gray-400 hover:bg-gray-700/60 hover:text-white'}`}
  >
    <span className={`shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}>{icon}</span>
    <span className="ml-3 text-sm font-medium whitespace-nowrap">{children}</span>
    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
  </a>
);

function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const roleLabel = user?.role?.replace(/_/g, ' ') ?? 'Participant';
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'EG';

  const icons = {
    home: <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
    games: <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
    schedule: <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    admin: <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    register: <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
    logout: <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  };

  const sidebarContent = (
    <nav className="space-y-1">
      <NavLink href="/dashboard" isActive={pathname === '/dashboard'} icon={icons.home}>Dashboard</NavLink>
      <NavLink href="/games" isActive={pathname.startsWith('/games')} icon={icons.games}>EGC Games</NavLink>
      <NavLink href="/leaderboard" isActive={pathname === '/leaderboard'} icon={
        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      }>Leaderboard</NavLink>
      <NavLink href="#" isActive={pathname === '/schedule'} icon={icons.schedule}>Conference Schedule</NavLink>
      {(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMIN') && (
        <>
          <div className="pt-3 pb-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-600">Admin</p>
          </div>
          <NavLink href="/admin" isActive={pathname.startsWith('/admin') && pathname !== '/dashboard/admin/register-member'} icon={icons.admin}>Admin Panel</NavLink>
          <NavLink href="/dashboard/admin/register-member" isActive={pathname === '/dashboard/admin/register-member'} icon={icons.register}>Register Member</NavLink>
        </>
      )}
    </nav>
  );

  const userProfile = (
    <div className="flex items-center gap-3 px-3 py-3 mb-6 rounded-xl bg-gray-700/40 border border-gray-700/60">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-white font-semibold truncate">{user?.email ?? '—'}</p>
        <p className="text-[10px] text-gray-400 capitalize">{roleLabel.toLowerCase()}</p>
      </div>
    </div>
  );

  const Sidebar = ({ onClose }: { onClose?: () => void }) => (
    <aside className="w-64 bg-gray-900 text-white p-5 pt-7 flex flex-col justify-between shadow-2xl h-full">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <Image src="/images/GofamintLogo.png" alt="GOFAMINT Logo" width={36} height={36} className="rounded-md shrink-0" />
          <div>
            <h1 className="text-base font-black text-white leading-tight">EGC Portal</h1>
            <p className="text-[10px] text-gray-500 font-medium">2026 Edition</p>
          </div>
        </div>

        {userProfile}
        {sidebarContent}
      </div>

      <button
        onClick={() => { Cookies.remove('auth-token'); router.push('/login'); onClose?.(); }}
        className="flex items-center w-full px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-700/20 hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-800/30 mt-4"
      >
        {icons.logout}
        <span className="ml-3 text-sm font-medium">Sign out</span>
      </button>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-950 font-sans">
      {/* Desktop sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} />
          <div className="relative z-50">
            <Sidebar onClose={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 flex justify-between items-center">
          <button onClick={() => setIsMobileNavOpen(true)} className="text-gray-400 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <h1 className="text-base font-bold text-white">EGC Portal</h1>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        </header>

        <main
          className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.88), rgba(255,255,255,0.88)), url('/images/Churchimage.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default withAuth(DashboardLayoutClient);
