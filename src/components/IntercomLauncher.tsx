"use client";

import { useState } from 'react';
import { Intercom } from '@intercom/messenger-js-sdk';

interface IntercomLauncherProps {
  className?: string;
  children?: React.ReactNode;
}

export default function IntercomLauncher({ className = "", children }: IntercomLauncherProps) {
  const [isVisible] = useState(true);

  const handleIntercomClick = () => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Intercom as any)('show');
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`intercom-launcher ${className}`}>
      {children ? (
        <button
          onClick={handleIntercomClick}
          className="intercom-custom-launcher"
          aria-label="Open support chat"
        >
          {children}
        </button>
      ) : (
        <button
          onClick={handleIntercomClick}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
          aria-label="Open support chat"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
