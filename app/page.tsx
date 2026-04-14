'use client';

import { useSession } from 'next-auth/react';
import { LoginPage } from '@/components/LoginPage';
import { PlayerPage } from '@/components/PlayerPage';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingScreen message="Tuning in..." />;
  }

  if (!session || session.error === 'RefreshAccessTokenError') {
    return <LoginPage tokenExpired={session?.error === 'RefreshAccessTokenError'} />;
  }

  return <PlayerPage accessToken={session.accessToken!} />;
}
