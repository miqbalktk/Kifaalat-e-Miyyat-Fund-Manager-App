export type Language = 'en' | 'ur' | 'ar';

export type UserRole = 'super_admin' | 'finance_secretary' | 'audit_inspector' | 'member' | 'guest';

export interface UserProfile {
  id: string;
  name: string;
  nameUrdu: string;
  nameAr?: string;
  email: string;
  phone: string;
  role: UserRole;
  username?: string;
  avatar?: string;
  mfaEnabled: boolean;
  memberId?: string;
}

export interface MemberCredential {
  username: string;
  password: string;
  role: UserRole;
  memberId?: string;
  fullName: string;
  fullNameUrdu: string;
  fullNameAr?: string;
  phone: string;
  location?: string;
  disabled?: boolean;
  createdAt?: string;
}

export type DependentRelation = 'spouse' | 'child' | 'father' | 'mother' | 'brother' | 'sister' | 'other';

export interface Dependent {
  id: string;
  fullName: string;
  relation: DependentRelation;
  cnicOrDob: string;
  isEligibleForClaim: boolean;
}

export type MembershipStatus = 'active' | 'grace_period' | 'suspended' | 'pending_approval';

export interface Member {
  id: string;
  membershipNumber: string; // e.g. KMF-1001
  fullName: string;
  fullNameUrdu: string;
  phone: string; // Calling contact
  whatsapp?: string; // WhatsApp for correspondence
  email: string;
  address: string; // Location / Address
  addressUrdu?: string;
  nationalId: string; // CNIC
  joinedDate: string;
  monthlyPledgeAmount: number; // e.g. 300 PKR
  status: MembershipStatus;
  dependents: Dependent[];
  notes?: string;
  lastPaymentDate?: string;
  overdueMonths: number;
}

export type PaymentMethod = 'bank_transfer' | 'cash' | 'cheque';

export interface Contribution {
  id: string;
  receiptNumber: string;
  memberId: string;
  memberName: string;
  month: string; // "2026-10"
  amount: number;
  paidDate: string;
  dueDate: string;
  method: PaymentMethod;
  collectedBy: string;
  status: 'paid' | 'pending' | 'overdue';
  referenceNo?: string;
  notes?: string;
  emailSent: boolean;
  monthsCount?: number; // Number of months paid in advance (e.g., 1, 2, 3, 6, 12)
  advancePeriodNote?: string; // Note e.g. "Advance for 3 months (Oct 2026 - Dec 2026)"
}

export type ClaimStatus = 'submitted' | 'under_review' | 'approved' | 'disbursed' | 'rejected';

export interface BereavementClaim {
  id: string;
  claimNumber: string; // e.g. CLM-2026-001
  memberId: string;
  memberName: string;
  deceasedName: string;
  deceasedRelation: DependentRelation | string;
  dateOfDeath: string;
  causeOfDeath?: string;
  hospitalOrBurialPlace: string;
  requestedAmount: number; // e.g. 50,000 PKR
  approvedAmount: number;
  status: ClaimStatus;
  filedDate: string;
  approvedDate?: string;
  disbursedDate?: string;
  approvedBy?: string;
  recipientName: string;
  recipientContact: string;
  payoutMethod: PaymentMethod;
  proofDocumentNote?: string;
  burialKitIncluded: boolean;
}

export type DonationCategory = 'zakat' | 'sadqah' | 'kafan_burial_sponsorship' | 'ambulance_fuel' | 'underprivileged_aid' | 'general_fund';

export interface Donation {
  id: string;
  receiptNumber: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  isAnonymous: boolean;
  amount: number;
  category: DonationCategory;
  date: string;
  paymentMethod: PaymentMethod;
  dedicatedFor?: string;
  emailSent: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  category: 'member' | 'contribution' | 'claim' | 'donation' | 'security' | 'sync' | 'settings';
  details: string;
  ipAddress: string;
  hash: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  titleUrdu: string;
  message: string;
  messageUrdu: string;
  date: string;
  read: boolean;
  type: 'deadline' | 'claim_alert' | 'payment_received' | 'security' | 'donation';
  actionUrl?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncedAt: string;
  pendingChangesCount: number;
  isSyncing: boolean;
  cloudProvider: 'google_drive' | 'local_vault';
}

export interface DashboardWidgetConfig {
  id: string;
  label: string;
  labelUrdu: string;
  visible: boolean;
  order: number;
}
