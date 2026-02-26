import { useState, useEffect } from 'react';

export default function usePWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled]         = useState(false);
  const [swReady, setSwReady]             = useState(false);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered:', reg.scope);
          setSwReady(true);
        })
        .catch((err) => console.error('[PWA] SW registration failed:', err));
    }
  }, []);

  // Capture beforeinstallprompt event
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  return { installPrompt, installed, swReady, triggerInstall };
}
