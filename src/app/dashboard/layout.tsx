import React from 'react';
import { getServerSession, TokenPayload } from '@/lib/auth/utils';
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session: { user: TokenPayload } | null = await getServerSession();
  const user = session?.user || null;

  return (
    <DashboardLayoutClient user={user}>
      {children}
    </DashboardLayoutClient>
  );
}
