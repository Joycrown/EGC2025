'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@prisma/client';

export function withAdminAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const WithAdminAuth = (props: P) => {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/login');
        } else if (user?.userType !== Role.ADMIN && user?.userType !== Role.SUPER_ADMIN) {
          router.push('/dashboard'); // Redirect non-admins to their dashboard
        }
      }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !user || (user.userType !== Role.ADMIN && user.userType !== Role.SUPER_ADMIN)) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  WithAdminAuth.displayName = `WithAdminAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return WithAdminAuth;
}
