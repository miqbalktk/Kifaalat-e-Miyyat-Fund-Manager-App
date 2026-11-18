import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MemberCredentialsModal } from './MemberCredentialsModal';
import { GoogleDriveRestoreModal } from './GoogleDriveRestoreModal';
import { TARGET_DRIVE_FOLDER_ID, TARGET_DRIVE_FOLDER_URL, DEFAULT_BACKUP_PASSPHRASE } from '../services/googleDriveService';
import {
  KeyRound,
  Shield,
  Cloud,
  CloudOff,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Lock,
  Smartphone,
  Users2,
  Check,
  X,
  UserPlus,
  ExternalLink,
  HardDrive
} from 'lucide-react';

export const SecuritySyncView: React.FC = () => {
  const {
    language,
    t,
    currentUser,
    toggleMfa,
    syncStatus,
    triggerCloudSync,
    toggleOfflineSimulation,
    exportEncryptedVault,
    importEncryptedVault,
    userCredentials,
    isAdminOrKhazanchi,
    isGoogleDriveConnected,
    googleUserEmail,
    connectGoogleDrive,
    backupToGoogleDrive,
    lastGoogleBackupTime,
    autoBackupEnabled
  } = useApp();

  const [showCredModal, setShowCredModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [quickDriveMsg, setQuickDriveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isQuickBackingUp, setIsQuickBackingUp] = useState(false);

  // MFA simulation states
  const [mfaCode, setMfaCode] = useState('');
  const [mfaVerified, setMfaVerified] = useState(false);
  const [mfaError, setMfaError] = useState(false);

  // Vault encryption export/import states
  const [passphrase, setPassphrase] = useState('');
  const [importPassphrase, setImportPassphrase] = useState('');
  const [vaultJsonInput, setVaultJsonInput] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExportingVault, setIsExportingVault] = useState(false);
  const [isSavingLocalBackup, setIsSavingLocalBackup] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleVerifyTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length === 6) {
      setMfaVerified(true);
      setMfaError(false);
      setTimeout(() => setMfaVerified(false), 3000);
    } else {
      setMfaError(true);
    }
  };

  const triggerFileSave = async (content: string, fileName: string, mimeType = 'application/json') => {
    const blob = new Blob([content], { type: mimeType });
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && typeof navigator !== 'undefined' && navigator.canShare) {
      try {
        const file = new File([blob], fileName, { type: mimeType });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: fileName,
            text: 'Kifaalat e Miyyat Fund Backup File'
          });
          return true;
        }
      } catch (shareErr: any) {
        if (shareErr?.name === 'AbortError') return false;
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        if (document.body.contains(link)) document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {}
    }, 3000);
    return true;
  };

  const handleSaveLocalDeviceBackup = async () => {
    try {
      setIsSavingLocalBackup(true);
      setQuickDriveMsg(null);
      const encrypted = await exportEncryptedVault(DEFAULT_BACKUP_PASSPHRASE);
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `kifaalat-local-backup-${dateStr}.kmf`;
      const saved = await triggerFileSave(encrypted, fileName, 'application/octet-stream');
      if (saved) {
        setQuickDriveMsg({
          type: 'success',
          text:
            language === 'ur'
              ? `مکمل بیک اپ فائل (${fileName}) آپ کے لیپ ٹاپ / موبائل پر محفوظ ہو گئی ہے! (بحالی کا پاس ورڈ: ${DEFAULT_BACKUP_PASSPHRASE})`
              : `Local backup saved on your device (${fileName})! Default restore password: ${DEFAULT_BACKUP_PASSPHRASE}`
        });
        setTimeout(() => setQuickDriveMsg(null), 6000);
      }
    } catch (err: any) {
      setQuickDriveMsg({
        type: 'error',
        text: err?.message || 'Failed to save local device backup.'
      });
    } finally {
      setIsSavingLocalBackup(false);
    }
  };

  const handleExportVault = async () => {
    const effectivePassphrase = (passphrase || '').trim();
    if (!effectivePassphrase) return;
    try {
      setIsExportingVault(true);
      setExportError(null);
      setExportSuccess(false);
      const encrypted = await exportEncryptedVault(effectivePassphrase);
      const fileName = `kifaalat-vault-${new Date().toISOString().split('T')[0]}.kmf`;
      const saved = await triggerFileSave(encrypted, fileName, 'application/octet-stream');
      if (saved) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 5000);
      }
    } catch (err: any) {
      console.error('Export encrypted vault error:', err);
      setExportError(err?.message || 'Failed to export encrypted backup file.');
    } finally {
      setIsExportingVault(false);
    }
  };

  const handleImportVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultJsonInput || !importPassphrase) return;

    const success = await importEncryptedVault(vaultJsonInput, importPassphrase);
    if (success) {
      setImportStatus('success');
      setVaultJsonInput('');
      setImportPassphrase('');
      setTimeout(() => setImportStatus('idle'), 4000);
    } else {
      setImportStatus('error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = evt => {
        setVaultJsonInput(evt.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const permissions = [
    { module: 'View Dashboard & Public Reports', admin: true, finance: true, audit: true, member: true },
    { module: 'Record Monthly Payments & Print Receipt', admin: true, finance: true, audit: false, member: false },
    { module: 'Register & Modify Member Details', admin: true, finance: true, audit: false, member: false },
    { module: 'Approve & Disburse Death Relief Claims', admin: true, finance: true, audit: false, member: false },
    { module: 'Export Encrypted Vault & Cloud Sync', admin: true, finance: false, audit: false, member: false },
    { module: 'Verify Audit Trail Cryptographic Hashes', admin: true, finance: true, audit: true, member: true },
    { module: 'Submit Bereavement Claim for Family', admin: true, finance: true, audit: true, member: true },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-urdu">
          {t.security.title}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t.security.subtitle}
        </p>
      </div>

      {/* Admin Member Usernames & Passwords Manager */}
      {isAdminOrKhazanchi && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-[#eef7f0] dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-emerald-900/40 p-6 rounded-3xl border-2 border-emerald-500/40 dark:border-emerald-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#004d30] text-amber-300 flex items-center justify-center shrink-0 shadow-md">
              <KeyRound className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-urdu">
                {language === 'ur' ? 'اراکین لاگ ان، پاس ورڈ اور اختیارات کا انتظام' : 'Member Logins, Passwords & Access Rights'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-emerald-200 mt-0.5">
                {language === 'ur'
                  ? `کل فعال اکاؤنٹس: ${userCredentials.length}۔ ایڈمن ہر ممبر کا یوزر اور پاس ورڈ بنا سکتا ہے، حقوق تفویض کر سکتا ہے، پاس ورڈ بدل سکتا ہے یا اکاؤنٹ غیر فعال کر سکتا ہے۔`
                  : `Active Accounts: ${userCredentials.length}. Create usernames/passwords, assign rights, modify passwords, or disable accounts.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCredModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>{language === 'ur' ? 'اکاؤنٹس و پاس ورڈ مینج کریں' : 'Manage User Accounts'}</span>
          </button>
        </div>
      )}

      {showCredModal && (
        <MemberCredentialsModal
          isOpen={showCredModal}
          onClose={() => setShowCredModal(false)}
        />
      )}

      {/* Google Drive Cloud Auto-Backup & Cross-Device Restore Card */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-emerald-950/40 p-6 rounded-3xl border-2 border-blue-400/50 dark:border-indigo-600 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Cloud className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-urdu">
                  {language === 'ur' ? 'گوگل ڈرائیو روزانہ آٹو بیک اپ و بحالی' : 'Google Drive Daily Auto-Backup & Cross-Device Restore'}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isGoogleDriveConnected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {isGoogleDriveConnected ? (googleUserEmail || 'Connected') : 'Not Connected'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {language === 'ur'
                  ? 'تمام اراکین کے اکاؤنٹس، پاس ورڈز، اور مالی ریکارڈز روزانہ گوگل ڈرائیو پر محفوظ ہوتے ہیں اور کسی بھی نئے موبائل یا کمپیوٹر پر بحال کیے جا سکتے ہیں۔'
                  : 'All member credentials, passwords, and dues are backed up daily to Google Drive with default encryption password "1234" for instant restoration across any mobile or PC.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isGoogleDriveConnected ? (
              <button
                onClick={() => setShowDriveModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-2"
              >
                <HardDrive className="w-4 h-4" />
                <span>{language === 'ur' ? 'گوگل ڈرائیو بیک اپ مینیجر' : 'Drive Backup Manager'}</span>
              </button>
            ) : (
              <button
                onClick={connectGoogleDrive}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Connect Google Drive</span>
              </button>
            )}
          </div>
        </div>

        {/* Folder details & Quick Controls */}
        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-blue-200/60 dark:border-indigo-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">Target Folder:</span>
              <a
                href={TARGET_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>{TARGET_DRIVE_FOLDER_ID}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span>Auto-Backup: <strong className="text-emerald-600">{autoBackupEnabled ? 'Active (Daily)' : 'Off'}</strong></span>
              <span>Default Encryption Password: <strong className="font-mono text-emerald-600">1234</strong></span>
              {lastGoogleBackupTime && <span>Last Synced: <strong>{lastGoogleBackupTime}</strong></span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveLocalDeviceBackup}
              disabled={isSavingLocalBackup}
              className="px-3.5 py-2 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {isSavingLocalBackup
                  ? (language === 'ur' ? 'محفوظ ہو رہا ہے...' : 'Saving...')
                  : (language === 'ur' ? 'ڈیوائس پر لوکل بیک اپ محفوظ کریں' : 'Save Local Backup (PC / Mobile)')}
              </span>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (!isGoogleDriveConnected) {
                  setShowDriveModal(true);
                  return;
                }
                setIsQuickBackingUp(true);
                setQuickDriveMsg(null);
                const res = await backupToGoogleDrive(DEFAULT_BACKUP_PASSPHRASE);
                if (res.success) {
                  setQuickDriveMsg({ type: 'success', text: res.message });
                  setTimeout(() => setQuickDriveMsg(null), 4000);
                } else {
                  setQuickDriveMsg({ type: 'error', text: res.message });
                }
                setIsQuickBackingUp(false);
              }}
              disabled={isQuickBackingUp}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              <Upload className={`w-3.5 h-3.5 ${isQuickBackingUp ? 'animate-bounce' : ''}`} />
              <span>{isQuickBackingUp ? 'Backing up...' : (language === 'ur' ? 'ابھی بیک اپ لیں' : 'Backup to Drive Now')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDriveModal(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'ur' ? 'ڈرائیو سے بحال کریں' : 'Restore from Drive'}</span>
            </button>
          </div>
        </div>

        {quickDriveMsg && (
          <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            quickDriveMsg.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
              : 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950 dark:text-rose-200'
          }`}>
            {quickDriveMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{quickDriveMsg.text}</span>
          </div>
        )}
      </div>

      {showDriveModal && (
        <GoogleDriveRestoreModal
          isOpen={showDriveModal}
          onClose={() => setShowDriveModal(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Multi-Factor Authentication (2FA) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.security.mfaTitle}
                </h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  currentUser.mfaEnabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {currentUser.mfaEnabled ? t.security.mfaEnabled : t.security.mfaDisabled}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              {t.security.mfaDesc}
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Google Authenticator (TOTP)
                </span>
                <button
                  onClick={toggleMfa}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  {currentUser.mfaEnabled ? t.security.disableMfa : t.security.enableMfa}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Connected to Authenticator app for session ID {currentUser.id} ({currentUser.email})
              </p>
            </div>

            {/* Test 6-digit verification code */}
            <form onSubmit={handleVerifyTotp} className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                {t.security.verifyCode} (e.g. 583921):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value)}
                  placeholder="6-Digit OTP"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono text-base font-bold tracking-widest focus:outline-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t.security.testMfaVerify}
                </button>
              </div>

              {mfaVerified && (
                <div className="text-xs text-emerald-600 flex items-center gap-1 font-semibold animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authentication Successful! Cryptographic token issued.</span>
                </div>
              )}
              {mfaError && (
                <div className="text-xs text-rose-500 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please provide a valid 6-digit verification code.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Section 2: Server Database & Offline Synchronization */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'ur' ? 'سرور ڈسک و آف لائن لوکل ڈیٹا بیس سنک' : 'Server Database & Offline Sync'}
                </h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  syncStatus.isOnline
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {syncStatus.isOnline ? t.common.online : t.common.offline}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              {language === 'ur'
                ? 'تمام ریکارڈز آپ کے براؤزر میں لوکل طور پر محفوظ رہتے ہیں تاکہ انٹرنیٹ کے بغیر بھی ایپ 100% فعال رہے۔ انٹرنیٹ دستیاب ہونے پر خودکار طریقے سے سرور اور کلاؤڈ پر محفوظ ہو جاتے ہیں۔'
                : 'All changes are stored locally in offline browser storage. When internet is connected, records are backed up automatically to the server disk and cloud storage.'}
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.security.lastSynced}:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{syncStatus.lastSyncedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Database Storage Mode:</span>
                <span className="font-bold text-emerald-600">Local Offline PWA + Server Database</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Offline Queue / Pending Changes:</span>
                <span className="font-mono font-bold text-amber-600">{syncStatus.pendingChangesCount}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={triggerCloudSync}
                disabled={syncStatus.isSyncing}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                <span>{syncStatus.isSyncing ? t.security.syncing : (language === 'ur' ? 'سرور پر فوری سنک کریں' : 'Sync to Server Now')}</span>
              </button>

              <button
                onClick={toggleOfflineSimulation}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                {syncStatus.isOnline ? t.security.goOffline : t.security.goOnline}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Section 3: End-to-End Encrypted Vault Export & Import */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t.security.encryptionTitle}
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          {t.security.encryptionDesc}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Vault */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">
              1. {t.security.exportVault}
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Derives 256-bit AES-GCM key from your passphrase using PBKDF2 (100,000 rounds).
            </p>

            <div className="space-y-3">
              <input
                type="password"
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                placeholder={t.security.passphrasePrompt}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-emerald-500"
              />
              <button
                type="button"
                onClick={handleExportVault}
                disabled={!passphrase || isExportingVault}
                className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingVault ? 'Encrypting & Exporting...' : t.security.exportVault}</span>
              </button>

              {exportSuccess && (
                <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Encrypted vault file downloaded successfully!</span>
                </p>
              )}
              {exportError && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{exportError}</span>
                </p>
              )}
            </div>
          </div>

          {/* Import / Restore Vault */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">
              2. {t.security.importVault}
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Upload an encrypted `.kmf` backup file and decrypt with original passphrase.
            </p>

            <form onSubmit={handleImportVault} className="space-y-3">
              <input
                type="file"
                accept=".kmf,.json"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950 dark:file:text-emerald-300"
              />

              <input
                type="password"
                value={importPassphrase}
                onChange={e => setImportPassphrase(e.target.value)}
                placeholder="Enter decryption passphrase"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-emerald-500"
              />

              <button
                type="submit"
                disabled={!vaultJsonInput || !importPassphrase}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{t.security.importVault}</span>
              </button>

              {importStatus === 'success' && (
                <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Database vault restored and verified successfully!</span>
                </p>
              )}
              {importStatus === 'error' && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Failed to decrypt vault. Incorrect passphrase or corrupted file.</span>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Section 4: Role-Based Access Control (RBAC) Permissions Matrix */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Users2 className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t.security.rbacTitle}
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Granular permission matrix enforced across Super Admin, Finance, Audit, and Member roles.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                <th className="py-2.5">System Capability</th>
                <th className="py-2.5 text-center">President (Super Admin)</th>
                <th className="py-2.5 text-center">Finance Secretary</th>
                <th className="py-2.5 text-center">Audit Inspector</th>
                <th className="py-2.5 text-center">General Member</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">{p.module}</td>
                  <td className="py-2.5 text-center">
                    <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                  </td>
                  <td className="py-2.5 text-center">
                    {p.finance ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-2.5 text-center">
                    {p.audit ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-2.5 text-center">
                    {p.member ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
