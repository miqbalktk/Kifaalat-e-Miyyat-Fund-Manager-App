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
  Check,
  Database,
  UploadCloud,
  HelpCircle,
  Sparkles,
  Laptop,
  ArrowDownToLine,
  FolderArchive,
  Terminal,
  ShieldAlert,
  FileCode
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PortableAppsView: React.FC = () => {
  const { language, members, contributions, claims, donations, auditLogs } = useApp();
  const { isInstallable, install } = usePWAInstall();
  const [downloadStarted, setDownloadStarted] = useState<string | null>(null);

  const isUrdu = language === 'ur';

  const handleDownload = (type: 'windows' | 'android' | 'singlefile') => {
    setDownloadStarted(type);
    let url = '/api/download/windows';
    let filename = 'Kifaalat-Fund-Windows-Portable.zip';
    if (type === 'android') {
      url = '/api/download/android';
      filename = 'Kifaalat-Fund-Offline.apk';
    } else if (type === 'singlefile') {
      url = '/api/download/singlefile';
      filename = 'Kifaalat-Fund-Standalone-Offline.html';
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadStarted(null), 3500);
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
    link.download = `KMF-Database-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Monitor className="w-80 h-80" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-amber-300 border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isUrdu ? '100% آف لائن پورٹیبل حل' : 'Zero-Install & Offline Packages'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-urdu">
              {isUrdu ? 'پورٹیبل ونڈوز سافٹ ویئر اور اینڈرائیڈ آف لائن ایپ' : 'Portable Windows App & Offline Android APK'}
            </h1>
            <p className="text-sm text-emerald-100 max-w-2xl">
              {isUrdu
                ? 'کسی بھی کمپیوٹر پر بغیر انسٹالیشن اور اینڈرائیڈ فون پر بغیر انٹرنیٹ استعمال کریں۔ تمام ریکارڈز آپ کے کمپیوٹر یا فون میں محفوظ رہتے ہیں۔'
                : 'Run portable desktop app on any Windows PC without installation, and install native offline APK on Android phones.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => handleDownload('windows')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Monitor className="w-4 h-4 text-emerald-700" />
              <span>{isUrdu ? 'ونڈوز ایپ ڈاؤنلوڈ (.zip)' : 'Download Windows (.zip)'}</span>
            </button>
            <button
              onClick={() => handleDownload('android')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isUrdu ? 'اینڈرائیڈ APK ڈاؤنلوڈ' : 'Download Android (.apk)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Windows Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-xl">
                <Laptop className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                {isUrdu ? 'بغیر انسٹالیشن • ونڈوز 7 تا 11' : 'Zero-Install • Windows 7-11'}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {isUrdu ? 'ونڈوز پورٹیبل ایپلیکیشن' : 'Windows Portable Application'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {isUrdu
                  ? 'Kifaalat-Fund-Windows-Portable.zip (سائز: ~316 کے بی)'
                  : 'Kifaalat-Fund-Windows-Portable.zip (Size: ~316 KB)'}
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isUrdu ? 'بغیر کسی پابندی:' : 'No Restrictions:'}</strong>{' '}
                  {isUrdu
                    ? 'عام یوزر اکاؤنٹ پر بغیر ایڈمن پاس ورڈ کے چلتا ہے۔'
                    : 'Runs on standard user accounts without administrator privileges.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isUrdu ? '100% آف لائن:' : 'Fully Offline:'}</strong>{' '}
                  {isUrdu
                    ? 'انٹرنیٹ کے بغیر چلتا ہے، سارا ڈیٹا کمپیوٹر میں محفوظ رہتا ہے۔'
                    : 'Works completely offline; stores data locally in persistent storage.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isUrdu ? 'نیٹو ونڈو موڈ:' : 'Native Window Mode:'}</strong>{' '}
                  {isUrdu
                    ? 'ایڈریس بار اور براؤزر بٹنوں کے بغیر فل اسکرین ڈیسک ٹاپ ایپ کی طرح کھلتا ہے۔'
                    : 'Launches in dedicated application window mode without URL bar.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isUrdu ? 'یو ایس بی فلیش ڈرائیو:' : 'USB Portable:'}</strong>{' '}
                  {isUrdu
                    ? 'فلیش ڈرائیو میں رکھ کر کسی بھی کمپیوٹر پر فنڈ کا انتظام کریں۔'
                    : 'Run from any USB drive or folder without altering registry or system.'}
                </span>
              </div>
            </div>

            {/* Launchers inside zip */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUrdu ? 'زپ کے اندر موجود فائلیں:' : 'Included Launchers:'}</span>
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li><code>Kifaalat-Fund.bat</code> — {isUrdu ? 'ایک کلک لانچر' : 'One-click desktop launcher'}</li>
                <li><code>Kifaalat-Fund-Silent.vbs</code> — {isUrdu ? 'خاموش ونڈو لانچر (بغیر بلیک اسکرین)' : 'Silent window launcher (no console window)'}</li>
                <li><code>index.html</code> — {isUrdu ? 'براہ راست ڈبل کلک فائل' : 'Direct HTML5 offline package'}</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleDownload('windows')}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {downloadStarted === 'windows' ? (
                <>
                  <Check className="w-5 h-5 text-emerald-300" />
                  <span>{isUrdu ? 'ڈاؤنلوڈ شروع ہو گیا...' : 'Downloading ZIP...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>{isUrdu ? 'ونڈوز پورٹیبل زپ ڈاؤنلوڈ کریں (.zip)' : 'Download Windows Portable (.zip)'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownload('singlefile')}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              {downloadStarted === 'singlefile' ? (
                <>
                  <Check className="w-4 h-4 text-teal-600" />
                  <span>{isUrdu ? 'ڈاؤنلوڈ ہو رہا ہے...' : 'Downloading HTML...'}</span>
                </>
              ) : (
                <>
                  <FileCode className="w-4 h-4 text-teal-600" />
                  <span>{isUrdu ? 'متبادل سنگل فائل ایپ (.html - بغیر ان زپ)' : 'Alternative Single-File App (.html - No Unzip)'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Android Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 rounded-xl">
                <Smartphone className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
                {isUrdu ? 'اینڈرائیڈ APK • 100% آف لائن' : 'Standalone APK • Offline'}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {isUrdu ? 'اینڈرائیڈ آف لائن ایپ (APK)' : 'Android Offline Application (APK)'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {isUrdu
                  ? 'Kifaalat-Fund-Offline.apk (سائز: ~3.45 ایم بی)'
                  : 'Kifaalat-Fund-Offline.apk (Size: ~3.45 MB)'}
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isUrdu ? 'بغیر انٹرنیٹ کے استعمال:' : 'No Internet Needed:'}</strong>{' '}
                  {isUrdu
                    ? 'گاؤں یا سفر میں موبائل سگنل نہ ہونے پر بھی مکمل کام کرتی ہے۔'
                    : 'Works in remote funeral or condolence locations without mobile network.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isUrdu ? 'موبائل اسٹوریج:' : 'Local Storage:'}</strong>{' '}
                  {isUrdu
                    ? 'فنڈ کی ادائیگیاں اور دعوے فون کی انٹرنل میموری میں محفوظ رہتے ہیں۔'
                    : 'All payments, pledges, and claims remain saved on phone internal storage.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isUrdu ? 'سیکیورٹی کوڈ تحفظ:' : 'Security Passcode:'}</strong>{' '}
                  {isUrdu
                    ? 'فون میں سیکیورٹی پن کوڈ لگا کر مالیاتی ڈیٹا محفوظ رکھیں۔'
                    : 'Passcode barrier ensures unauthorized users cannot access records.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isUrdu ? 'تمام اینڈرائیڈ ورژنز:' : 'All Android Versions:'}</strong>{' '}
                  {isUrdu
                    ? 'اینڈرائیڈ 5.0 لالی پاپ سے لے کر جدید ترین اینڈرائیڈ 15+ تک سپورٹڈ ہے۔'
                    : 'Compatible with Android 5.0 up to latest Android 15+ devices.'}
                </span>
              </div>
            </div>

            {/* Android Install Steps */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                <span>{isUrdu ? 'انسٹالیشن کا طریقہ:' : 'Quick Installation:'}</span>
              </div>
              <ol className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                <li>{isUrdu ? 'نیچے بٹن سے APK ڈاؤنلوڈ کریں' : 'Download APK file using button below'}</li>
                <li>{isUrdu ? 'ڈاؤنلوڈ مکمل ہونے پر فائل کھول کر Install دبائیں' : 'Open file and tap "Install"'}</li>
                <li>{isUrdu ? 'اگر پوچھے تو "Allow unknown sources" کی اجازت دیں' : 'Allow unknown sources if prompted by Android'}</li>
              </ol>
            </div>
          </div>

          <button
            onClick={() => handleDownload('android')}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {downloadStarted === 'android' ? (
              <>
                <Check className="w-5 h-5 text-emerald-300" />
                <span>{isUrdu ? 'ڈاؤنلوڈ شروع ہو گیا...' : 'Downloading APK...'}</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>{isUrdu ? 'اینڈرائیڈ APK ڈاؤنلوڈ کریں' : 'Download Android APK (.apk)'}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Backup and Cross-Device Transfer Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-lg">
              <Database className="w-5 h-5 text-emerald-600" />
              <span>{isUrdu ? 'کمپیوٹر اور موبائل کے درمیان ڈیٹا منتقل کریں' : 'Data Portability: Transfer Between PC & Mobile'}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              {isUrdu
                ? 'اپنے کمپیوٹر سے تمام ممبران، رسیدیں اور فنڈز ایک کلک میں محفوظ فائل میں ڈاؤنلوڈ کریں، اور پھر اپنے موبائل میں لوڈ کر لیں۔'
                : 'Export a complete database backup from your Windows PC and restore it directly onto your Android phone for seamless offline sync.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>{isUrdu ? 'ڈیٹا بیک اپ ڈاؤنلوڈ کریں' : 'Export Backup (.json)'}</span>
            </button>

            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs cursor-pointer">
              <UploadCloud className="w-4 h-4" />
              <span>{isUrdu ? 'بیک اپ بحال کریں' : 'Restore from File'}</span>
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
                        // ignore error
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

    </div>
  );
};
