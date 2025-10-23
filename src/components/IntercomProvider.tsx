"use client";

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { IntercomProvider as Provider, useIntercom } from 'react-use-intercom';

interface IntercomProviderProps {
  children: React.ReactNode;
}

// Internal component that handles the boot logic with Clerk user data
function IntercomBooter() {
  const { user, isLoaded } = useUser();
  const { boot, update, shutdown } = useIntercom();
  const hasBootedRef = useRef(false);

  useEffect(() => {
    // Wait for Clerk to finish loading
    if (!isLoaded) return;

    // If user is logged in, boot Intercom with real user data
    const baseConfig = {} as const;

    if (user) {
      const userData = {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName || 'User',
        createdAt: user.createdAt ? Math.floor(new Date(user.createdAt).getTime() / 1000) : undefined,
        customAttributes: {
          clerkId: user.id,
          username: user.username || user.firstName || 'user',
          firstName: user.firstName,
          lastName: user.lastName,
        },
      } as const;

      if (!hasBootedRef.current) {
        console.log('Booting Intercom with user data:', userData);
        boot({ ...baseConfig, ...userData });
        hasBootedRef.current = true;
      } else {
        console.log('Updating Intercom user data:', userData);
        update({ ...baseConfig, ...userData });
      }
    } else {
      // No user logged in, boot Intercom without user data
      if (!hasBootedRef.current) {
        console.log('Booting Intercom without user data');
        boot(baseConfig);
        hasBootedRef.current = true;
      }
    }

    // Cleanup function
    return () => {
      hasBootedRef.current = false;
      shutdown();
    };
  }, [user, isLoaded, boot, shutdown, update]);

  // Update user data when user changes
  return null;
}

// Main IntercomProvider component
export default function IntercomProvider({ children }: IntercomProviderProps) {
  const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

  if (!appId) {
    console.warn('NEXT_PUBLIC_INTERCOM_APP_ID is not set. Intercom will not be initialized.');
    return <>{children}</>;
  }

  return (
    <Provider appId={appId} autoBoot={false}>
      <IntercomBooter />
      {children}
    </Provider>
  );
}
