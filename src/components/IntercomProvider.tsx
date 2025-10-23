"use client";

import { IntercomProvider as Provider } from 'react-use-intercom';

interface IntercomProviderProps {
  children: React.ReactNode;
}

export default function IntercomProvider({ children }: IntercomProviderProps) {
  const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

  // If no App ID, just render children without Intercom
  if (!appId) {
    console.warn('NEXT_PUBLIC_INTERCOM_APP_ID is not set. Intercom will not be initialized.');
    return <>{children}</>;
  }

  return (
    <Provider appId={appId} autoBoot={true}>
      {children}
    </Provider>
  );
}
