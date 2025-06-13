import ManageAdmins from '@/components/admin/ManageAdmins';
import React from 'react';

const ManageAdminsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Administrators</h1>
      <p className="text-gray-600 mb-8">Promote users to administrators or demote existing administrators. This action is restricted to Super Admins.</p>
      <ManageAdmins />
    </div>
  );
};

export default ManageAdminsPage;
