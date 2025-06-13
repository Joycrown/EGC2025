import UserManagement from '@/components/admin/UserManagement';
import React from 'react';

const UserManagementPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Management</h1>
      <UserManagement />
    </div>
  );
};

export default UserManagementPage;
