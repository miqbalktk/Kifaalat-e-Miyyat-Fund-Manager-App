import type { Member, MemberCredential } from '../types/index.ts';

export interface FamilyGroup {
  id: number;
  locationUrdu: string;
  locationEn: string;
  memberNames: { urdu: string; en: string; isFeeSabeelillah?: boolean }[];
}

export const familyGroupsData: FamilyGroup[] = [
  {
    id: 1,
    locationUrdu: 'سپین کانہ کلان',
    locationEn: 'Spin Kana Kalan',
    memberNames: [
      { urdu: 'محمد اقبال', en: 'Muhammad Iqbal' },
      { urdu: 'جاوید اقبال', en: 'Javed Iqbal' },
      { urdu: 'ظفر اقبال', en: 'Zafar Iqbal' },
      { urdu: 'ارشد اقبال', en: 'Arshad Iqbal' },
      { urdu: 'ناصر اقبال', en: 'Nasir Iqbal' },
    ]
  },
  {
    id: 2,
    locationUrdu: 'سپین کانہ کلان',
    locationEn: 'Spin Kana Kalan',
    memberNames: [
      { urdu: 'محمد شاہد', en: 'Muhammad Shahid' }
    ]
  },
  {
    id: 3,
    locationUrdu: 'کاکا صاحب',
    locationEn: 'Kaka Sahib',
    memberNames: [
      { urdu: 'لطف اللہ', en: 'Lutfullah' },
      { urdu: 'احسان اللہ', en: 'Ehsanullah' }
    ]
  },
  {
    id: 4,
    locationUrdu: 'اضاخیل بالا',
    locationEn: 'Azakhel Bala',
    memberNames: [
      { urdu: 'امیر محمد (خان مامہ)', en: 'Amir Muhammad (Khan Mama)' },
      { urdu: 'معراج السلام', en: 'Mairaj ul Islam' },
      { urdu: 'حسین', en: 'Hussain' }
    ]
  },
  {
    id: 5,
    locationUrdu: 'اضاخیل بالا',
    locationEn: 'Azakhel Bala',
    memberNames: [
      { urdu: 'مولانا فاروق احمد', en: 'Maulana Farooq Ahmed' }
    ]
  },
  {
    id: 6,
    locationUrdu: 'اضاخیل بالا',
    locationEn: 'Azakhel Bala',
    memberNames: [
      { urdu: 'نصیر احمد', en: 'Naseer Ahmed' },
      { urdu: 'منظور احمد', en: 'Manzoor Ahmed' },
      { urdu: 'زاہد', en: 'Zahid' }
    ]
  },
  {
    id: 7,
    locationUrdu: 'اضاخیل بالا',
    locationEn: 'Azakhel Bala',
    memberNames: [
      { urdu: 'شکیل احمد', en: 'Shakeel Ahmed' },
      { urdu: 'سہیل', en: 'Sohail' },
      { urdu: 'بشیر', en: 'Basheer' }
    ]
  },
  {
    id: 8,
    locationUrdu: 'اضاخیل بالا',
    locationEn: 'Azakhel Bala',
    memberNames: [
      { urdu: 'محمد امین', en: 'Muhammad Ameen' },
      { urdu: 'روح الامین', en: 'Rooh ul Ameen' },
      { urdu: 'عاصم', en: 'Asim' }
    ]
  },
  {
    id: 9,
    locationUrdu: 'اضاخیل بالا',
    locationEn: 'Azakhel Bala',
    memberNames: [
      { urdu: 'مشتاق احمد', en: 'Mushtaq Ahmed' },
      { urdu: 'صادق احمد', en: 'Sadiq Ahmed' },
      { urdu: 'اقبال احمد', en: 'Iqbal Ahmed' }
    ]
  },
  {
    id: 10,
    locationUrdu: 'اضاخیل بالا',
    locationEn: 'Azakhel Bala',
    memberNames: [
      { urdu: 'سلطان جمیل (مرحوم)', en: 'Sultan Jameel (Marhoom)', isFeeSabeelillah: true }
    ]
  },
  {
    id: 11,
    locationUrdu: 'رسالپور',
    locationEn: 'Risalpur',
    memberNames: [
      { urdu: 'اعظم خان', en: 'Azam Khan' },
      { urdu: 'عبداللہ', en: 'Abdullah' },
      { urdu: 'اجمل', en: 'Ajmal' },
      { urdu: 'عارف', en: 'Arif' },
      { urdu: 'جماد', en: 'Jamad' }
    ]
  },
  {
    id: 12,
    locationUrdu: 'رسالپور',
    locationEn: 'Risalpur',
    memberNames: [
      { urdu: 'بہادر خان', en: 'Bahadur Khan' },
      { urdu: 'کامران', en: 'Kamran' },
      { urdu: 'نعمان', en: 'Noman' },
      { urdu: 'عمران', en: 'Imran' }
    ]
  },
  {
    id: 13,
    locationUrdu: 'رسالپور',
    locationEn: 'Risalpur',
    memberNames: [
      { urdu: 'طاہر حسین', en: 'Tahir Hussain' },
      { urdu: 'افضل حسین', en: 'Afzal Hussain' },
      { urdu: 'طارق حسین', en: 'Tariq Hussain' },
      { urdu: 'علی', en: 'Ali' }
    ]
  },
  {
    id: 14,
    locationUrdu: 'رسالپور',
    locationEn: 'Risalpur',
    memberNames: [
      { urdu: 'فضل حسین', en: 'Fazal Hussain' }
    ]
  }
];

// Generate structured member list of all 39 members
export const official39Members: Member[] = [];
export const allMemberCredentials: MemberCredential[] = [
  // Official Admin & President / Finance Secretary Account (Sole active public login)
  {
    username: 'admin',
    password: 'love4dekko',
    role: 'super_admin',
    fullName: 'Muhammad Iqbal Khattak',
    fullNameUrdu: 'محمد اقبال خٹک',
    fullNameAr: 'محمد إقبال ختك',
    phone: '0346-9100998',
    location: 'Spin Kana Kalan',
  },
  {
    username: 'khazanchi',
    password: 'love4dekko',
    role: 'finance_secretary',
    fullName: 'Muhammad Iqbal Khattak',
    fullNameUrdu: 'محمد اقبال خٹک',
    fullNameAr: 'محمد إقبال ختك',
    phone: '0346-9100998',
    location: 'Spin Kana Kalan',
  },
  {
    username: 'guest',
    password: '1122',
    role: 'guest',
    fullName: 'Guest Viewer',
    fullNameUrdu: 'مہمان صارف',
    fullNameAr: 'مستخدم ضيف',
    phone: '0346-9100998',
    location: 'Public Access',
  },
];

let counter = 1001;
familyGroupsData.forEach(group => {
  group.memberNames.forEach((item, idx) => {
    const memId = `kmf-mem-${counter}`;
    const memNumber = `KMF-${counter}`;

    official39Members.push({
      id: memId,
      membershipNumber: memNumber,
      fullName: item.en,
      fullNameUrdu: item.urdu,
      phone: item.isFeeSabeelillah ? '-' : `03${Math.floor(10 + Math.random() * 40)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      email: `${item.en.toLowerCase().replace(/[^a-z]/g, '')}@kifaalat-fund.org`,
      address: `${group.locationEn} (${group.locationUrdu})`,
      nationalId: `17301-${Math.floor(1000000 + Math.random() * 9000000)}-1`,
      joinedDate: '2026-10-01',
      monthlyPledgeAmount: item.isFeeSabeelillah ? 0 : 300, // Monthly contribution is 300 rupees per member
      status: item.isFeeSabeelillah ? 'active' : 'active',
      overdueMonths: 0,
      dependents: [],
      notes: item.isFeeSabeelillah
        ? 'فی سبیل اللہ - مرحوم ممبر، مجموعی مالی حساب سے مستثنیٰ'
        : `خاندان: ${group.locationUrdu} (گروپ #${group.id})`,
    });

    const cleanNum = memNumber.toLowerCase().replace(/[\s-]/g, '');
    allMemberCredentials.push({
      username: cleanNum,
      password: `${cleanNum}#2026`,
      role: 'member',
      memberId: memId,
      fullName: item.en,
      fullNameUrdu: item.urdu,
      fullNameAr: item.en,
      phone: item.isFeeSabeelillah ? '-' : `0334-9100998`,
      location: `${group.locationEn}`,
      disabled: false,
      createdAt: '2026-10-01',
    });

    counter++;
  });
});
