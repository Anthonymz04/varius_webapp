'use client';

import { useOnlineStatus } from '@/app/hooks/useOnlineStatus';
import OfflineScreen from '@/app/components/OfflineScreen';

export default function OnlineGuard({ children }: { children: React.ReactNode }) {
  const { isOnline } = useOnlineStatus();

  if (!isOnline) {
    return <OfflineScreen />;
  }

  return <>{children}</>;
}
