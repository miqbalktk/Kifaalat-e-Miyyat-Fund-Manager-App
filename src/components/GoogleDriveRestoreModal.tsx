import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  listBackupsFromDrive,
  DriveBackupFile,
  TARGET_DRIVE_FOLDER_ID,
  TARGET_DRIVE_FOLDER_URL,
  DEFAULT_BACKUP_PASSPHRASE
} from '../services/googleDriveService';
import {
  Cloud,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  Lock,
  Calendar,
  HardDrive,
  FileCheck
} from 'lucide-react';

interface GoogleDriveRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveRestoreModal: React.FC<GoogleDriveRestoreModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    language,
    isGoogleDriveConnected,
    googleUserEmail,
    connectGoogleDrive,
    disconnectGoogleDrive,
    backupToGoogleDrive,
    restoreFromGoogleDrive,
    lastGoogleBackupTime,
    autoBackupEnabled,
    setAutoBackupEnabled
  } = useApp();

  const [files, setFiles] = useState<DriveBackupFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupMsg, setBackupMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Restore confirmation states (required user confirmation for destructive restore operation)
  const [selectedFileToRestore, setSelectedFileToRestore] = useState<DriveBackupFile | null>(null);
  const [passphraseInput, setPassphraseInput] = useState<string>(DEFAULT_BACKUP_PASSPHRASE);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchFiles = async () => {
    if (!isGoogleDriveConnected) return;
    setIsLoadingFiles(true);
    setBackupMsg(null);
    try {
      const list = await listBackupsFromDrive();
      setFiles(list);
    } catch (err: any) {
      console.warn('Failed to list backups:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (isOpen && isGoogleDriveConnected) {
      fetchFiles();
    }
  }, [isOpen, isGoogleDriveConnected]);

  if (!isOpen) return null;

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    setBackupMsg(null);
    const res = await backupToGoogleDrive(passphraseInput || DEFAULT_BACKUP_PASSPHRASE);
    if (res.success) {
      setBackupMsg({ type: 'success', text: res.message });
      await fetchFiles();
    } else {
      setBackupMsg({ type: 'error', text: res.message });
    }
    setIsBackingUp(false);
  };

  const handleConfirmRestore = async () => {
    if (!selectedFileToRestore) return;
    setIsRestoring(true);
    setRestoreResult(null);

    const res = await restoreFromGoogleDrive(
      selectedFileToRestore.id,
      passphraseInput || DEFAULT_BACKUP_PASSPHRASE
    );

    if (res.success) {
      setRestoreResult({
        type: 'success',
        text: language === 'ur'
          ? 'گوگل ڈرائیو بیک اپ کامیابی سے بحال کر دیا گیا۔ تمام اراکین اور پاس ورڈز اب فعال ہیں۔'
          : 'Database restored successfully from Google Drive! All members and passwords are now active.'
      });
      setTimeout(() => {
        setSelectedFileToRestore(null);
      }, 2000);
    } else {
      setRestoreResult({
        type: 'error',
        text: res.message
      });
    }
    setIsRestoring(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-[#004d30] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Cloud className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-urdu leading-tight">
                {language === 'ur' ? 'گوگل ڈرائیو آٹو بیک اپ و بحالی' : 'Google Drive Auto-Backup & Cross-Device Restore'}
              </h3>
              <p className="text-xs text-emerald-100">
                {language === 'ur'
                  ? 'روزانہ خودکار بیک اپ اور کسی بھی موبائل یا کمپیوٹر پر ڈیٹا کی بحالی'
                  : 'Daily auto-backup & restore latest changes across any PC or mobile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-emerald-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-100 text-xs">
          
          {/* Connection Status Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isGoogleDriveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-bold text-sm">
                  {isGoogleDriveConnected
                    ? (language === 'ur' ? 'گوگل اکاؤنٹ منسلک ہے' : 'Google Drive Connected')
                    : (language === 'ur' ? 'گوگل اکاؤنٹ منسلک نہیں ہے' : 'Google Account Not Connected')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {isGoogleDriveConnected
                  ? (googleUserEmail ? `${googleUserEmail}` : 'Connected')
                  : (language === 'ur' ? 'بیک اپ اور بحالی کے لیے گوگل اکاؤنٹ لاگ ان فرمائیں۔' : 'Sign in with Google to enable automatic daily backups and restore on any device.')}
              </p>
            </div>

            {isGoogleDriveConnected ? (
              <button
                onClick={disconnectGoogleDrive}
                className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                {language === 'ur' ? 'ڈس کنیکٹ کریں' : 'Disconnect'}
              </button>
            ) : (
              <button
                onClick={connectGoogleDrive}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>

          {/* Drive Target Folder Link & Settings */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                {language === 'ur' ? 'مخصوص گوگل ڈرائیو فولڈر (Google Drive Target Folder)' : 'Configured Google Drive Backup Folder'}
              </span>
              <a
                href={TARGET_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{language === 'ur' ? 'ڈرائیو میں کھولیں' : 'Open in Drive'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/60 text-slate-600 dark:text-slate-300 break-all select-all">
              Folder ID: {TARGET_DRIVE_FOLDER_ID}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <span className="text-[11px] font-semibold">
                  {language === 'ur' ? 'روزانہ خودکار بیک اپ:' : 'Daily Auto-Backup:'}
                </span>
                <button
                  onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                    autoBackupEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {autoBackupEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <span className="text-[11px] font-semibold">
                  {language === 'ur' ? 'ڈیفالٹ پاس ورڈ:' : 'Default Passphrase:'}
                </span>
                <span className="font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  {DEFAULT_BACKUP_PASSPHRASE}
                </span>
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleManualBackup}
              disabled={!isGoogleDriveConnected || isBackingUp}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              {isBackingUp ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{isBackingUp ? 'Uploading...' : (language === 'ur' ? 'گوگل ڈرائیو پر نیا بیک اپ بنائیں' : 'Backup to Google Drive Now')}</span>
            </button>

            <button
              onClick={fetchFiles}
              disabled={!isGoogleDriveConnected || isLoadingFiles}
              className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              <span>{language === 'ur' ? 'فہرست تازہ کریں' : 'Refresh Backups'}</span>
            </button>
          </div>

          {backupMsg && (
            <div className={`p-3 rounded-xl flex items-center gap-2 font-semibold ${
              backupMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-200'
            }`}>
              {backupMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{backupMsg.text}</span>
            </div>
          )}

          {/* List of Backups in Google Drive */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                {language === 'ur' ? `دستیاب بیک اپ فائلز (${files.length})` : `Available Backups in Google Drive (${files.length})`}
              </h4>
              {lastGoogleBackupTime && (
                <span className="text-[10px] text-slate-400">
                  Last Backup: {lastGoogleBackupTime}
                </span>
              )}
            </div>

            {isLoadingFiles ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                <span>Checking Google Drive folder...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500 space-y-2">
                <HardDrive className="w-8 h-8 mx-auto text-slate-400" />
                <p>
                  {isGoogleDriveConnected
                    ? (language === 'ur' ? 'اس فولڈر میں فی الوقت کوئی بیک اپ موجود نہیں ہے۔ اوپر دیے گئے بٹن سے نیا بیک اپ بنائیں۔' : 'No backup files found yet in the designated folder. Click "Backup to Google Drive Now" to create your first backup.')
                    : (language === 'ur' ? 'بیک اپ فائلز دیکھنے کے لیے اوپر گوگل سے لاگ ان فرمائیں۔' : 'Please sign in with Google above to view backups.')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                {files.map(file => (
                  <div key={file.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-3">
                        <span>{new Date(file.createdTime).toLocaleString()}</span>
                        {file.size && <span>{(parseInt(file.size, 10) / 1024).toFixed(1)} KB</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFileToRestore(file);
                        setRestoreResult(null);
                        setPassphraseInput(DEFAULT_BACKUP_PASSPHRASE);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{language === 'ur' ? 'بحال کریں (Restore)' : 'Restore'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Confirmation Dialog for Destructive Restore Operation (MANDATORY per Workspace Skill) */}
          {selectedFileToRestore && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-600 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  {language === 'ur' ? 'کیا آپ اس بیک اپ سے ڈیٹا بحال کرنا چاہتے ہیں؟' : 'Confirm Database Restore from Google Drive?'}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                {language === 'ur'
                  ? `یہ عمل آپ کے موجودہ لوکل ریکارڈز کو فائل "${selectedFileToRestore.name}" کے بیک اپ سے بدل دے گا۔ تمام اراکین، ادائیگیاں اور پاس ورڈز بحال ہو جائیں گے۔`
                  : `This action will replace your active database with snapshot "${selectedFileToRestore.name}". All members, contributions, claims, and credentials will be synchronized.`}
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ur' ? 'ڈکرپشن پاس ورڈ (Decryption Password):' : 'Decryption Password:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={passphraseInput}
                    onChange={e => setPassphraseInput(e.target.value)}
                    placeholder="Enter password (default: 1234)"
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs focus:outline-emerald-500 font-bold"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Default: <span className="font-mono font-bold text-emerald-600">1234</span>
                </p>
              </div>

              {restoreResult && (
                <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  restoreResult.type === 'success'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  {restoreResult.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{restoreResult.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setSelectedFileToRestore(null)}
                  disabled={isRestoring}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  {language === 'ur' ? 'منسوخ کریں (Cancel)' : 'Cancel'}
                </button>
                <button
                  onClick={handleConfirmRestore}
                  disabled={isRestoring || !passphraseInput}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isRestoring ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{isRestoring ? 'Restoring...' : (language === 'ur' ? 'ہاں، بحال کریں (Confirm & Restore)' : 'Confirm & Restore')}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-bit AES-GCM Encrypted | Secure Cloud Protection</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            {language === 'ur' ? 'بند کریں' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
