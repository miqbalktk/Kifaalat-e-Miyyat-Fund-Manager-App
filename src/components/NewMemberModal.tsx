import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Dependent, DependentRelation } from '../types';
import { UserPlus, Plus, Trash2, X, Users, Phone, MessageCircle, Shield, MapPin } from 'lucide-react';

interface NewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewMemberModal: React.FC<NewMemberModalProps> = ({ isOpen, onClose }) => {
  const { addMember, language, t } = useApp();

  const [fullName, setFullName] = useState('');
  const [fullNameUrdu, setFullNameUrdu] = useState('');
  const [phone, setPhone] = useState('03');
  const [whatsapp, setWhatsapp] = useState('+923');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [address, setAddress] = useState('Spin Kana Kalan');
  const [addressUrdu, setAddressUrdu] = useState('سپین کانہ کلان');
  const [monthlyPledgeAmount, setMonthlyPledgeAmount] = useState(300);

  // Dependents array
  const [dependents, setDependents] = useState<Dependent[]>([
    {
      id: 'dep-temp-1',
      fullName: '',
      relation: 'spouse',
      cnicOrDob: '',
      isEligibleForClaim: true,
    }
  ]);

  if (!isOpen) return null;

  const handleAddDependent = () => {
    setDependents([
      ...dependents,
      {
        id: `dep-temp-${Date.now()}`,
        fullName: '',
        relation: 'child',
        cnicOrDob: '',
        isEligibleForClaim: true,
      }
    ]);
  };

  const handleRemoveDependent = (index: number) => {
    setDependents(dependents.filter((_, i) => i !== index));
  };

  const handleUpdateDependent = (index: number, field: keyof Dependent, value: any) => {
    const updated = [...dependents];
    updated[index] = { ...updated[index], [field]: value };
    setDependents(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    const validDependents = dependents.filter(d => d.fullName.trim() !== '');

    await addMember({
      fullName,
      fullNameUrdu,
      phone,
      whatsapp: whatsapp || phone,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.') }@kmf.org`,
      address: address || 'Spin Kana Kalan',
      addressUrdu: addressUrdu || 'سپین کانہ کلان',
      nationalId: nationalId || '14202-0000000-1',
      monthlyPledgeAmount,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      dependents: validDependents,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto max-h-[92vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-[#004d30] dark:text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-urdu">
                {language === 'ur' ? 'نیا ممبر رجسٹر کریں' : t.members.addMemberBtn}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'ur'
                  ? 'نام، مقام، فون، CNIC اور واٹس ایپ نمبر درج کر کے نیا رکن شامل کریں'
                  : 'Register family head and dependents under mutual bereavement policy'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Member Basic Details */}
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
                placeholder="e.g. Muhammad Aslam"
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
                placeholder="مثلاً: محمد اسلم"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-urdu font-medium text-sm"
              />
            </div>
          </div>

          {/* Contact Numbers: Calling Phone & WhatsApp */}
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

          {/* CNIC and Monthly Pledge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'ur' ? 'قومی شناختی کارڈ (CNIC)' : 'CNIC / National ID'}:</span>
              </label>
              <input
                type="text"
                value={nationalId}
                onChange={e => setNationalId(e.target.value)}
                placeholder="14202-1234567-1"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {language === 'ur' ? 'ماہانہ قسط کی رقم (روپے)' : 'Monthly Pledge (PKR)'}:
              </label>
              <input
                type="number"
                value={monthlyPledgeAmount}
                onChange={e => setMonthlyPledgeAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold font-mono"
              />
            </div>
          </div>

          {/* Location / Village */}
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
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-urdu"
              />
            </div>
          </div>

          {/* Dependents List Builder */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ur' ? 'زیرِ کفالت اہلِ خانہ (امداد کے مستحقین)' : 'Family Dependents'}:</span>
              </span>
              <button
                type="button"
                onClick={handleAddDependent}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.members.addDependent}</span>
              </button>
            </div>

            <div className="space-y-2">
              {dependents.map((dep, idx) => (
                <div key={dep.id} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={dep.fullName}
                    onChange={e => handleUpdateDependent(idx, 'fullName', e.target.value)}
                    placeholder="Dependent Full Name"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <select
                    value={dep.relation}
                    onChange={e => handleUpdateDependent(idx, 'relation', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="spouse">{t.relations.spouse}</option>
                    <option value="child">{t.relations.child}</option>
                    <option value="father">{t.relations.father}</option>
                    <option value="mother">{t.relations.mother}</option>
                    <option value="brother">{t.relations.brother}</option>
                    <option value="sister">{t.relations.sister}</option>
                    <option value="other">{t.relations.other}</option>
                  </select>
                  <input
                    type="text"
                    value={dep.cnicOrDob}
                    onChange={e => handleUpdateDependent(idx, 'cnicOrDob', e.target.value)}
                    placeholder="CNIC / B-Form"
                    className="w-full sm:w-32 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                  {dependents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDependent(idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
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
              {language === 'ur' ? 'ممبر شامل کریں' : 'Register Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
