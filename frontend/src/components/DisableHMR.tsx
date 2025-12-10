'use client';

import { useEffect } from 'react';

export default function DisableHMR() {
  useEffect(() => {
    // ngrok 환경 감지 (환경 변수 또는 URL로)
    const isNgrok = typeof window !== 'undefined' && (
      process.env.NEXT_PUBLIC_NGROK_URL ||
      window.location.hostname.includes('ngrok')
    );

    if (isNgrok) {
      console.log('[HMR] ngrok environment detected, disabling HMR');

      // WebSocket 차단
      const originalWebSocket = window.WebSocket;
      (window as any).WebSocket = class extends originalWebSocket {
        constructor(url: string | URL, protocols?: string | string[]) {
          const urlString = typeof url === 'string' ? url : url.toString();
          if (urlString.includes('webpack-hmr') || urlString.includes('_next/webpack-hmr') || urlString.includes('hmr')) {
            console.log('[HMR] WebSocket connection blocked:', urlString);
            throw new Error('HMR disabled in ngrok environment');
          }
          super(url, protocols);
        }
      } as any;

      // EventSource 차단 (HTTP 폴링용)
      if (window.EventSource) {
        const originalEventSource = window.EventSource;
        (window as any).EventSource = class extends originalEventSource {
          constructor(url: string, eventSourceInitDict?: EventSourceInit) {
            if (url.includes('webpack-hmr') || url.includes('_next/webpack-hmr') || url.includes('hmr')) {
              console.log('[HMR] EventSource connection blocked:', url);
              throw new Error('HMR disabled in ngrok environment');
            }
            super(url, eventSourceInitDict);
          }
        } as any;
      }

      // fetch 요청도 차단 (HTTP 폴링)
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url || args[0].toString();
        if (url.includes('webpack-hmr') || url.includes('_next/webpack-hmr') || url.includes('/hmr')) {
          console.log('[HMR] Fetch request blocked:', url);
          return Promise.reject(new Error('HMR disabled in ngrok environment'));
        }
        return originalFetch.apply(this, args);
      };
    }
  }, []);

  return null;
}

