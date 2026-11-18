import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { language } = useApp();

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all shadow-sm cursor-pointer ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-xs'
        }`}
        title={language === 'ur' ? 'ایپ موبائل یا کمپیوٹر پر انسٹال کریں (آف لائن دستیاب)' : 'Install App to Phone / PC (Works Offline)'}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{language === 'ur' ? 'ایپ انسٹال کریں' : 'Install Offline App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-amber-400/80 bg-amber-50/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-bold hover:bg-amber-100 transition-colors cursor-pointer ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-xs'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'ur' ? 'آئی فون انسٹال' : 'Install on iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-urdu">
                  {language === 'ur' ? 'آئی فون / آئی پیڈ پر انسٹال کریں' : 'Install on iPhone / iPad'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-urdu">
                {language === 'ur' ? (
                  <>
                    1. سفاری (Safari) میں نیچے <strong>شیئر (Share)</strong> بٹن پر کلک کریں۔<br />
                    2. فہرست میں نیچے سکرول کر کے <strong>ہوم اسکرین میں شامل کریں (Add to Home Screen)</strong> منتخب کریں۔<br />
                    3. اس کے بعد ایپ بغیر انٹرنیٹ مکمل آف لائن چلے گی۔
                  </>
                ) : (
                  <>
                    1. Tap the <strong>Share</strong> button in Safari toolbar.<br />
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                    3. The app will launch like a native app and run 100% offline!
                  </>
                )}
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#004d30] py-2.5 text-xs font-bold text-white hover:bg-[#023e27] cursor-pointer"
              >
                {language === 'ur' ? 'سمجھ آ گئی' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
