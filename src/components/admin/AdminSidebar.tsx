'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, UserCheck, UserCog, ArrowLeft, X, Gamepad2, QrCode, Trophy } from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/attendance', label: 'Attendance', icon: UserCheck },
    { href: '/admin/qr', label: 'Check-in QR', icon: QrCode },
    { href: '/admin/manage-admins', label: 'Manage Admins', icon: UserCog },
    { href: '/admin/games', label: 'Game Sessions', icon: Gamepad2 },
    { href: '/admin/tournament', label: 'Tournament', icon: Trophy },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white text-gray-800 p-6 flex flex-col shadow-lg z-30 transform transition-transform md:relative md:translate-x-0 md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex justify-between items-center mb-10">
          <Link href="/admin" className="text-2xl font-bold text-red-600">
            EGC Admin
          </Link>
          <button onClick={onClose} className="md:hidden text-gray-600 hover:text-gray-900">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1">
          <ul>
            {navItems.map((item) => (
              <li key={item.href} className="mb-4">
                <Link
                  href={item.href}
                  onClick={onClose} // Close sidebar on navigation
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                      ? 'bg-red-600 text-white shadow-md'
                      : 'hover:bg-gray-200'
                  }`}>
                  <item.icon className="w-5 h-5 mr-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <Link
            href="/dashboard"
            className="flex items-center p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 mr-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
