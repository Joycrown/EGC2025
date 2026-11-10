"use client";

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Users, UserCheck, Shield } from 'lucide-react';

interface Stats {
  totalUsers: number | null;
  totalAdmins: number | null;
  totalAttendees: number | null;
  attendeesEdition: string | null;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: null,
    totalAdmins: null,
    totalAttendees: null,
    attendeesEdition: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [usersRes, adminsRes, attendeesRes] = await Promise.all([
          fetch('/api/admin/stats/total-users'),
          fetch('/api/admin/stats/total-admins'),
          fetch('/api/admin/stats/total-attendees'),
        ]);

        if (!usersRes.ok || !adminsRes.ok || !attendeesRes.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }

        const usersData = await usersRes.json();
        const adminsData = await adminsRes.json();
        const attendeesData = await attendeesRes.json();

        setStats({
          totalUsers: usersData.totalUsers,
          totalAdmins: adminsData.totalAdmins,
          totalAttendees: attendeesData.totalAttendees,
          attendeesEdition: attendeesData.editionName ?? null,
        });
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users size={24} className="text-blue-500" />,
      color: 'bg-blue-100',
    },
    {
      title: 'Total Admins',
      value: stats.totalAdmins,
      icon: <Shield size={24} className="text-green-500" />,
      color: 'bg-green-100',
    },
    {
      title: stats.attendeesEdition ? `Unique Attendees · ${stats.attendeesEdition}` : 'Unique Attendees',
      value: stats.totalAttendees,
      icon: <UserCheck size={24} className="text-purple-500" />,
      color: 'bg-purple-100',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <div className={`p-3 rounded-full ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-800">
                {loading ? '...' : card.value ?? '--'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
