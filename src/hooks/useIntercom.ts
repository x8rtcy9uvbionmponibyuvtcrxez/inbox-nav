"use client";

import { useCallback } from 'react';
import { Intercom } from '@intercom/messenger-js-sdk';

export function useIntercom() {
  const show = useCallback(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Intercom as any)('show');
    }
  }, []);

  const hide = useCallback(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Intercom as any)('hide');
    }
  }, []);

  const showMessages = useCallback(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Intercom as any)('showMessages');
    }
  }, []);

  const showNewMessage = useCallback((message?: string) => {
    if (typeof window !== 'undefined') {
      if (message) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Intercom as any)('showNewMessage', message);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Intercom as any)('showNewMessage');
      }
    }
  }, []);

  const update = useCallback((data: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Intercom as any)('update', data);
    }
  }, []);

  const trackEvent = useCallback((eventName: string, metadata?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Intercom as any)('trackEvent', eventName, metadata);
    }
  }, []);

  const showArticle = useCallback((articleId: string) => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Intercom as any)('showArticle', articleId);
    }
  }, []);

  const showSpace = useCallback((space: string) => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Intercom as any)('showSpace', space);
    }
  }, []);

  return {
    show,
    hide,
    showMessages,
    showNewMessage,
    update,
    trackEvent,
    showArticle,
    showSpace,
  };
}
