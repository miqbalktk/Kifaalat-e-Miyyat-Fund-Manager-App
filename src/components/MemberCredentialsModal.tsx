import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MemberCredential, UserRole } from '../types';
import {
  KeyRound,
  UserPlus,
  Shield,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Copy,
  MessageCircle,
  Sparkles,
  Lock,
  Unlock,
  Check,
  Cloud,
  RefreshCw,
  Upload
} from 'lucide-react';

interface MemberCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMemberId?: string;
}

export const MemberCredentialsModal: React.FC<MemberCredentialsModalProps> = ({
  isOpen,
  onClose,
  defaultMemberId
}) => {
  const {
    members,
    userCredentials,
    createMemberCredential,
    updateMemberCredential,
    deleteMemberCredential,
    toggleDisableMemberCredential,
    language,
    t,
    isAdmin,
    triggerCloudSync,
    syncStatus,
    isGoogleDriveConnected,
    backupToGoogleDrive
  } = useApp();

  const [isSyncingServer, setIsSyncingServer] = useState(false);

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [selectedMemberId, setSelectedMemberId] = useState(defaultMemberId || members[0]?.id || '');

  useEffect(() => {
    if (isOpen && defaultMemberId) {
      setSelectedMemberId(defaultMemberId);
      setActiveTab('create');
    }
  }, [isOpen, defaultMemberId]);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState<UserRole>('member');
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('member');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedUser, setCopiedUser] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-fill username suggestion when member selection changes
  const handleSelectMember = (mId: string) => {
    setSelectedMemberId(mId);
    const mem = members.find(m => m.id === mId);
    if (mem) {
      const cleanNum = mem.membershipNumber.toLowerCase().replace(/[\s-]/g, '');
      setUsernameInput(cleanNum);
      // Default initial memorable password
      setPasswordInput(`${cleanNum}#2026`);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    const mem = members.find(m => m.id === selectedMemberId);
    if (!mem || !usernameInput.trim() || !passwordInput.trim()) {
      setFeedbackMsg({
        type: 'error',
        text: language === 'ur' ? 'براہ کرم رکن، یوزر نیم اور پاس ورڈ درج فرمائیں۔' : 'Please provide member, username, and password.'
      });
      return;
    }

    const success = await createMemberCredential({
      username: usernameInput.trim(),
      password: passwordInput.trim(),
      role: roleInput,
      memberId: mem.id,
      fullName: mem.fullName,
      fullNameUrdu: mem.fullNameUrdu || mem.fullName,
      phone: mem.phone,
      location: mem.address,
      disabled: false,
    });

    if (success) {
      setFeedbackMsg({
        type: 'success',
        text: language === 'ur'
          ? `رکن ${mem.fullName} کے لیے یوزر اور پاس ورڈ کامیابی سے بن گیا!`
          : `Credentials created successfully for ${mem.fullName}!`
      });
      setUsernameInput('');
      setPasswordInput('');
      setActiveTab('list');
    } else {
      setFeedbackMsg({
        type: 'error',
        text: language === 'ur'
          ? 'یہ یوزر نیم پہلے سے موجود ہے! براہ کرم دوسرا یوزر نیم منتخب کریں۔'
          : 'Username already exists. Please choose a different username.'
      });
    }
  };

  const handleStartEdit = (cred: MemberCredential) => {
    setEditingUsername(cred.username);
    setEditPassword(cred.password);
    setEditRole(cred.role);
  };

  const handleSaveEdit = async (username: string) => {
    if (!editPassword.trim()) return;
    await updateMemberCredential(username, {
      password: editPassword.trim(),
      role: editRole,
    });
    setEditingUsername(null);
    setFeedbackMsg({
      type: 'success',
      text: language === 'ur' ? 'کریڈینشلز کامیابی سے اپڈیٹ ہو گئیں!' : 'Credentials updated successfully!'
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleDelete = async (username: string) => {
    const confirmText = language === 'ur'
      ? `کیا آپ واقعی یوزر '${username}' کو حذف کرنا چاہتے ہیں؟`
      : `Are you sure you want to delete username '${username}'?`;
    if (window.confirm(confirmText)) {
      await deleteMemberCredential(username);
      setFeedbackMsg({
        type: 'success',
        text: language === 'ur' ? 'یوزر کامیابی سے حذف کر دیا گیا!' : 'User credentials deleted!'
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleToggleDisable = async (username: string) => {
    await toggleDisableMemberCredential(username);
  };

  const handleCopyCredentials = (cred: MemberCredential) => {
    const text = `کفالتِ میت فنڈ ویلفیئر سوسائٹی\nپورٹل لاگ ان معلومات برائے: ${cred.fullName}\nیوزر نیم: ${cred.username}\nپاس ورڈ: ${cred.password}\nکردار: ${cred.role === 'super_admin' ? 'Admin' : cred.role === 'finance_secretary' ? 'Khazanchi' : 'Member'}\nپورٹل لنک: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedUser(cred.username);
    setTimeout(() => setCopiedUser(null), 2500);
  };

  const handleShareWhatsApp = (cred: MemberCredential) => {
    const text = encodeURIComponent(
      `السلام علیکم ${cred.fullName} صاحب!\nکفالتِ میت فنڈ پورٹل کے لیے آپ کا لاگ ان درج ذیل ہے:\nیوزر نیم: ${cred.username}\nپاس ورڈ: ${cred.password}\nاختیارات: ${cred.role === 'super_admin' ? 'Admin' : cred.role === 'finance_secretary' ? 'Khazanchi' : 'Member (صرف مطالعہ)'}\nویب سائٹ: ${window.location.origin}`
    );
    const cleanPhone = cred.phone.replace(/[^0-9]/g, '');
    const phoneParam = cleanPhone.startsWith('0') ? `92${cleanPhone.slice(1)}` : cleanPhone;
    window.open(`https://wa.me/${phoneParam}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004d30] text-white">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base font-urdu">
                {language === 'ur' ? 'اراکین یوزر نیم و پاس ورڈ مینجر (ایڈمن)' : 'Member Credentials & Rights Manager'}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {language === 'ur'
                  ? 'اراکین کے لیے یوزر اور پاس ورڈ بنائیں، حقوق تفویض کریں، تبدیل یا غیر فعال کریں'
                  : 'Create, modify, assign rights, disable, or delete member logins'}
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

        {/* Tab Controls */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-6 pt-3 text-xs">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 px-4 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'list'
                ? 'border-[#004d30] text-[#004d30] dark:border-emerald-400 dark:text-emerald-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>{language === 'ur' ? `تمام اکاؤنٹس کی فہرست (${userCredentials.length})` : `All User Accounts (${userCredentials.length})`}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('create');
              if (!usernameInput && selectedMemberId) handleSelectMember(selectedMemberId);
            }}
            className={`pb-3 px-4 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'create'
                ? 'border-[#004d30] text-[#004d30] dark:border-emerald-400 dark:text-emerald-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'ur' ? 'نیا لاگ ان بنائیں (Create Member Login)' : 'Create Member Login'}</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className={`mx-6 mt-4 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
          }`}>
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Tab 1: List of All User Credentials */}
        {activeTab === 'list' && (
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Server & Cloud Sync Status Notice */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {language === 'ur'
                    ? `تمام ${userCredentials.length} اکاؤنٹس سرور اور کلاؤڈ پر محفوظ ہیں۔`
                    : `All ${userCredentials.length} credentials synced with server & persistent store.`}
                </span>
              </div>
              <button
                onClick={async () => {
                  setIsSyncingServer(true);
                  await triggerCloudSync();
                  setIsSyncingServer(false);
                }}
                disabled={isSyncingServer}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingServer ? 'animate-spin' : ''}`} />
                <span>{isSyncingServer ? 'Syncing...' : (language === 'ur' ? 'سرور پر فوری سنک کریں' : 'Sync to Server')}</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>
                {language === 'ur'
                  ? 'اراکین صرف ایڈمن کے جاری کردہ یوزر نیم اور پاس ورڈ سے لاگ ان ہو سکتے ہیں۔'
                  : 'Members authenticate using these Admin-provisioned credentials.'}
              </span>
              <button
                onClick={() => {
                  setActiveTab('create');
                  if (!usernameInput && selectedMemberId) handleSelectMember(selectedMemberId);
                }}
                className="inline-flex items-center gap-1 text-[#004d30] dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? '+ نیا یوزر بنائیں' : '+ Add User'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {userCredentials.map(cred => {
                const isEditing = editingUsername === cred.username;
                const isShown = showPasswordMap[cred.username] || false;
                const isMainAdmin = cred.username === 'admin';

                return (
                  <div
                    key={cred.username}
                    className={`p-4 rounded-2xl border transition-all ${
                      cred.disabled
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                        : 'bg-white dark:bg-slate-900 border-emerald-500/30 dark:border-emerald-800 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white font-urdu">
                            {cred.fullName}
                          </span>
                          {/* Role Badge */}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cred.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : cred.role === 'finance_secretary'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {cred.role === 'super_admin'
                              ? 'Super Admin'
                              : cred.role === 'finance_secretary'
                              ? 'Khazanchi / Editor'
                              : 'Member (View-Only)'}
                          </span>

                          {/* Status Pill */}
                          {cred.disabled ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                              معطل (Disabled)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              فعال (Active)
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                          <span>
                            <strong>Username:</strong> <code className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{cred.username}</code>
                          </span>
                          <span>
                            <strong>Password:</strong>{' '}
                            <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {isShown ? cred.password : '••••••••'}
                            </code>
                            <button
                              type="button"
                              onClick={() => setShowPasswordMap(prev => ({ ...prev, [cred.username]: !isShown }))}
                              className="ml-1.5 text-slate-400 hover:text-slate-600 inline-block align-middle cursor-pointer"
                              title={isShown ? 'Hide' : 'Show'}
                            >
                              {isShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </span>
                          {cred.phone && (
                            <span>
                              <strong>Phone:</strong> {cred.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons for this Credential */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyCredentials(cred)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                          title="Copy Login Details"
                        >
                          {copiedUser === cred.username ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>

                        {/* WhatsApp Send button */}
                        <button
                          onClick={() => handleShareWhatsApp(cred)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-pointer transition-colors"
                          title="Send to Member via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* Disable/Enable Toggle (protected for main admin) */}
                        {!isMainAdmin && (
                          <button
                            onClick={() => handleToggleDisable(cred.username)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                              cred.disabled
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                            }`}
                            title={cred.disabled ? 'Re-enable Account' : 'Disable Account'}
                          >
                            {cred.disabled ? <Unlock className="w-4 h-4 text-amber-700" /> : <Lock className="w-4 h-4 text-slate-600" />}
                          </button>
                        )}

                        {/* Edit button */}
                        <button
                          onClick={() => isEditing ? setEditingUsername(null) : handleStartEdit(cred)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 cursor-pointer transition-colors"
                          title="Edit Password & Rights"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete button (protected for main admin) */}
                        {!isMainAdmin && (
                          <button
                            onClick={() => handleDelete(cred.username)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 cursor-pointer transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Edit Form */}
                    {isEditing && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-3 animate-fadeIn">
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-100">
                          {language === 'ur' ? `ترمیم کریڈینشلز: ${cred.username}` : `Modify Credentials for ${cred.username}`}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              {language === 'ur' ? 'نیا پاس ورڈ:' : 'New Password:'}
                            </label>
                            <input
                              type="text"
                              value={editPassword}
                              onChange={e => setEditPassword(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              {language === 'ur' ? 'اختیارات / کردار:' : 'Assigned Rights / Role:'}
                            </label>
                            <select
                              value={editRole}
                              onChange={e => setEditRole(e.target.value as UserRole)}
                              disabled={isMainAdmin}
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                            >
                              <option value="member">Member (صرف مطالعہ ممبر موڈ)</option>
                              <option value="finance_secretary">Khazanchi (خزانچی - فیس و رسید اندراج)</option>
                              <option value="audit_inspector">Audit Inspector (آڈٹ و معائنہ کار)</option>
                              <option value="super_admin">Super Admin (مکمل کنٹرول)</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingUsername(null)}
                            className="px-3 py-1 text-xs rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(cred.username)}
                            className="px-4 py-1 text-xs font-bold rounded-lg bg-[#004d30] hover:bg-[#023e27] text-white cursor-pointer"
                          >
                            {language === 'ur' ? 'تبدیلی محفوظ کریں' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Create New Login Form */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
            {/* Member Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ur' ? 'رکن منتخب فرمائیں:' : 'Select Member:'}
              </label>
              <select
                value={selectedMemberId}
                onChange={e => handleSelectMember(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.membershipNumber} - {m.fullName} ({m.phone}) - {m.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ur' ? 'یوزر نیم (Username):' : 'Username:'}
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  placeholder="e.g. kmf1001 or phone"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-mono text-xs font-bold"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {language === 'ur' ? 'رکن پورٹل میں داخل ہونے کے لیے یہ یوزر درج کرے گا۔' : 'Member will type this username to sign in.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ur' ? 'پاس ورڈ (Password):' : 'Password:'}
                </label>
                <input
                  type="text"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="e.g. secret#2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-mono text-xs font-bold"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {language === 'ur' ? 'آسان اور محفوظ پاس ورڈ رکھیں جو رکن کو دیا جا سکے۔' : 'Set password to share with this member.'}
                </p>
              </div>
            </div>

            {/* Role / Rights Assignment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'ur' ? 'تفویض کردہ حقوق و کردار (Assigned Rights & Role):' : 'Assigned Role & Rights:'}
              </label>
              <select
                value={roleInput}
                onChange={e => setRoleInput(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                <option value="member">
                  {language === 'ur' ? 'Member: صرف مطالعہ ممبر موڈ (رسیدیں و کھاتہ ملاحظہ)' : 'Member: View-only access (receipts & ledger)'}
                </option>
                <option value="finance_secretary">
                  {language === 'ur' ? 'Khazanchi: خزانچی (فیس وصولی، کلیمز اور رسیدوں کا مکمل اندراج)' : 'Treasurer / Khazanchi: Full Financial Editing Rights'}
                </option>
                <option value="audit_inspector">
                  {language === 'ur' ? 'Audit: آڈٹ و انسپکشن انسپکٹر (مالیاتی جانچ و تصدیق)' : 'Audit Inspector: Inspection & Reports Access'}
                </option>
                <option value="super_admin">
                  {language === 'ur' ? 'Super Admin: مکمل ایڈمن اختیارات' : 'Super Admin: Full Administrative Privileges'}
                </option>
              </select>
            </div>

            {/* Submit & Cancel */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {language === 'ur' ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-amber-300" />
                <span>{language === 'ur' ? 'یوزر نیم اور پاس ورڈ بنائیں' : 'Create Login Credentials'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
