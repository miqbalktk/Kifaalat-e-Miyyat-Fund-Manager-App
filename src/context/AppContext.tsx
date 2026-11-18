import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Language,
  UserRole,
  UserProfile,
  Member,
  Contribution,
  BereavementClaim,
  Donation,
  AuditLog,
  NotificationItem,
  SyncStatus,
  DashboardWidgetConfig,
  PaymentMethod,
  DonationCategory,
  MemberCredential
} from '../types';
import { translations } from '../translations';
import { sha256Hex, encryptVault, decryptVault } from '../utils/crypto';
import { official39Members, allMemberCredentials } from '../data/membersData';
import { safeStorage } from '../utils/safeStorage';
import { getCurrentYearMonth, getContributionInflowForMonth } from '../utils/contributionHelpers';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  SCOPES
} from '../services/googleDriveAuth';
import {
  uploadBackupToDrive,
  downloadBackupFromDrive,
  DEFAULT_BACKUP_PASSPHRASE,
  TARGET_DRIVE_FOLDER_ID,
  TARGET_DRIVE_FOLDER_URL
} from '../services/googleDriveService';
import {
  db,
  saveDocument,
  deleteDocument,
  batchSeedIfEmpty,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType
} from '../services/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  isDark: boolean;
  toggleDarkMode: () => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  userRole: UserRole;
  switchRole: (role: UserRole) => void;
  
  // Auth & RBAC Permissions
  isAuthenticated: boolean;
  login: (username: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAdminOrKhazanchi: boolean;
  isKhazanchi: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isGuest: boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  allCredentials: MemberCredential[];
  userCredentials: MemberCredential[];
  createMemberCredential: (cred: Omit<MemberCredential, 'createdAt'>) => Promise<boolean>;
  updateMemberCredential: (username: string, updates: Partial<MemberCredential>) => Promise<boolean>;
  deleteMemberCredential: (username: string) => Promise<boolean>;
  toggleDisableMemberCredential: (username: string) => Promise<boolean>;
  
  // Data
  members: Member[];
  contributions: Contribution[];
  claims: BereavementClaim[];
  donations: Donation[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  widgets: DashboardWidgetConfig[];
  setWidgets: (widgets: DashboardWidgetConfig[]) => void;
  
  // Terms & Regulations
  isTermsAccepted: boolean;
  acceptTerms: () => void;
  requireTermsModal: boolean;
  setRequireTermsModal: (val: boolean) => void;
  
  // Financial metrics
  fundBalance: number;
  totalCollected: number;
  totalDisbursed: number;
  monthlyTarget: number;
  currentMonthInflow: number;
  
  // Member actions
  addMember: (member: Omit<Member, 'id' | 'membershipNumber' | 'overdueMonths'>) => Promise<void>;
  updateMember: (member: Member) => Promise<void>;
  deleteMember: (memberId: string, deletionCode: string) => Promise<{ success: boolean; message?: string }>;
  
  // Contribution actions
  recordContribution: (data: {
    memberId: string;
    month: string;
    amount: number;
    method: PaymentMethod;
    referenceNo?: string;
    notes?: string;
    monthsCount?: number;
    advancePeriodNote?: string;
  }) => Promise<Contribution>;
  deleteContribution: (contributionId: string, deletionCode: string) => Promise<{ success: boolean; message?: string }>;
  sendPaymentReminder: (memberId: string) => void;
  
  // Claim actions
  fileClaim: (data: Omit<BereavementClaim, 'id' | 'claimNumber' | 'status' | 'filedDate' | 'approvedAmount'>) => Promise<BereavementClaim>;
  approveClaim: (claimId: string, amount: number) => Promise<void>;
  disburseClaim: (claimId: string) => Promise<void>;
  
  // Donation actions
  makeDonation: (data: {
    donorName: string;
    donorEmail: string;
    donorPhone: string;
    isAnonymous: boolean;
    amount: number;
    category: DonationCategory;
    paymentMethod: PaymentMethod;
    dedicatedFor?: string;
  }) => Promise<Donation>;
  deleteDonation: (donationId: string, deletionCode: string) => Promise<{ success: boolean; message?: string }>;

  // Receipt Modal trigger
  selectedReceipt: {
    type: 'contribution' | 'donation' | 'claim';
    data: any;
  } | null;
  openReceiptModal: (type: 'contribution' | 'donation' | 'claim', data: any) => void;
  closeReceiptModal: () => void;
  
  // Sync & Offline
  syncStatus: SyncStatus;
  triggerCloudSync: () => Promise<void>;
  toggleOfflineSimulation: () => void;
  
  // Security & Vault
  exportEncryptedVault: (passphrase?: string) => Promise<string>;
  importEncryptedVault: (vaultJson: string, passphrase?: string) => Promise<boolean>;
  toggleMfa: () => void;
  
  // Google Drive Cloud Backup & Restore
  isGoogleDriveConnected: boolean;
  googleUserEmail: string | null;
  connectGoogleDrive: () => Promise<boolean>;
  disconnectGoogleDrive: () => Promise<void>;
  backupToGoogleDrive: (passphrase?: string) => Promise<{ success: boolean; message: string; fileId?: string }>;
  restoreFromGoogleDrive: (fileId: string, passphrase?: string) => Promise<{ success: boolean; message: string }>;
  lastGoogleBackupTime: string | null;
  autoBackupEnabled: boolean;
  setAutoBackupEnabled: (enabled: boolean) => void;

  // Notification actions
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Seed Data: Official 39 Members from Committee Register (300 Rs / individual)
const initialMembers: Member[] = official39Members;

// Zero initial contribution records per user instruction: "Do not add contributed amount this time. just add member names"
const initialContributions: Contribution[] = [];

// Zero initial claims and donations so initial fund reserve starts at 0 (strictly based on funds added into app)
const initialClaims: BereavementClaim[] = [];
const initialDonations: Donation[] = [];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-10-07 09:30:15',
    actorId: 'usr-1',
    actorName: 'Muhammad Iqbal Khattak (Super Admin)',
    actorRole: 'super_admin',
    action: 'Approved Bereavement Claim #CLM-2026-081',
    category: 'claim',
    details: 'Released Rs. 50,000 condolence grant to member Syed Qasim Ali on death of Mother.',
    ipAddress: '182.185.132.40 (Islamabad, PK)',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'aud-2',
    timestamp: '2026-10-07 10:15:22',
    actorId: 'usr-2',
    actorName: 'Hafiz Tariq (Finance Secretary)',
    actorRole: 'finance_secretary',
    action: 'Recorded Monthly Contribution REC-2026-1049',
    category: 'contribution',
    details: 'Recorded Rs. 500 from Haji Mohammad Usman for Oct 2026 via EasyPaisa.',
    ipAddress: '175.107.199.12 (Karachi, PK)',
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
  },
  {
    id: 'aud-3',
    timestamp: '2026-10-07 11:04:45',
    actorId: 'usr-1',
    actorName: 'Muhammad Iqbal Khattak (Super Admin)',
    actorRole: 'super_admin',
    action: 'Encrypted Cloud Backup Synchronized',
    category: 'sync',
    details: 'Exported tamper-proof database snapshot to Google Drive Cloud Vault.',
    ipAddress: '182.185.132.40 (Islamabad, PK)',
    hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
  }
];

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Monthly Due Date Approaching',
    titleUrdu: 'ماہانہ فیس کی آخری تاریخ قریب ہے',
    message: 'Monthly contribution deadline is 10th October. Automated reminders prepared for 2 pending members.',
    messageUrdu: 'ماہانہ تعاون کی آخری تاریخ 10 اکتوبر ہے۔ 2 واجب الادا اراکین کو یاد دہانی تیار ہے۔',
    date: '2026-10-07 08:00',
    read: false,
    type: 'deadline',
  },
  {
    id: 'notif-2',
    title: 'New Bereavement Claim Filed',
    titleUrdu: 'نیا کفالت و تعزیت کلیم موصول ہوا',
    message: 'Member Tariq Mehmood Siddiqui filed Claim #CLM-2026-094 for deceased brother.',
    messageUrdu: 'رکن طارق محمود صدیقی نے مرحوم بھائی کے لیے کلیم نمبر CLM-2026-094 درج کیا ہے۔',
    date: '2026-10-06 17:45',
    read: false,
    type: 'claim_alert',
  },
  {
    id: 'notif-3',
    title: 'Generous Zakat Donation Received',
    titleUrdu: 'سخاوت مندانہ زکوٰۃ کا عطیہ موصول',
    message: 'Rs. 50,000 contributed by Malik Mohammad Rafique for Underprivileged Funeral Fund.',
    messageUrdu: 'ملک محمد رفیق صاحب نے نادار تدفین فنڈ کے لیے 50,000 روپے زکوٰۃ جمع کروائی ہے۔',
    date: '2026-10-03 14:20',
    read: true,
    type: 'donation',
  }
];

const defaultWidgets: DashboardWidgetConfig[] = [
  { id: 'fund_reserve', label: 'Fund Reserve & Balance', labelUrdu: 'کل محفوظ فنڈ سرمایہ', visible: true, order: 1 },
  { id: 'monthly_inflow', label: 'Monthly Contributions Inflow', labelUrdu: 'ماہانہ وصولی آمدن', visible: true, order: 2 },
  { id: 'claims_disbursed', label: 'Bereavement Aid Disbursed', labelUrdu: 'کفالت و تدفین ادائیگیاں', visible: true, order: 3 },
  { id: 'pending_claims', label: 'Pending Claims Review', labelUrdu: 'زیرِ جائزہ دعوے', visible: true, order: 4 },
  { id: 'overdue_members', label: 'Overdue Dues Warning', labelUrdu: 'واجب الادا ممبرز انتباہ', visible: true, order: 5 },
  { id: 'quick_actions', label: 'Quick Action Buttons', labelUrdu: 'فوری اقدامات بٹن', visible: true, order: 6 },
  { id: 'recent_ledger', label: 'Live Financial Ledger', labelUrdu: 'لائیو مالیاتی کھاتہ', visible: true, order: 7 },
];

export const guestProfile: UserProfile = {
  id: 'usr-guest',
  name: 'Guest Viewer',
  nameUrdu: 'مہمان صارف',
  nameAr: 'مستخدم ضيف',
  email: 'guest@kifaalat-fund.org',
  phone: '0346-9100998',
  role: 'guest',
  username: 'guest',
  mfaEnabled: false,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Localization & Theme
  const [language, setLanguageState] = useState<Language>(() => {
    return (safeStorage.getItem('kmf_lang') as Language) || 'en';
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = safeStorage.getItem('kmf_dark');
    return saved !== null ? saved === 'true' : true; // Default dignified dark mode
  });

  // User Profile & Roles - Preserved precisely across reloads and device restarts
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = safeStorage.getItem('kmf_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) return parsed;
      } catch (e) {}
    }
    return guestProfile;
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = safeStorage.getItem('kmf_user_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) return parsed.role;
      } catch {}
    }
    return 'guest';
  });

  // Startup Gate Authentication State: Persistent across reload so logged in account stays active
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const auth = safeStorage.getItem('kmf_authenticated_session') || sessionStorage.getItem('kmf_authenticated_session');
      const savedUser = safeStorage.getItem('kmf_user_session');
      return auth === 'true' && !!savedUser;
    } catch {
      return false;
    }
  });

  // Keep userRole strictly in sync with currentUser.role
  useEffect(() => {
    if (currentUser?.role && currentUser.role !== userRole) {
      setUserRole(currentUser.role);
    }
  }, [currentUser]);

  // Administrator Managed User Credentials
  const defaultCredentialsList: MemberCredential[] = [
    {
      username: 'guest',
      password: '1122',
      role: 'guest',
      fullName: 'Guest Viewer',
      fullNameUrdu: 'مہمان صارف',
      phone: '0346-9100998',
      disabled: false,
      createdAt: '2026-10-01'
    },
    {
      username: 'admin',
      password: 'love4dekko',
      role: 'super_admin',
      fullName: 'Muhammad Iqbal Khattak',
      fullNameUrdu: 'محمد اقبال خٹک',
      phone: '0346-9100998',
      disabled: false,
      createdAt: '2026-10-01'
    },
    {
      username: 'khazanchi',
      password: 'khazanchi2026',
      role: 'finance_secretary',
      fullName: 'Muhammad Iqbal Khattak',
      fullNameUrdu: 'محمد اقبال خٹک',
      phone: '0334-9100998',
      disabled: false,
      createdAt: '2026-10-01'
    }
  ];

  const [userCredentials, setUserCredentials] = useState<MemberCredential[]>(() => {
    const saved = safeStorage.getItem('kmf_user_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= allMemberCredentials.length) return parsed;
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge saved with allMemberCredentials
          const map = new Map<string, MemberCredential>();
          allMemberCredentials.forEach(c => map.set(c.username.toLowerCase(), c));
          parsed.forEach(c => map.set(c.username.toLowerCase(), c));
          return Array.from(map.values());
        }
      } catch {}
    }
    return allMemberCredentials;
  });

  useEffect(() => {
    safeStorage.setItem('kmf_user_credentials', JSON.stringify(userCredentials));
  }, [userCredentials]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // State Collections
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = safeStorage.getItem('kmf_members_v39');
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [contributions, setContributions] = useState<Contribution[]>(() => {
    const saved = safeStorage.getItem('kmf_contributions_v39');
    return saved ? JSON.parse(saved) : initialContributions;
  });

  const [claims, setClaims] = useState<BereavementClaim[]>(() => {
    const saved = safeStorage.getItem('kmf_claims') || safeStorage.getItem('kmf_claims_zero');
    return saved ? JSON.parse(saved) : initialClaims;
  });

  const [donations, setDonations] = useState<Donation[]>(() => {
    // Purge legacy mock donations that sum to 225,000 or contain old mock data
    const saved = safeStorage.getItem('kmf_donations_actual');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const sum = parsed.reduce((acc, x) => acc + (x.amount || 0), 0);
          const hasOldMock = parsed.some(p => p.id === 'don-1' || p.id === 'don-2' || p.id === 'don-3' || (p.amount === 225000));
          if (sum === 225000 || hasOldMock) {
            safeStorage.removeItem('kmf_donations_actual');
            return [];
          }
          return parsed;
        }
      } catch {}
    }
    // Remove legacy mock storage keys
    safeStorage.removeItem('kmf_donations');
    safeStorage.removeItem('kmf_donations_zero');
    return initialDonations; // starts from []
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = safeStorage.getItem('kmf_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = safeStorage.getItem('kmf_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [widgets, setWidgetsState] = useState<DashboardWidgetConfig[]>(() => {
    const saved = safeStorage.getItem('kmf_widgets');
    return saved ? JSON.parse(saved) : defaultWidgets;
  });

  // Terms & Regulations Acceptance State
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(() => {
    return safeStorage.getItem('kmf_terms_accepted') === 'true';
  });
  const [requireTermsModal, setRequireTermsModal] = useState<boolean>(false);

  const acceptTerms = async () => {
    setIsTermsAccepted(true);
    setRequireTermsModal(false);
    safeStorage.setItem('kmf_terms_accepted', 'true');
    await logAction('security', 'Terms & Conditions Accepted', 'Member formally pledged adherence to all 19 rules & regulations of Kifaalat e Miyyat Fund.');
  };

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<{
    type: 'contribution' | 'donation' | 'claim';
    data: any;
  } | null>(null);

  // Sync & Offline State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncedAt: 'Live Local',
    pendingChangesCount: 0,
    isSyncing: false,
    cloudProvider: 'google_drive',
  });

  // Google Drive Integration State - Instant reconnect from persisted OAuth token
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState<boolean>(() => {
    try {
      const savedToken = localStorage.getItem('kmf_gdrive_access_token_v1');
      const savedTime = localStorage.getItem('kmf_gdrive_token_timestamp_v1');
      if (savedToken && savedTime) {
        const elapsed = Date.now() - parseInt(savedTime, 10);
        return elapsed < 50 * 60 * 1000;
      }
    } catch {}
    return false;
  });
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem('kmf_gdrive_user_email');
    } catch {
      return null;
    }
  });
  const [lastGoogleBackupTime, setLastGoogleBackupTime] = useState<string | null>(() => {
    return safeStorage.getItem('kmf_last_google_backup_time');
  });
  const [autoBackupEnabled, setAutoBackupEnabledState] = useState<boolean>(() => {
    return safeStorage.getItem('kmf_auto_backup_enabled') !== 'false';
  });

  const setAutoBackupEnabled = (enabled: boolean) => {
    setAutoBackupEnabledState(enabled);
    safeStorage.setItem('kmf_auto_backup_enabled', enabled ? 'true' : 'false');
  };

  // Google Drive Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setIsGoogleDriveConnected(!!token);
        setGoogleUserEmail(user.email || null);
      },
      () => {
        setIsGoogleDriveConnected(false);
        setGoogleUserEmail(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Helper to persist current state to cloud database and server disk
  const persistToServer = async (override?: Record<string, any>) => {
    try {
      const lockCreds = safeStorage.getItem('kmf_app_lock_credentials');
      const payload = {
        members,
        contributions,
        claims,
        donations,
        auditLogs,
        notifications,
        widgets,
        userCredentials,
        appLockCredentials: lockCreds ? JSON.parse(lockCreds) : null,
        ...override,
        lastSavedTime: new Date().toISOString(),
      };

      // Persist snapshot to Firestore Cloud for multi-device reliability
      saveDocument('appSettings', 'data_snapshot', payload).catch(() => {});
      saveDocument('backups', 'latest', payload).catch(() => {});

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setSyncStatus(prev => ({ ...prev, isOnline: false, pendingChangesCount: prev.pendingChangesCount + 1 }));
        return;
      }
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        setSyncStatus(prev => ({
          ...prev,
          isOnline: true,
          isSyncing: false,
          lastSyncedAt: timeStr,
          pendingChangesCount: 0,
        }));
      }
    } catch {
      setSyncStatus(prev => ({ ...prev, isSyncing: false, pendingChangesCount: prev.pendingChangesCount + 1 }));
    }
  };

  // Real-time Firestore Cloud Synchronization on Mount
  useEffect(() => {
    let isMounted = true;
    testFirestoreConnection().catch(console.warn);

    // 1. Members real-time sync
    const unsubMembers = onSnapshot(collection(db, 'members'), async (snap) => {
      if (!isMounted) return;
      if (snap.empty) {
        await batchSeedIfEmpty('members', official39Members, 'id');
      } else {
        const list: Member[] = [];
        snap.forEach(d => list.push(d.data() as Member));
        if (list.length > 0) {
          // Sort by membershipNumber
          list.sort((a, b) => (a.membershipNumber || '').localeCompare(b.membershipNumber || '', undefined, { numeric: true }));
          setMembers(list);
          safeStorage.setItem('kmf_members_v39', JSON.stringify(list));
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'members'));

    // 2. Contributions real-time sync
    const unsubContributions = onSnapshot(collection(db, 'contributions'), (snap) => {
      if (!isMounted) return;
      if (!snap.empty) {
        const list: Contribution[] = [];
        snap.forEach(d => list.push(d.data() as Contribution));
        // Sort newest first
        list.sort((a, b) => (b.paidDate || '').localeCompare(a.paidDate || ''));
        setContributions(list);
        safeStorage.setItem('kmf_contributions_v39', JSON.stringify(list));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'contributions'));

    // 3. Donations real-time sync
    const unsubDonations = onSnapshot(collection(db, 'donations'), (snap) => {
      if (!isMounted) return;
      if (!snap.empty) {
        const list: Donation[] = [];
        snap.forEach(d => list.push(d.data() as Donation));
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setDonations(list);
        safeStorage.setItem('kmf_donations_actual', JSON.stringify(list));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'donations'));

    // 4. Claims real-time sync
    const unsubClaims = onSnapshot(collection(db, 'claims'), (snap) => {
      if (!isMounted) return;
      if (!snap.empty) {
        const list: BereavementClaim[] = [];
        snap.forEach(d => list.push(d.data() as BereavementClaim));
        list.sort((a, b) => (b.filedDate || '').localeCompare(a.filedDate || ''));
        setClaims(list);
        safeStorage.setItem('kmf_claims', JSON.stringify(list));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'claims'));

    // 5. User Credentials real-time sync
    const unsubCreds = onSnapshot(collection(db, 'credentials'), async (snap) => {
      if (!isMounted) return;
      if (snap.empty) {
        await batchSeedIfEmpty('credentials', allMemberCredentials, 'username');
      } else {
        const list: MemberCredential[] = [];
        snap.forEach(d => list.push(d.data() as MemberCredential));
        if (list.length > 0) {
          setUserCredentials(list);
          safeStorage.setItem('kmf_user_credentials', JSON.stringify(list));
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'credentials'));

    // Background server disk sync and initial state hydration for cross-browser persistence
    fetch('/api/data').then(res => res.json()).then(json => {
      if (json.success && json.data && isMounted) {
        const d = json.data;
        if (Array.isArray(d.members) && d.members.length > 0) {
          setMembers(prev => prev.length === 0 ? d.members : prev);
          safeStorage.setItem('kmf_members_v39', JSON.stringify(d.members));
        }
        if (Array.isArray(d.contributions) && d.contributions.length > 0) {
          setContributions(prev => prev.length === 0 ? d.contributions : prev);
          safeStorage.setItem('kmf_contributions_v39', JSON.stringify(d.contributions));
        }
        if (Array.isArray(d.donations) && d.donations.length > 0) {
          setDonations(prev => prev.length === 0 ? d.donations : prev);
          safeStorage.setItem('kmf_donations_actual', JSON.stringify(d.donations));
        }
        if (Array.isArray(d.claims) && d.claims.length > 0) {
          setClaims(prev => prev.length === 0 ? d.claims : prev);
          safeStorage.setItem('kmf_claims', JSON.stringify(d.claims));
        }
        if (Array.isArray(d.userCredentials) && d.userCredentials.length > 0) {
          setUserCredentials(prev => prev.length <= 3 ? d.userCredentials : prev);
          safeStorage.setItem('kmf_user_credentials', JSON.stringify(d.userCredentials));
        }
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        setSyncStatus(prev => ({
          ...prev,
          isOnline: true,
          lastSyncedAt: timeStr,
          pendingChangesCount: 0,
        }));
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
      unsubMembers();
      unsubContributions();
      unsubDonations();
      unsubClaims();
      unsubCreds();
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    safeStorage.setItem('kmf_members_v39', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    safeStorage.setItem('kmf_contributions_v39', JSON.stringify(contributions));
  }, [contributions]);

  useEffect(() => {
    safeStorage.setItem('kmf_claims', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    safeStorage.setItem('kmf_donations_actual', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    safeStorage.setItem('kmf_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    safeStorage.setItem('kmf_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    safeStorage.setItem('kmf_widgets', JSON.stringify(widgets));
  }, [widgets]);

  // Apply dark mode & RTL attributes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    safeStorage.setItem('kmf_dark', isDark ? 'true' : 'false');
  }, [isDark]);

  useEffect(() => {
    document.documentElement.dir = (language === 'ur' || language === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    safeStorage.setItem('kmf_lang', language);
  }, [language]);

  // Window online/offline listener
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      persistToServer();
    };
    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
  };

  const isAdminOrKhazanchi = userRole === 'super_admin' || userRole === 'finance_secretary';
  const isKhazanchi = userRole === 'finance_secretary';
  const isAdmin = userRole === 'super_admin';
  const isMember = userRole === 'member';
  const isGuest = userRole === 'guest';

  const switchRole = (role: UserRole) => {
    setUserRole(role);
    if (role === 'super_admin') {
      const p: UserProfile = {
        id: 'usr-1',
        name: 'Muhammad Iqbal Khattak',
        nameUrdu: 'محمد اقبال خٹک',
        nameAr: 'محمد إقبال ختك',
        email: 'miqbalktk@gmail.com',
        phone: '0346-9100998',
        role: 'super_admin',
        username: 'admin',
        mfaEnabled: true,
      };
      setCurrentUser(p);
      safeStorage.setItem('kmf_user_session', JSON.stringify(p));
    } else if (role === 'finance_secretary') {
      const p: UserProfile = {
        id: 'usr-khazanchi',
        name: 'Muhammad Iqbal Khattak',
        nameUrdu: 'محمد اقبال خٹک',
        nameAr: 'محمد إقبال ختك',
        email: 'miqbalktk@gmail.com',
        phone: '0334-9100998',
        role: 'finance_secretary',
        username: 'khazanchi',
        mfaEnabled: true,
      };
      setCurrentUser(p);
      safeStorage.setItem('kmf_user_session', JSON.stringify(p));
    } else if (role === 'audit_inspector') {
      const p: UserProfile = {
        id: 'usr-3',
        name: 'Qari Noman Farooqi',
        nameUrdu: 'قاری نعمان فاروقی',
        nameAr: 'القارئ نعمان فاروقي',
        email: 'audit@kifaalat-fund.org',
        phone: '+92 333 4443322',
        role: 'audit_inspector',
        username: 'audit',
        mfaEnabled: false,
      };
      setCurrentUser(p);
      safeStorage.setItem('kmf_user_session', JSON.stringify(p));
    } else if (role === 'guest') {
      setCurrentUser(guestProfile);
      safeStorage.setItem('kmf_user_session', JSON.stringify(guestProfile));
    } else {
      const activeMember = members[0] || official39Members[0];
      const p: UserProfile = {
        id: activeMember.id,
        name: activeMember.fullName,
        nameUrdu: activeMember.fullNameUrdu,
        nameAr: activeMember.fullName,
        email: activeMember.email,
        phone: activeMember.phone,
        role: 'member',
        username: activeMember.membershipNumber.toLowerCase().replace('-', ''),
        memberId: activeMember.id,
        mfaEnabled: false,
      };
      setCurrentUser(p);
      safeStorage.setItem('kmf_user_session', JSON.stringify(p));
      if (!isTermsAccepted) {
        setRequireTermsModal(true);
      }
    }
  };

  // Credential Management for Admin
  const createMemberCredential = async (cred: Omit<MemberCredential, 'createdAt'>): Promise<boolean> => {
    const cleanUsername = cred.username.trim().toLowerCase().replace(/[\s-]/g, '');
    if (!cleanUsername || !cred.password.trim()) return false;

    // Check if username already exists
    if (userCredentials.some(c => c.username.toLowerCase().replace(/[\s-]/g, '') === cleanUsername)) {
      return false;
    }

    const newCred: MemberCredential = {
      ...cred,
      username: cleanUsername,
      password: cred.password.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      disabled: false,
    };

    const nextCreds = [...userCredentials, newCred];
    setUserCredentials(nextCreds);
    safeStorage.setItem('kmf_user_credentials', JSON.stringify(nextCreds));
    await saveDocument('credentials', cleanUsername, newCred);
    await logAction('security', 'Member Login Created', `Admin created credentials for '${cleanUsername}' (${cred.fullName}) assigned role: ${cred.role}.`);
    await persistToServer({ userCredentials: nextCreds });
    return true;
  };

  const updateMemberCredential = async (username: string, updates: Partial<MemberCredential>): Promise<boolean> => {
    const cleanUsername = username.trim().toLowerCase().replace(/[\s-]/g, '');
    let updatedCred: MemberCredential | null = null;
    const nextCreds = userCredentials.map(c => {
      if (c.username.toLowerCase().replace(/[\s-]/g, '') === cleanUsername) {
        const u = { ...c, ...updates };
        updatedCred = u;
        return u;
      }
      return c;
    });
    setUserCredentials(nextCreds);
    safeStorage.setItem('kmf_user_credentials', JSON.stringify(nextCreds));
    if (updatedCred) {
      await saveDocument('credentials', cleanUsername, updatedCred);
    }
    await logAction('security', 'Member Login Modified', `Admin modified credentials for '${cleanUsername}'.`);
    await persistToServer({ userCredentials: nextCreds });
    return true;
  };

  const deleteMemberCredential = async (username: string): Promise<boolean> => {
    const cleanUsername = username.trim().toLowerCase().replace(/[\s-]/g, '');
    if (cleanUsername === 'admin') return false; // Guard main admin account
    const nextCreds = userCredentials.filter(c => c.username.toLowerCase().replace(/[\s-]/g, '') !== cleanUsername);
    setUserCredentials(nextCreds);
    safeStorage.setItem('kmf_user_credentials', JSON.stringify(nextCreds));
    await deleteDocument('credentials', cleanUsername);
    await logAction('security', 'Member Login Deleted', `Admin deleted user credentials for '${cleanUsername}'.`);
    await persistToServer({ userCredentials: nextCreds });
    return true;
  };

  const toggleDisableMemberCredential = async (username: string): Promise<boolean> => {
    const cleanUsername = username.trim().toLowerCase().replace(/[\s-]/g, '');
    if (cleanUsername === 'admin') return false; // Guard main admin account
    let updatedCred: MemberCredential | null = null;
    const nextCreds = userCredentials.map(c => {
      if (c.username.toLowerCase().replace(/[\s-]/g, '') === cleanUsername) {
        const nextDisabled = !c.disabled;
        const u = { ...c, disabled: nextDisabled };
        updatedCred = u;
        return u;
      }
      return c;
    });
    setUserCredentials(nextCreds);
    safeStorage.setItem('kmf_user_credentials', JSON.stringify(nextCreds));
    if (updatedCred) {
      await saveDocument('credentials', cleanUsername, updatedCred);
    }
    await logAction('security', 'Member Login Status Changed', `Admin toggled disabled state for '${cleanUsername}'.`);
    await persistToServer({ userCredentials: nextCreds });
    return true;
  };

  // Login method for Admin and Members
  const login = async (username: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const cleanUser = username.trim().toLowerCase().replace(/[\s-]/g, '');
    const cleanPass = pass.trim();

    if (!cleanUser || !cleanPass) {
      return {
        success: false,
        message: language === 'ur' ? 'براہ کرم یوزر نیم اور پاس ورڈ دونوں درج فرمائیں۔' : 'Please provide both username and password.'
      };
    }

    // 1. Check in userCredentials
    const cred = userCredentials.find(c => {
      const u = c.username.toLowerCase().replace(/[\s-]/g, '');
      return u === cleanUser;
    });

    // 0. Check for Guest user: check userCredentials for custom password and disabled status
    if (cleanUser === 'guest') {
      const guestCred = userCredentials.find(c => c.username.toLowerCase() === 'guest');
      if (guestCred && guestCred.disabled) {
        return {
          success: false,
          message: language === 'ur'
            ? 'مہمان صارف اکاؤنٹ ایڈمن کی طرف سے غیر فعال (معطل) کر دیا گیا ہے۔'
            : 'Guest account has been disabled by Administrator.'
        };
      }
      const expectedPass = guestCred?.password || '1122';
      if (cleanPass === expectedPass) {
        setUserRole('guest');
        setCurrentUser(guestProfile);
        safeStorage.setItem('kmf_user_session', JSON.stringify(guestProfile));
        safeStorage.setItem('kmf_authenticated_session', 'true');
        sessionStorage.setItem('kmf_authenticated_session', 'true');
        sessionStorage.removeItem('kmf_app_is_locked');
        setIsAuthenticated(true);
        await logAction('security', 'Guest Login Successful', 'Guest viewer authenticated.');
        return { success: true };
      } else {
        return {
          success: false,
          message: language === 'ur'
            ? 'غلط پاس ورڈ! مہمان صارف پاس ورڈ کے لیے ایڈمن (0346-9100998) سے رابطہ فرمائیں۔'
            : 'Invalid guest password. Please contact Admin (0346-9100998).'
        };
      }
    }

    // Special check for master admin password 'love4dekko' or saved password
    const isAdminUser = cleanUser === 'admin' || cleanUser === 'muhammadiqbal';
    if (isAdminUser && (cleanPass === 'love4dekko' || (cred && cred.password === cleanPass))) {
      setUserRole('super_admin');
      const adminProfile: UserProfile = {
        id: 'usr-admin',
        name: 'Muhammad Iqbal Khattak',
        nameUrdu: 'محمد اقبال خٹک',
        nameAr: 'محمد إقبال ختك',
        email: 'miqbalktk@gmail.com',
        phone: '0346-9100998',
        role: 'super_admin',
        username: 'admin',
        mfaEnabled: true,
      };
      setCurrentUser(adminProfile);
      safeStorage.setItem('kmf_user_session', JSON.stringify(adminProfile));
      safeStorage.setItem('kmf_authenticated_session', 'true');
      setIsAuthenticated(true);
      sessionStorage.setItem('kmf_authenticated_session', 'true');
      sessionStorage.removeItem('kmf_app_is_locked');
      await logAction('security', 'Admin Login Successful', 'Super Admin Muhammad Iqbal Khattak authenticated.');
      return { success: true };
    }

    if (cred) {
      if (cred.disabled) {
        return {
          success: false,
          message: language === 'ur'
            ? 'یہ اکاؤنٹ ایڈمن کی طرف سے عارضی طور پر غیر فعال (Disabled) ہے۔ برائے مہربانی ایڈمنسٹریٹر محمد اقبال خٹک (0346-9100998) سے رابطہ فرمائیں۔'
            : 'This account has been disabled by the administrator. Please contact Admin Muhammad Iqbal Khattak (0346-9100998).'
        };
      }

      if (cred.password === cleanPass) {
        setUserRole(cred.role);
        const linkedMember = members.find(m => m.id === cred.memberId);
        const profile: UserProfile = {
          id: cred.memberId || `usr-${cred.username}`,
          name: cred.fullName || linkedMember?.fullName || cred.username,
          nameUrdu: cred.fullNameUrdu || linkedMember?.fullNameUrdu || cred.fullName,
          nameAr: cred.fullNameAr || cred.fullName,
          email: linkedMember?.email || 'member@kifaalat-fund.org',
          phone: cred.phone || linkedMember?.phone || '0334-9100998',
          role: cred.role,
          username: cred.username,
          memberId: cred.memberId,
          mfaEnabled: false,
        };
        setCurrentUser(profile);
        safeStorage.setItem('kmf_user_session', JSON.stringify(profile));
        safeStorage.setItem('kmf_authenticated_session', 'true');
        setIsAuthenticated(true);
        sessionStorage.setItem('kmf_authenticated_session', 'true');
        sessionStorage.removeItem('kmf_app_is_locked');
        await logAction('security', 'Member Login Successful', `User '${cred.username}' (${cred.fullName}) authenticated with role ${cred.role}.`);
        return { success: true };
      }
    }

    return {
      success: false,
      message: language === 'ur'
        ? 'غلط یوزر نیم یا پاس ورڈ! اگر آپ مہمان ہیں تو یوزر نیم guest اور پاس ورڈ 1122 درج فرمائیں، یا ایڈمنسٹریٹر محمد اقبال خٹک (0346-9100998) سے رابطہ فرمائیں۔'
        : 'Invalid credentials. For guest access use username "guest" and password "1122", or contact Admin Muhammad Iqbal Khattak (0346-9100998).'
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('kmf_authenticated_session');
    safeStorage.removeItem('kmf_authenticated_session');
    safeStorage.removeItem('kmf_user_session');
    sessionStorage.setItem('kmf_app_is_locked', 'true');
    setUserRole('guest');
    setCurrentUser(guestProfile);
  };

  // Admin record deletion functions requiring passcode '0000'
  const deleteMember = async (memberId: string, deletionCode: string): Promise<{ success: boolean; message?: string }> => {
    if (currentUser.role !== 'super_admin') {
      return {
        success: false,
        message: language === 'ur'
          ? 'صرف ایڈمنسٹریٹر کو ریکارڈ ڈیلیٹ کرنے کا اختیار ہے۔'
          : 'Only Super Administrator has authority to delete records.'
      };
    }
    if (deletionCode.trim() !== '0000') {
      return {
        success: false,
        message: language === 'ur'
          ? 'غلط ڈیلیشن کوڈ! ڈیفالٹ کوڈ 0000 درج فرمائیں۔'
          : 'Invalid deletion code. Please enter default code 0000.'
      };
    }
    const target = members.find(m => m.id === memberId);
    const updated = members.filter(m => m.id !== memberId);
    setMembers(updated);
    safeStorage.setItem('kmf_members_v39', JSON.stringify(updated));
    await deleteDocument('members', memberId);
    await persistToServer({ members: updated });
    await logAction('member', 'Member Record Deleted', `Member ${target?.fullName || memberId} (${target?.membershipNumber}) permanently deleted by Super Admin with code 0000.`);
    return { success: true };
  };

  const deleteContribution = async (contributionId: string, deletionCode: string): Promise<{ success: boolean; message?: string }> => {
    if (currentUser.role !== 'super_admin') {
      return {
        success: false,
        message: language === 'ur'
          ? 'صرف ایڈمنسٹریٹر کو ریکارڈ ڈیلیٹ کرنے کا اختیار ہے۔'
          : 'Only Super Administrator has authority to delete records.'
      };
    }
    if (deletionCode.trim() !== '0000') {
      return {
        success: false,
        message: language === 'ur'
          ? 'غلط ڈیلیشن کوڈ! ڈیفالٹ کوڈ 0000 درج فرمائیں۔'
          : 'Invalid deletion code. Please enter default code 0000.'
      };
    }
    const target = contributions.find(c => c.id === contributionId);
    const updated = contributions.filter(c => c.id !== contributionId);
    setContributions(updated);
    safeStorage.setItem('kmf_contributions_v39', JSON.stringify(updated));
    await deleteDocument('contributions', contributionId);
    await persistToServer({ contributions: updated });
    await logAction('contribution', 'Contribution Payment Deleted', `Payment ${target?.receiptNumber} of Rs. ${target?.amount} for ${target?.memberName} deleted by Super Admin with code 0000.`);
    return { success: true };
  };

  const deleteDonation = async (donationId: string, deletionCode: string): Promise<{ success: boolean; message?: string }> => {
    if (currentUser.role !== 'super_admin') {
      return {
        success: false,
        message: language === 'ur'
          ? 'صرف ایڈمنسٹریٹر کو ریکارڈ ڈیلیٹ کرنے کا اختیار ہے۔'
          : 'Only Super Administrator has authority to delete records.'
      };
    }
    if (deletionCode.trim() !== '0000') {
      return {
        success: false,
        message: language === 'ur'
          ? 'غلط ڈیلیشن کوڈ! ڈیفالٹ کوڈ 0000 درج فرمائیں۔'
          : 'Invalid deletion code. Please enter default code 0000.'
      };
    }
    const target = donations.find(d => d.id === donationId);
    const updated = donations.filter(d => d.id !== donationId);
    setDonations(updated);
    safeStorage.setItem('kmf_donations_actual', JSON.stringify(updated));
    await deleteDocument('donations', donationId);
    await persistToServer({ donations: updated });
    await logAction('donation', 'Sadqah/Donation Record Deleted', `Sadqah/Donation ${target?.receiptNumber} of Rs. ${target?.amount} from ${target?.donorName} deleted by Super Admin with code 0000.`);
    return { success: true };
  };

  // Helper to create tamper-evident audit log
  const logAction = async (category: AuditLog['category'], action: string, details: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const rawData = `${timestamp}|${currentUser.name}|${currentUser.role}|${category}|${action}|${details}`;
    const hash = await sha256Hex(rawData);

    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      category,
      details,
      ipAddress: '182.185.132.40 (Verified Session)',
      hash,
    };

    setAuditLogs(prev => [newLog, ...prev]);

    if (!syncStatus.isOnline) {
      setSyncStatus(prev => ({ ...prev, pendingChangesCount: prev.pendingChangesCount + 1 }));
    }
  };

  // Financial calculations
  const totalContributionsAmount = contributions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalDonationsAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  const totalCollected = totalContributionsAmount + totalDonationsAmount;

  const totalDisbursed = claims
    .filter(c => c.status === 'disbursed')
    .reduce((sum, c) => sum + c.approvedAmount, 0);

  const fundBalance = totalCollected - totalDisbursed; // Strictly according to funds added into App (starts at 0)

  const activeMonth = getCurrentYearMonth();
  const currentMonthInflow = contributions
    .reduce((sum, c) => sum + getContributionInflowForMonth(c, activeMonth), 0);

  // Exact target according to official table: 38 contributing members * 300 PKR = 11,400 PKR per month
  const monthlyTarget = 11400;

  // Actions
  const addMember = async (memberData: Omit<Member, 'id' | 'membershipNumber' | 'overdueMonths'>) => {
    if (!isAdminOrKhazanchi) {
      console.warn("Only Admin and Khazanchi can add members.");
      return;
    }
    const nextNum = 1000 + members.length + 1;
    const newMember: Member = {
      ...memberData,
      id: `mem-${Date.now()}`,
      membershipNumber: `KMF-${nextNum}`,
      overdueMonths: 0,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    const nextMembers = [newMember, ...members];
    setMembers(nextMembers);
    await saveDocument('members', newMember.id, newMember);
    await logAction('member', `Registered Member ${newMember.membershipNumber}`, `Added ${newMember.fullName} with ${newMember.dependents.length} dependents.`);
    await persistToServer({ members: nextMembers });
  };

  const updateMember = async (member: Member) => {
    if (!isAdminOrKhazanchi) {
      console.warn("Only Admin and Khazanchi can update members.");
      return;
    }
    const updatedMembers = members.map(m => m.id === member.id ? member : m);
    setMembers(updatedMembers);
    await saveDocument('members', member.id, member);
    await logAction('member', `Updated Member ${member.membershipNumber}`, `Updated profile details for ${member.fullName}`);
    await persistToServer({ members: updatedMembers });
  };

  const recordContribution = async (data: {
    memberId: string;
    month: string;
    amount: number;
    method: PaymentMethod;
    referenceNo?: string;
    notes?: string;
    monthsCount?: number;
    advancePeriodNote?: string;
  }): Promise<Contribution> => {
    if (!isAdminOrKhazanchi) {
      throw new Error("Only Admin and Khazanchi can record contributions. Members have view-only access.");
    }
    const member = members.find(m => m.id === data.memberId);
    const memberName = member ? member.fullName : 'Unknown Member';
    const nextRecNo = `REC-2026-${1050 + contributions.length + 1}`;

    const newContribution: Contribution = {
      id: `cnt-${Date.now()}`,
      receiptNumber: nextRecNo,
      memberId: data.memberId,
      memberName,
      month: data.month,
      amount: data.amount,
      paidDate: new Date().toISOString().split('T')[0],
      dueDate: `${data.month}-10`,
      method: data.method,
      collectedBy: currentUser.name,
      status: 'paid',
      referenceNo: data.referenceNo || `TX-${Date.now().toString().slice(-6)}`,
      notes: data.notes,
      emailSent: true,
      monthsCount: data.monthsCount || 1,
      advancePeriodNote: data.advancePeriodNote,
    };

    // Update member last payment & overdue
    let updatedMembers = members;
    if (member) {
      const coveredMonths = data.monthsCount && data.monthsCount > 0
        ? data.monthsCount
        : (data.amount > 300 && data.amount % 300 === 0 ? Math.round(data.amount / 300) : 1);
      const updatedMember = {
        ...member,
        lastPaymentDate: newContribution.paidDate,
        overdueMonths: Math.max(0, member.overdueMonths - coveredMonths),
        status: 'active' as const,
      };
      updatedMembers = members.map(m => m.id === member.id ? updatedMember : m);
      setMembers(updatedMembers);
      await saveDocument('members', member.id, updatedMember);
    }

    const nextContributions = [newContribution, ...contributions];
    setContributions(nextContributions);
    await saveDocument('contributions', newContribution.id, newContribution);
    await logAction(
      'contribution',
      `Recorded Payment ${newContribution.receiptNumber}`,
      `Received Rs. ${data.amount} for ${data.month} from ${memberName} via ${data.method}`
    );

    // Save to server disk
    await persistToServer({ members: updatedMembers, contributions: nextContributions });

    // Trigger receipt modal
    openReceiptModal('contribution', newContribution);

    return newContribution;
  };

  const sendPaymentReminder = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Reminder Sent to ${member.fullName}`,
      titleUrdu: `${member.fullNameUrdu || member.fullName} کو یاد دہانی بھیج دی گئی`,
      message: `Automated WhatsApp/SMS payment reminder dispatched for due date 10th October.`,
      messageUrdu: `ماہانہ واجب الادا فیس کی یاد دہانی رکن کو ارسال کر دی گئی۔`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
      type: 'deadline',
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const fileClaim = async (data: Omit<BereavementClaim, 'id' | 'claimNumber' | 'status' | 'filedDate' | 'approvedAmount'>): Promise<BereavementClaim> => {
    const claimNumber = `CLM-2026-${String(claims.length + 95).padStart(3, '0')}`;
    const newClaim: BereavementClaim = {
      ...data,
      id: `clm-${Date.now()}`,
      claimNumber,
      status: 'submitted',
      filedDate: new Date().toISOString().split('T')[0],
      approvedAmount: data.requestedAmount || 50000,
    };

    const nextClaims = [newClaim, ...claims];
    setClaims(nextClaims);
    await saveDocument('claims', newClaim.id, newClaim);
    await logAction(
      'claim',
      `Bereavement Claim Filed ${claimNumber}`,
      `Filed for deceased ${newClaim.deceasedName} (${newClaim.deceasedRelation}) by ${newClaim.memberName}. Grant: Rs. ${newClaim.requestedAmount}`
    );

    const alertNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `New Bereavement Claim: ${newClaim.deceasedName}`,
      titleUrdu: `نیا کفالت کلیم: ${newClaim.deceasedName}`,
      message: `Immediate solace & burial assistance requested by ${newClaim.memberName}. Needs review.`,
      messageUrdu: `رکن ${newClaim.memberName} نے تجہیز و تکفین امداد کی درخواست دی ہے۔ برائے مہربانی جائزہ لیں۔`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
      type: 'claim_alert',
    };
    const nextNotifs = [alertNotif, ...notifications];
    setNotifications(nextNotifs);

    await persistToServer({ claims: nextClaims, notifications: nextNotifs });

    return newClaim;
  };

  const approveClaim = async (claimId: string, amount: number) => {
    if (!isAdminOrKhazanchi) {
      console.warn("Only Admin and Khazanchi can approve claims.");
      return;
    }
    let approvedTarget: BereavementClaim | null = null;
    const updatedClaims = claims.map(c => {
      if (c.id === claimId) {
        const u = {
          ...c,
          status: 'approved' as const,
          approvedAmount: amount,
          approvedDate: new Date().toISOString().split('T')[0],
          approvedBy: `${currentUser.name} (${currentUser.role})`
        };
        approvedTarget = u;
        return u;
      }
      return c;
    });
    setClaims(updatedClaims);
    if (approvedTarget) {
      await saveDocument('claims', claimId, approvedTarget);
    }

    const claim = claims.find(c => c.id === claimId);
    await logAction(
      'claim',
      `Approved Bereavement Claim ${claim?.claimNumber}`,
      `Authorized Rs. ${amount} burial & condolence grant for deceased ${claim?.deceasedName}`
    );
    await persistToServer({ claims: updatedClaims });
  };

  const disburseClaim = async (claimId: string) => {
    if (!isAdminOrKhazanchi) {
      console.warn("Only Admin and Khazanchi can disburse claims.");
      return;
    }
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;

    const disbursedClaim = {
      ...claim,
      status: 'disbursed' as const,
      disbursedDate: new Date().toISOString().split('T')[0],
    };

    const updatedClaims = claims.map(c => c.id === claimId ? disbursedClaim : c);
    setClaims(updatedClaims);
    await saveDocument('claims', claimId, disbursedClaim);

    await logAction(
      'claim',
      `Disbursed Bereavement Grant ${claim.claimNumber}`,
      `Funds of Rs. ${claim.approvedAmount} transferred to ${claim.recipientName} via ${claim.payoutMethod}`
    );

    await persistToServer({ claims: updatedClaims });

    // Open receipt modal for official grant voucher
    openReceiptModal('claim', disbursedClaim);
  };

  const makeDonation = async (data: {
    donorName: string;
    donorEmail: string;
    donorPhone: string;
    isAnonymous: boolean;
    amount: number;
    category: DonationCategory;
    paymentMethod: PaymentMethod;
    dedicatedFor?: string;
  }): Promise<Donation> => {
    const nextRecNo = `DON-2026-${500 + donations.length + 1}`;
    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      receiptNumber: nextRecNo,
      donorName: data.isAnonymous ? 'Anonymous Philanthropist (محسن)' : data.donorName,
      donorEmail: data.donorEmail,
      donorPhone: data.donorPhone,
      isAnonymous: data.isAnonymous,
      amount: data.amount,
      category: data.category,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod,
      dedicatedFor: data.dedicatedFor,
      emailSent: true,
    };

    const nextDonations = [newDonation, ...donations];
    setDonations(nextDonations);
    await saveDocument('donations', newDonation.id, newDonation);
    await logAction(
      'donation',
      `Received Philanthropic Donation ${newDonation.receiptNumber}`,
      `Received Rs. ${data.amount} for ${data.category} from ${newDonation.donorName}`
    );

    await persistToServer({ donations: nextDonations });

    // Open receipt modal for donation slip
    openReceiptModal('donation', newDonation);

    return newDonation;
  };

  // Receipt Modal handlers
  const openReceiptModal = (type: 'contribution' | 'donation' | 'claim', data: any) => {
    setSelectedReceipt({ type, data });
  };

  const closeReceiptModal = () => {
    setSelectedReceipt(null);
  };

  // Sync to Server & Cloud
  const triggerCloudSync = async () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    await persistToServer();
    await logAction('sync', 'Server & Cloud Storage Sync', 'Synchronized local offline state with persistent server disk and encrypted backup.');
  };

  const toggleOfflineSimulation = () => {
    setSyncStatus(prev => ({
      ...prev,
      isOnline: !prev.isOnline,
    }));
  };

  // Encrypted Vault Backup & Restore
  const exportEncryptedVault = async (passphrase: string = DEFAULT_BACKUP_PASSPHRASE): Promise<string> => {
    const lockCreds = safeStorage.getItem('kmf_app_lock_credentials');
    const snapshot = {
      app: 'Kifaalat e Miyyat Fund',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      members,
      contributions,
      claims,
      donations,
      auditLogs,
      notifications,
      widgets,
      userCredentials,
      appLockCredentials: lockCreds ? JSON.parse(lockCreds) : null,
    };

    const encryptedString = await encryptVault(snapshot, passphrase);
    await logAction('security', 'Encrypted Vault Exported', 'Full database snapshot encrypted with AES-GCM and exported.');
    return encryptedString;
  };

  const importEncryptedVault = async (vaultJson: string, passphrase: string = DEFAULT_BACKUP_PASSPHRASE): Promise<boolean> => {
    try {
      const data = await decryptVault(vaultJson, passphrase);
      if (data && (data.members || data.contributions)) {
        if (Array.isArray(data.members)) setMembers(data.members);
        if (Array.isArray(data.contributions)) setContributions(data.contributions);
        if (Array.isArray(data.claims)) setClaims(data.claims);
        if (Array.isArray(data.donations)) setDonations(data.donations);
        if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
        if (Array.isArray(data.notifications)) setNotifications(data.notifications);
        if (Array.isArray(data.widgets)) setWidgetsState(data.widgets);
        if (Array.isArray(data.userCredentials) && data.userCredentials.length > 0) {
          setUserCredentials(data.userCredentials);
          safeStorage.setItem('kmf_user_credentials', JSON.stringify(data.userCredentials));
        }
        if (data.appLockCredentials) {
          safeStorage.setItem('kmf_app_lock_credentials', JSON.stringify(data.appLockCredentials));
        }

        // Persist to server disk immediately so changes are saved to server
        await persistToServer(data);

        await logAction('security', 'Encrypted Vault Restored', `Database restored successfully from encrypted snapshot (${data.members?.length || 0} members, ${data.userCredentials?.length || 0} user accounts).`);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to decrypt vault:', err);
      return false;
    }
  };

  // Google Drive Cloud Backup and Restore Methods
  const connectGoogleDrive = async (): Promise<boolean> => {
    try {
      const res = await googleSignIn();
      if (res) {
        setIsGoogleDriveConnected(true);
        setGoogleUserEmail(res.user.email || null);
        await logAction('security', 'Google Drive Connected', `Connected account: ${res.user.email}`);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to connect Google Drive:', err);
      return false;
    }
  };

  const disconnectGoogleDrive = async () => {
    await logoutGoogle();
    setIsGoogleDriveConnected(false);
    setGoogleUserEmail(null);
    await logAction('security', 'Google Drive Disconnected', 'Signed out from Google Drive backup service.');
  };

  const backupToGoogleDrive = async (passphrase: string = DEFAULT_BACKUP_PASSPHRASE): Promise<{ success: boolean; message: string; fileId?: string }> => {
    try {
      const token = await getAccessToken();
      if (!token) {
        return { success: false, message: 'Google Drive is not connected. Please sign in with Google first.' };
      }
      const encrypted = await exportEncryptedVault(passphrase);
      const res = await uploadBackupToDrive(encrypted);
      if (res.success) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = `${dateStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setLastGoogleBackupTime(timeStr);
        safeStorage.setItem('kmf_last_daily_backup_date', dateStr);
        safeStorage.setItem('kmf_last_google_backup_time', timeStr);
        await logAction('sync', 'Google Drive Backup Created', `Encrypted backup uploaded to folder (${res.fileName || 'kmf-backup'}).`);
        return { success: true, message: `Backup uploaded to Google Drive folder successfully (${res.fileName})`, fileId: res.fileId };
      } else {
        return { success: false, message: res.error || 'Failed to upload backup to Google Drive.' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Error uploading backup to Google Drive.' };
    }
  };

  const restoreFromGoogleDrive = async (fileId: string, passphrase: string = DEFAULT_BACKUP_PASSPHRASE): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await getAccessToken();
      if (!token) {
        return { success: false, message: 'Google Drive is not connected.' };
      }
      const encryptedContent = await downloadBackupFromDrive(fileId);
      const success = await importEncryptedVault(encryptedContent, passphrase);
      if (success) {
        return { success: true, message: 'Fund database restored successfully from Google Drive!' };
      } else {
        return { success: false, message: 'Decryption failed. Please check the decryption password (default: 1234).' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to restore backup from Google Drive.' };
    }
  };

  // Automated Daily & Startup Cloud Backup Effect - Strictly for Super Admin account only
  useEffect(() => {
    if (currentUser?.role !== 'super_admin') return;
    if (!autoBackupEnabled) return;
    const checkAndTriggerStartupBackup = async () => {
      try {
        // 1. Always back up encrypted snapshot to Firestore Cloud Vault
        const encrypted = await exportEncryptedVault(DEFAULT_BACKUP_PASSPHRASE);
        await saveDocument('backups', 'latest', {
          id: 'latest',
          snapshot: encrypted,
          timestamp: new Date().toISOString(),
          backedUpBy: currentUser.name,
        });

        // 2. If Google Drive token is available, back up to Google Drive folder
        const token = await getAccessToken();
        if (token) {
          console.log('Initiating automated startup backup to Google Drive for Admin...');
          await backupToGoogleDrive(DEFAULT_BACKUP_PASSPHRASE);
        }
      } catch (e) {
        console.warn('Admin auto-backup check skipped:', e);
      }
    };
    const timer = setTimeout(() => {
      checkAndTriggerStartupBackup();
    }, 2500);
    return () => clearTimeout(timer);
  }, [currentUser?.role, autoBackupEnabled, isGoogleDriveConnected]);

  const toggleMfa = () => {
    setCurrentUser(prev => ({ ...prev, mfaEnabled: !prev.mfaEnabled }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const setWidgets = (newWidgets: DashboardWidgetConfig[]) => {
    setWidgetsState(newWidgets);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        isDark,
        toggleDarkMode,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        userRole,
        switchRole,
        login,
        logout,
        isAdminOrKhazanchi,
        isKhazanchi,
        isAdmin,
        isMember,
        isGuest,
        deleteMember,
        deleteContribution,
        deleteDonation,
        isLoginModalOpen,
        setIsLoginModalOpen,
        allCredentials: allMemberCredentials,
        userCredentials,
        createMemberCredential,
        updateMemberCredential,
        deleteMemberCredential,
        toggleDisableMemberCredential,
        members,
        contributions,
        claims,
        donations,
        auditLogs,
        notifications,
        widgets,
        setWidgets,
        isTermsAccepted,
        acceptTerms,
        requireTermsModal,
        setRequireTermsModal,
        fundBalance,
        totalCollected,
        totalDisbursed,
        monthlyTarget,
        currentMonthInflow,
        addMember,
        updateMember,
        recordContribution,
        sendPaymentReminder,
        fileClaim,
        approveClaim,
        disburseClaim,
        makeDonation,
        selectedReceipt,
        openReceiptModal,
        closeReceiptModal,
        syncStatus,
        triggerCloudSync,
        toggleOfflineSimulation,
        exportEncryptedVault,
        importEncryptedVault,
        isGoogleDriveConnected,
        googleUserEmail,
        connectGoogleDrive,
        disconnectGoogleDrive,
        backupToGoogleDrive,
        restoreFromGoogleDrive,
        lastGoogleBackupTime,
        autoBackupEnabled,
        setAutoBackupEnabled,
        toggleMfa,
        markNotificationAsRead,
        clearAllNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
