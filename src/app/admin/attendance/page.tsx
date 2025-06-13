import AttendanceViewer from '@/components/admin/AttendanceViewer';
import React from 'react';

const AttendancePage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Conference Attendance</h1>
      <AttendanceViewer />
    </div>
  );
};

export default AttendancePage;
