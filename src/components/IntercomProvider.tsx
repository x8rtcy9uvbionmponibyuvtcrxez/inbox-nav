"use client";

import { useEffect } from 'react';
import { Intercom } from '@intercom/messenger-js-sdk';
import { useUser } from '@clerk/nextjs';

interface IntercomProviderProps {
  children: React.ReactNode;
}

export default function IntercomProvider({ children }: IntercomProviderProps) {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Initialize Intercom
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_INTERCOM_APP_ID) {
      Intercom({
        app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
        hide_default_launcher: false,
        alignment: 'right',
        vertical_padding: 20,
        horizontal_padding: 20,
      });
    }
  }, []);

  useEffect(() => {
    // Update user information when user data is loaded
    if (isLoaded && user && process.env.NEXT_PUBLIC_INTERCOM_APP_ID) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Intercom as any)('update', {
        user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
        created_at: user.createdAt ? Math.floor(user.createdAt.getTime() / 1000) : undefined,
        custom_launcher_selector: '.intercom-launcher',
        hide_default_launcher: false,
      });
    }
  }, [isLoaded, user]);

  return <>{children}</>;
}
