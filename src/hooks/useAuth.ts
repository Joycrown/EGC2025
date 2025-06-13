'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenPayload } from '@/lib/auth/utils';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          router.push('/login');
        }
      } catch (error) {
        // This catch block is not being hit, so we can remove the log for now
        // console.error('Session verification failed in useAuth:', error);
        setUser(null);
        setIsAuthenticated(false);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [router]);

  return { user, isAuthenticated, isLoading };
};
