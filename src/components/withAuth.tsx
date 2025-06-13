'use client';

import React, { ComponentType } from 'react';
import { useAuth } from '@/hooks/useAuth';


const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      // Render a loading state or a spinner while checking authentication
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // The useAuth hook handles the redirect, so we can return null here to prevent
      // the wrapped component from rendering briefly before the redirect happens.
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  // Set a display name for the HOC for better debugging
  AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
};

export default withAuth;
