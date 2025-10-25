"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Service worker registered successfully
        })
        .catch((registrationError) => {
          console.error('Service worker registration failed:', registrationError);
        });
    }
  }, []);

  return null;
}