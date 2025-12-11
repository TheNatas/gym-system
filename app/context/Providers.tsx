'use client';

import { UserProvider } from './UserContext';
import { ClassProvider } from './ClassContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ClassProvider>
        {children}
      </ClassProvider>
    </UserProvider>
  );
}
