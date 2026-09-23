'use client';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function ThemeSync() {
  const theme = useStore((s) => s.theme);
  const applyResolved = useStore((s) => s.applyResolved);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const resolve = () => {
      const r = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme;
      applyResolved(r);
    };
    resolve();
    mq.addEventListener('change', resolve);
    return () => mq.removeEventListener('change', resolve);
  }, [theme, applyResolved]);

  useEffect(() => {
    const on = () => useStore.getState().setOnline(true);
    const off = () => useStore.getState().setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  return null;
}