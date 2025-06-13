'use client';

import { useState, useEffect, useCallback } from 'react';
import { Role, UserType } from '@prisma/client';
import { TokenPayload } from '@/lib/auth/utils';
import { Search } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmationModal from './ConfirmationModal';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  userType: UserType;
}

interface ModalState {
  isOpen: boolean;
  userId: string | null;
  userName: string | null;
  newUserType: UserType;
  action: 'promote' | 'demote' | null;
}

const ManageAdmins = () => {
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<TokenPayload | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    userId: null,
    userName: null,
    newUserType: UserType.USER,
    action: null,
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error('Failed to fetch session');
        const data = await res.json();
        setCurrentUser(data.user);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load session');
      } finally {
        setIsSessionLoading(false);
      }
    };
    fetchSession();
  }, []);

  const fetchUser = useCallback(async (emailQuery: string) => {
    if (!emailQuery) {
      setSearchedUser(null);
      setNotFound(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    try {
      const response = await fetch(`/api/admin/users?email=${encodeURIComponent(emailQuery)}`);
      if (!response.ok) throw new Error('Failed to fetch user.');
      const data = await response.json();
      if (data && data.length > 0) {
        setSearchedUser(data[0]);
      } else {
        setSearchedUser(null);
        setNotFound(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred.');
      setSearchedUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentUser?.userType === UserType.SUPER_ADMIN) {
        fetchUser(searchTerm);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, fetchUser, currentUser]);

  

  const handleRoleChange = async (userId: string, newUserType: UserType) => {
    setUpdating(userId);
    try {
      const response = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userType: newUserType }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role.');
      }
      await fetchUser(searchTerm);
      toast.success(`User role successfully updated to ${newUserType}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setUpdating(null);
    }
  };

  const openConfirmationModal = (userId: string, userName: string, newUserType: UserType, action: 'promote' | 'demote') => {
    setModalState({ isOpen: true, userId, userName, newUserType, action });
  };

  const handleConfirmAction = async () => {
    if (modalState.userId && modalState.newUserType) {
      await handleRoleChange(modalState.userId, modalState.newUserType);
    }
    setModalState({ isOpen: false, userId: null, newUserType: UserType.USER, userName: null, action: null });
  };

  if (isSessionLoading) {
    return <div className="text-center p-8">Verifying permissions...</div>;
  }

  if (!currentUser || currentUser.userType !== UserType.SUPER_ADMIN) {
    return <div className="text-red-500 bg-red-50 p-4 rounded-lg">Access Denied: Only Super Admins can manage roles.</div>;
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a user by email to manage their role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
          />
        </div>

        {loading && <div className="text-center py-4">Searching...</div>}

        {notFound && !loading && (
          <div className="text-center py-4 mt-4 text-gray-500 bg-gray-50 rounded-lg">User not found.</div>
        )}

        {!loading && searchedUser && (
          <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{searchedUser.fullName}</h3>
                  <p className="text-sm text-gray-600">{searchedUser.email}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-600">
                    Descriptive Role:
                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {searchedUser.role}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Auth Role:
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      searchedUser.userType === UserType.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' :
                      searchedUser.userType === UserType.ADMIN ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {searchedUser.userType}
                    </span>
                  </p>
                </div>
              </div>
              <div className="md:col-span-1 md:text-right">
                {searchedUser.userType === UserType.USER && (
                  <button
                    onClick={() => openConfirmationModal(searchedUser.id, searchedUser.fullName, UserType.ADMIN, 'promote')}
                    disabled={updating === searchedUser.id}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    {updating === searchedUser.id ? 'Promoting...' : 'Promote to Admin'}
                  </button>
                )}
                {searchedUser.userType === UserType.ADMIN && (
                  <button
                    onClick={() => openConfirmationModal(searchedUser.id, searchedUser.fullName, UserType.USER, 'demote')}
                    disabled={updating === searchedUser.id}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                  >
                    {updating === searchedUser.id ? 'Demoting...' : 'Demote to User'}
                  </button>
                )}
                {searchedUser.userType !== UserType.USER && searchedUser.userType !== UserType.ADMIN && (
                  <span className="text-gray-500 italic">Cannot be changed</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={handleConfirmAction}
        title={`Confirm Role ${modalState.action === 'promote' ? 'Promotion' : 'Demotion'}`}
        message={`Are you sure you want to ${modalState.action} ${modalState.userName} to ${modalState.newUserType}?`}
        confirmButtonText={modalState.action === 'promote' ? 'Promote' : 'Demote'}
        isConfirming={updating === modalState.userId}
      />
    </>
  );
};

export default ManageAdmins;
