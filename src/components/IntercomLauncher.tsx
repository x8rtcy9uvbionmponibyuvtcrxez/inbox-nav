"use client";

import { useIntercom } from 'react-use-intercom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

interface IntercomLauncherProps {
  className?: string;
  children?: React.ReactNode;
}

export default function IntercomLauncher({ className = "", children }: IntercomLauncherProps) {
  // Check if Intercom is available
  const intercomAppId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
  const { show } = useIntercom();
  
  // If no Intercom app ID, don't render anything
  if (!intercomAppId) {
    return null;
  }

  const handleClick = () => {
    show();
  };

  if (children) {
    return (
      <button
        onClick={handleClick}
        className={className}
        aria-label="Open support chat"
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 ${className}`}
      aria-label="Open support chat"
    >
      <EnvelopeIcon className="w-6 h-6" />
    </button>
  );
}
