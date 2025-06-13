'use client';

import React, { useState } from 'react';
import RegisterMemberForm from '@/components/admin/RegisterMemberForm';
import MarkAttendance from '@/components/admin/MarkAttendance';

const RegisterMemberPage = () => {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Member Management</h1>
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('register')}
          className={`py-2 px-4 text-lg font-medium transition-colors duration-300 ${
            activeTab === 'register'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Register Member
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`py-2 px-4 text-lg font-medium transition-colors duration-300 ${
            activeTab === 'attendance'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Mark Attendance
        </button>
      </div>

      <div>
        {activeTab === 'register' ? <RegisterMemberForm /> : <MarkAttendance />}
      </div>
    </div>
  );
};

export default RegisterMemberPage;
