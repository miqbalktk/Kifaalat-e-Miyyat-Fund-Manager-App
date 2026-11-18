import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Member } from '../types';
import { UserCheck, X, Phone, MessageCircle, MapPin, Shield, DollarSign } from 'lucide-react';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const { updateMember, language, t } = useApp();

  const [fullName, setFullName] = useState('');
  const [fullNameUrdu, setFullNameUrdu] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [address, setAddress] = useState('');
  const [addressUrdu, setAddressUrdu] = useState('');
  const [email, setEmail] = useState('');
  const [monthlyPledgeAmount, setMonthlyPledgeAmount] = useState(300);
  const [status, setStatus] = useState<Member['status']>('active');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (member) {
      setFullName(member.fullName || '');
      setFullNameUrdu(member.fullNameUrdu || '');
      setPhone(member.phone || '');
      setWhatsapp(member.whatsapp || member.phone || '');
      setNationalId(member.nationalId || '');
      setAddress(member.address || '');
      setAddressUrdu(member.addressUrdu || '');
      setEmail(member.email || '');
      setMonthlyPledgeAmount(member.monthlyPledgeAmount ?? 300);
      setStatus(member.status || 'active');
      setNotes(member.notes || '');
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    await updateMember({
      ...member,
      fullName,
      fullNameUrdu,
      phone,
      whatsapp: whatsapp || phone,
      nationalId,
      address,
      addressUrdu,
      email: email || member.email,
      monthlyPledgeAmount,
      status,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-[#004d30] dark:text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-urdu">
                  {language === 'ur' ? 'ممبر کی معلومات میں ترمیم' : 'Modify Member Details'}
                </h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {member.membershipNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {language === 'ur'
                  ? 'نام، مقام/گاؤں، رابطہ نمبر، CNIC اور واٹس ایپ نمبر اپ ڈیٹ فرمائیں'
                  : 'Update Name, Location, Phone, CNIC and WhatsApp correspondence details'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          
          {/* 1. Names: English & Urdu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'ur' ? 'مکمل نام (انگریزی)' : 'Full Name (English)'}: *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'ur' ? 'مکمل نام (اردو)' : 'Full Name (Urdu)'}:
              </label>
              <input
                type="text"
                value={fullNameUrdu}
                onChange={e => setFullNameUrdu(e.target.value)}
                placeholder="مثلاً: محمد اقبال"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-urdu font-medium text-sm"
              />
            </div>
          </div>

          {/* 2. Contact Numbers: Calling Phone & WhatsApp for Correspondence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ur' ? 'کالنگ فون نمبر' : 'Calling Contact Number'}: *</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0334-9100998"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ur' ? 'واٹس ایپ برائے خط و کتابت' : 'WhatsApp for Correspondence'}:</span>
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="+923469100998"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
          </div>

          {/* 3. National ID (CNIC) & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'ur' ? 'قومی شناختی کارڈ نمبر (CNIC)' : 'CNIC (National ID)'}:</span>
              </label>
              <input
                type="text"
                value={nationalId}
                onChange={e => setNationalId(e.target.value)}
                placeholder="14202-0000000-1"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'ur' ? 'ای میل (اختیاری)' : 'Email (Optional)'}:
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="member@example.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          {/* 4. Location / Village: English & Urdu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ur' ? 'مقام / گاؤں (انگریزی)' : 'Location / Village (En)'}:</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Spin Kana Kalan, Nowshera"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'ur' ? 'مقام / گاؤں (اردو)' : 'Location / Village (Urdu)'}:
              </label>
              <input
                type="text"
                value={addressUrdu}
                onChange={e => setAddressUrdu(e.target.value)}
                placeholder="سپین کانہ کلان، نوشہرہ"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-urdu font-medium"
              />
            </div>
          </div>

          {/* 5. Monthly Pledge & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ur' ? 'ماہانہ قسط کی رقم (روپے)' : 'Monthly Pledge Amount (PKR)'}:</span>
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={monthlyPledgeAmount}
                onChange={e => setMonthlyPledgeAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {monthlyPledgeAmount === 0 ? 'مرحوم ممبر (فی سبیل اللہ مستثنیٰ)' : 'معیاری قسط: 300 روپے'}
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'ur' ? 'ممبرشپ کی حیثیت' : 'Membership Status'}:
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Member['status'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium cursor-pointer"
              >
                <option value="active">{t.status.active}</option>
                <option value="grace_period">{t.status.grace_period}</option>
                <option value="suspended">{t.status.suspended}</option>
              </select>
            </div>
          </div>

          {/* 6. Notes */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {language === 'ur' ? 'اضافی نوٹس یا خاندانی معلومات' : 'Notes / Family Information'}:
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Registered with family group"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#004d30] hover:bg-[#023e27] text-white font-bold transition-colors cursor-pointer"
            >
              {language === 'ur' ? 'تبدیلیاں محفوظ کریں' : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
