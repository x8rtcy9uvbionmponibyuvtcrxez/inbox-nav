"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { IntercomProvider as Provider, useIntercom } from 'react-use-intercom';

interface IntercomProviderProps {
  children: React.ReactNode;
}

// Internal component that handles the boot logic with Clerk user data
function IntercomBooter() {
  const { user, isLoaded } = useUser();
  const { boot, update, shutdown } = useIntercom();

  useEffect(() => {
    // Wait for Clerk to finish loading
    if (!isLoaded) return;

    // If user is logged in, boot Intercom with real user data
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
      };

      console.log('Booting Intercom with user data:', userData);
      boot(userData);
    } else {
      // No user logged in, boot Intercom without user data
      console.log('Booting Intercom without user data');
      boot();
    }

    // Cleanup function
    return () => {
      shutdown();
    };
  }, [user, isLoaded, boot, shutdown]);

  // Update user data when user changes
  useEffect(() => {
    if (!isLoaded || !user) return;

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
    };

    console.log('Updating Intercom user data:', userData);
    update(userData);
  }, [user, isLoaded, update]);

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