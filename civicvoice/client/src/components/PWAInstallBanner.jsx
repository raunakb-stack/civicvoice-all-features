import usePWA from '../hooks/usePWA';

export default function PWAInstallBanner() {
  const { installPrompt, installed, triggerInstall } = usePWA();

  if (installed || !installPrompt) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-stone-900 dark:bg-stone-800 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700 max-w-sm w-[calc(100%-2rem)] animate-bounce-once">
      <div className="w-10 h-10 bg-civic-500 rounded-xl flex items-center justify-center shrink-0">
        <span className="font-display text-sm tracking-wider">CV</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight">Install CivicVoice</p>
        <p className="text-xs text-stone-400 mt-0.5">Add to homescreen for offline access</p>
      </div>
      <button
        onClick={triggerInstall}
        className="shrink-0 bg-civic-500 hover:bg-civic-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
      >
        Install
      </button>
    </div>
  );
}
