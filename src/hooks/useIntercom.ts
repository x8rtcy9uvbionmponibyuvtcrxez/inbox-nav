"use client";

import { useCallback } from 'react';
import { Intercom } from '@intercom/messenger-js-sdk';

export function useIntercom() {
  const show = useCallback(() => {
    if (typeof window !== 'undefined') {
      Intercom('show');
    }
  }, []);

  const hide = useCallback(() => {
    if (typeof window !== 'undefined') {
      Intercom('hide');
    }
  }, []);

  const showMessages = useCallback(() => {
    if (typeof window !== 'undefined') {
      Intercom('showMessages');
    }
  }, []);

  const showNewMessage = useCallback((message?: string) => {
    if (typeof window !== 'undefined') {
      if (message) {
        Intercom('showNewMessage', message);
      } else {
        Intercom('showNewMessage');
      }
    }
  }, []);

  const update = useCallback((data: any) => {
    if (typeof window !== 'undefined') {
      Intercom('update', data);
    }
  }, []);

  const trackEvent = useCallback((eventName: string, metadata?: any) => {
    if (typeof window !== 'undefined') {
      Intercom('trackEvent', eventName, metadata);
    }
  }, []);

  const showArticle = useCallback((articleId: string) => {
    if (typeof window !== 'undefined') {
      Intercom('showArticle', articleId);
    }
  }, []);

  const showSpace = useCallback((space: string) => {
    if (typeof window !== 'undefined') {
      Intercom('showSpace', space);
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
