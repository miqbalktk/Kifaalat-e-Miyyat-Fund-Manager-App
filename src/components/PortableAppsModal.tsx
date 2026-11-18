import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Monitor,
  Smartphone,
  Download,
  CheckCircle2,
  HardDrive,
  WifiOff,
  ShieldCheck,
  FileCode,
  ArrowDownToLine,
  ExternalLink,
  Laptop,
  Check,
  X,
  Database,
  UploadCloud,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface PortableAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortableAppsModal: React.FC<PortableAppsModalProps> = ({ isOpen, onClose }) => {
  const { language, members, contributions, claims, donations, auditLogs } = useApp();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'windows' | 'android' | 'backup'>('windows');
  const [downloadStarted, setDownloadStarted] = useState<string | null>(null);

  if (!isOpen) return null;

  const isUrdu = language === 'ur';

  const handleDownload = async (type: 'windows' | 'android' | 'singlefile') => {
    setDownloadStarted(type);
    try {
      let url = '/api/download/windows';
      let filename = 'Kifaalat-Fund-Windows-Portable.zip';
      if (type === 'android') {
        url = '/api/download/android';
        filename = 'Kifaalat-Fund-Offline.apk';
      } else if (type === 'singlefile') {
        url = '/api/download/singlefile';
        filename = 'Kifaalat-Fund-Standalone-Offline.html';
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      if (blob.size < 500) throw new Error('File too small or invalid');

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 15000);
    } catch (err) {
      console.warn('Blob download fallback:', err);
      const fallbackUrl =
        type === 'android'
          ? '/downloads/Kifaalat-Fund-Offline.apk'
          : type === 'singlefile'
          ? '/downloads/Kifaalat-Fund-Standalone-Offline.html'
          : '/downloads/Kifaalat-Fund-Windows-Portable.zip';
      window.open(fallbackUrl, '_blank');
    } finally {
      setTimeout(() => setDownloadStarted(null), 3500);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      appName: 'Kifaalat e Miyyat Fund',
      exportedAt: new Date().toISOString(),
      members,
      contributions,
      claims,
      donations,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KMF-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-emerald-950 rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl border border-white/20 shadow-xs">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-urdu leading-tight">
                {isUrdu ? 'پورٹیبل سافٹ ویئر اور اینڈرائیڈ آف لائن ایپ ڈاؤنلوڈ' : 'Portable Desktop App & Offline Android APK'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                {isUrdu
                  ? 'بغیر انٹرنیٹ کے مکمل آف لائن استعمال — ونڈوز پی سی اور اینڈرائیڈ موبائل کے لیے'
                  : 'Zero Installation, 100% Offline Access for Windows PCs and Android Phones'}
              </p>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/15">
            <button
              onClick={() => setActiveTab('windows')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'windows'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>{isUrdu ? 'ونڈوز پورٹیبل ایپ (PC)' : 'Windows Portable App'}</span>
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'android'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{isUrdu ? 'اینڈرائیڈ آف لائن ایپ (APK)' : 'Android Offline APK'}</span>
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'backup'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>{isUrdu ? 'ڈیٹا بیک اپ و منتقلی' : 'Data Portability & Backup'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: WINDOWS PORTABLE */}
          {activeTab === 'windows' && (
            <div className="space-y-5">
              {/* Option A: Windows Portable ZIP Package */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
                    <Laptop className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-emerald-950 dark:text-emerald-100">
                      Kifaalat-Fund-Windows-Portable.zip
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      {isUrdu
                        ? 'آپشن 1: مکمل ونڈوز پورٹیبل زپ پیکیج (بیچ اور سائلنٹ لانچر کے ساتھ)'
                        : 'Option 1: Complete Portable ZIP Package (with .bat & .vbs app-window launchers)'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload('windows')}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                >
                  {downloadStarted === 'windows' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>{isUrdu ? 'ڈاؤنلوڈ جاری ہے...' : 'Downloading ZIP...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{isUrdu ? 'ونڈوز پورٹیبل زپ ڈاؤنلوڈ کریں' : 'Download Windows ZIP'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Option B: Direct Single-File Standalone Offline App (Zero Extraction!) */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-600 text-white rounded-xl shadow-xs">
                    <FileCode className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-teal-950 dark:text-teal-100">
                        Kifaalat-Fund-Standalone-Offline.html
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/30 text-amber-900 dark:text-amber-200 border border-amber-400/50">
                        {isUrdu ? 'سنگل فائل (بغیر ان زپ)' : 'No Extraction Needed'}
                      </span>
                    </div>
                    <p className="text-xs text-teal-800 dark:text-teal-300 mt-0.5">
                      {isUrdu
                        ? 'آپشن 2: ایک واحد فائل! زپ کھولنے کی بھی ضرورت نہیں، بس فائل پر ڈبل کلک کریں اور 100% آف لائن چلائیں۔'
                        : 'Option 2: Single-File Standalone App! Immune to ZIP issues — simply double-click the .html file to launch.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload('singlefile')}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                >
                  {downloadStarted === 'singlefile' ? (
                    <>
                      <Check className="w-4 h-4 text-teal-300" />
                      <span>{isUrdu ? 'ڈاؤنلوڈ جاری ہے...' : 'Downloading HTML...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{isUrdu ? 'سنگل فائل ایپ ڈاؤنلوڈ (.html)' : 'Download Single-File App (.html)'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Windows Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isUrdu ? 'بغیر کسی انسٹالیشن (Zero-Install)' : 'No Installation Required'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isUrdu
                        ? 'کسی انسٹالر کی ضرورت نہیں۔ بس زپ ان زپ کریں اور ڈبل کلک کر کے فوری چلائیں۔'
                        : 'No setup wizard or installation. Extract the ZIP and double-click to run immediately.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isUrdu ? 'بغیر کسی پابندی اور ایڈمن اجازت' : 'Runs Without Restriction'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isUrdu
                        ? 'کسی ایڈمنسٹریٹر پرمشن کی ضرورت نہیں۔ عام صارف اکاونٹ پر بھی فورا چلتا ہے۔'
                        : 'No administrator rights or privileges needed. Works on restricted or standard user accounts.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <WifiOff className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isUrdu ? '100% مکمل آف لائن' : '100% Offline Capability'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isUrdu
                        ? 'انٹرنیٹ کے بغیر چلتا ہے۔ تمام ریکارڈز آپ کے اپنے کمپیوٹر کی اسٹوریج میں محفوظ رہتے ہیں۔'
                        : 'Runs without internet. All records are stored securely in your computer local disk.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <HardDrive className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isUrdu ? 'یو ایس بی فلیش ڈرائیو پر پورٹیبل' : 'Portable on USB Drives'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isUrdu
                        ? 'یو ایس بی ڈرائیو میں رکھ کر کسی بھی کمپیوٹر پر فنڈ کا حساب کتاب دیکھ سکتے ہیں۔'
                        : 'Carry the app on any USB drive and run on office or home computers anywhere.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions Steps */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <span>{isUrdu ? 'ونڈوز پر چلانے کا آسان طریقہ' : 'How to Run on Windows (Step by Step)'}</span>
                </h4>
                <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside">
                  <li>
                    <strong>{isUrdu ? 'فائل ڈاؤنلوڈ کریں:' : 'Download ZIP:'}</strong>{' '}
                    {isUrdu
                      ? 'اوپر والے بٹن سے Kifaalat-Fund-Windows-Portable.zip ڈاؤنلوڈ کریں۔'
                      : 'Click the download button above to download the portable ZIP package.'}
                  </li>
                  <li>
                    <strong>{isUrdu ? 'فائل ان زپ (Extract) کریں:' : 'Extract ZIP:'}</strong>{' '}
                    {isUrdu
                      ? 'زپ فائل پر رائٹ کلک کر کے "Extract All" منتخب کریں اور کسی بھی فولڈر میں محفوظ کریں۔'
                      : 'Right click the downloaded ZIP file and click "Extract All".'}
                  </li>
                  <li>
                    <strong>{isUrdu ? 'ڈبل کلک کریں:' : 'Double-click Launcher:'}</strong>{' '}
                    {isUrdu
                      ? 'فولڈر کھول کر "Kifaalat-Fund.bat" یا خاموش ونڈو کے لیے "Kifaalat-Fund-Silent.vbs" پر ڈبل کلک کریں۔'
                      : 'Double-click "Kifaalat-Fund.bat" (or "Kifaalat-Fund-Silent.vbs" for silent app window).'}
                  </li>
                  <li>
                    <strong>{isUrdu ? 'آف لائن لطف اٹھائیں:' : 'Enjoy 100% Offline:'}</strong>{' '}
                    {isUrdu
                      ? 'ایپ بغیر ایڈریس بار کے مکمل ڈیسک ٹاپ سافٹ ویئر کی طرح کھل جائے گی۔'
                      : 'The app opens instantly in a borderless native app window. No internet required.'}
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID OFFLINE APK */}
          {activeTab === 'android' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-600 text-white rounded-xl shadow-xs">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-emerald-950 dark:text-emerald-100">
                      Kifaalat-Fund-Offline.apk
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      {isUrdu
                        ? 'سائز: ~3.45 ایم بی • آف لائن اینڈرائیڈ ایپ • تمام موبائل فونز کے لیے موزوں'
                        : 'Size: ~3.45 MB • Standalone APK • 100% Offline • Android 5.0 to 15+'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload('android')}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                >
                  {downloadStarted === 'android' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>{isUrdu ? 'ڈاؤنلوڈ شروع ہو گیا...' : 'Downloading APK...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{isUrdu ? 'اینڈرائیڈ APK ڈاؤنلوڈ کریں' : 'Download Android APK'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Android Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <WifiOff className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isUrdu ? 'بغیر انٹرنیٹ کے مکمل آف لائن' : 'Fully Offline in Remote Areas'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isUrdu
                        ? 'موبائل ڈیٹا یا وائی فائی نہ ہونے پر بھی تمام 39 ممبران، فنڈز اور رسیدیں دیکھیں۔'
                        : 'Access all member records, claims, and receipts even with zero mobile data.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <HardDrive className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isUrdu ? 'موبائل اسٹوریج میں ڈیٹا تحفظ' : 'Local Device Storage'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isUrdu
                        ? 'تمام ریکارڈز آپ کے موبائل فون کی اپنی اسٹوریج میں ہمیشہ محفوظ رہتے ہیں۔'
                        : 'Persistent offline storage retains all entries securely across restarts.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isUrdu ? 'سیکیورٹی کوڈ اور پن لاک' : 'Security Passcode Lock'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isUrdu
                        ? 'فون گم ہو جانے کی صورت میں بھی ریکارڈز محفوظ رکھنے کے لیے سیکیورٹی پن لاک۔'
                        : 'Built-in security lock protects sensitive fund records if phone is shared.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Smartphone className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isUrdu ? 'تمام اینڈرائیڈ ورژنز کے لیے' : 'Wide Device Compatibility'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isUrdu
                        ? 'اینڈرائیڈ 5.0 (Lollipop) سے لے کر اینڈرائیڈ 15+ تک تمام فونز پر کام کرتا ہے۔'
                        : 'Runs on Android 5.0 Lollipop through Android 15+ smoothly.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Android Install Steps */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-teal-600" />
                  <span>{isUrdu ? 'موبائل پر APK انسٹال کرنے کا طریقہ' : 'How to Install APK on Android'}</span>
                </h4>
                <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside">
                  <li>
                    <strong>{isUrdu ? 'APK ڈاؤنلوڈ کریں:' : 'Download APK:'}</strong>{' '}
                    {isUrdu
                      ? 'اوپر دیئے گئے بٹن پر کلک کر کے Kifaalat-Fund-Offline.apk ڈاؤنلوڈ کریں۔'
                      : 'Tap the download button above to download Kifaalat-Fund-Offline.apk.'}
                  </li>
                  <li>
                    <strong>{isUrdu ? 'فائل کھولیں:' : 'Open File:'}</strong>{' '}
                    {isUrdu
                      ? 'ڈاؤنلوڈ مکمل ہونے پر نوٹیفکیشن یا فون کے "Downloads" فولڈر سے فائل پر ٹیپ کریں۔'
                      : 'Tap the notification or locate the file in your phone\'s Downloads folder.'}
                  </li>
                  <li>
                    <strong>{isUrdu ? 'انسٹالیشن اجازت:' : 'Allow Installation:'}</strong>{' '}
                    {isUrdu
                      ? 'اگر فون پوچھے تو "Install unknown apps" یا "Allow from this source" کو آن کر دیں۔'
                      : 'If prompted by Android, enable "Install unknown apps" or "Allow from this source".'}
                  </li>
                  <li>
                    <strong>{isUrdu ? 'مکمل:' : 'Done:'}</strong>{' '}
                    {isUrdu
                      ? 'انسٹال پر ٹیپ کریں اور ایپ کو اپنی ہوم اسکرین سے 100% آف لائن چلائیں۔'
                      : 'Tap "Install" and launch the app directly from your home screen!'}
                  </li>
                </ol>
              </div>

              {/* PWA Alternative Banner */}
              {isInstallable && (
                <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-xs text-emerald-950 dark:text-emerald-100">
                      {isUrdu ? 'متبادل فوری انسٹالیشن (1-Click PWA)' : 'Alternative 1-Tap Browser Install (PWA)'}
                    </h5>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-200">
                      {isUrdu
                        ? 'بغیر کسی فائل ڈاؤنلوڈ کے براہ راست براؤزر سے بھی ہوم اسکرین پر انسٹال کر سکتے ہیں۔'
                        : 'Install directly to your Android home screen via Chrome without downloading an APK file.'}
                    </p>
                  </div>
                  <button
                    onClick={install}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer shrink-0"
                  >
                    {isUrdu ? 'فوری انسٹال' : 'Install PWA'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DATA BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-600 text-white rounded-xl">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-amber-950 dark:text-amber-100">
                      {isUrdu ? 'پی سی اور موبائل کے درمیان ڈیٹا ٹرانسفر' : 'Transfer Data Between PC & Mobile'}
                    </h3>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      {isUrdu
                        ? 'آپ اپنے کمپیوٹر سے سارا ڈیٹا بیک اپ فائل میں ڈاؤنلوڈ کر کے اپنے موبائل فون میں لوڈ کر سکتے ہیں۔'
                        : 'Easily backup all 39 members and entries from Windows PC and load them onto your Android phone.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm mb-1">
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>{isUrdu ? 'بیک اپ فائل ڈاؤنلوڈ کریں' : 'Export Database Backup'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                      {isUrdu
                        ? 'تمام ممبران، ماہانہ فنڈز، رسیدیں اور آڈٹ لاگز کو ایک محفوظ JSON فائل میں محفوظ کریں۔'
                        : 'Download a complete JSON snapshot of all members, contributions, and claims.'}
                    </p>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'ڈیٹا بیک اپ فائل ڈاؤنلوڈ کریں' : 'Download Backup File (.json)'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-sm mb-1">
                      <UploadCloud className="w-4 h-4" />
                      <span>{isUrdu ? 'بیک اپ فائل سے بحال کریں' : 'Restore from Backup'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                      {isUrdu
                        ? 'کسی دوسرے کمپیوٹر یا موبائل کا بیک اپ فائل یہاں لوڈ کر کے ڈیٹا ہم آہنگ کریں۔'
                        : 'Upload a backup JSON file to restore records onto this device.'}
                    </p>
                  </div>
                  <label className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'بیک اپ فائل منتخب کریں' : 'Select Backup File'}</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const json = JSON.parse(event.target?.result as string);
                              if (json.members && Array.isArray(json.members)) {
                                localStorage.setItem('kmf_members_v39', JSON.stringify(json.members));
                              }
                              if (json.contributions && Array.isArray(json.contributions)) {
                                localStorage.setItem('kmf_contributions_v39', JSON.stringify(json.contributions));
                              }
                              if (json.claims && Array.isArray(json.claims)) {
                                localStorage.setItem('kmf_claims', JSON.stringify(json.claims));
                              }
                              if (json.donations && Array.isArray(json.donations)) {
                                localStorage.setItem('kmf_donations', JSON.stringify(json.donations));
                              }
                              window.location.reload();
                            } catch {
                              // error parsing
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-emerald-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {isUrdu
                ? 'فنانس سیکرٹری: محمد اقبال خٹک (0346-9100998)'
                : 'Finance Secretary: Muhammad Iqbal Khattak (0346-9100998)'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
