export interface AccountDetails {
  titleEn: string;
  titleUrdu: string;
  titleAr: string;
  accountHolder: string;
  accountHolderUrdu: string;
  accountHolderAr: string;
  designationUrdu: string;
  designationEn: string;
  designationAr: string;
  phone: string; // Calling contact: 0334-9100998
  whatsapp: string; // WhatsApp for correspondence: +923469100998 / 03469100998
  email: string;
  bankAccount: {
    bankName: string;
    bankNameUrdu: string;
    bankNameAr: string;
    accountTitle: string;
    accountTitleUrdu: string;
    accountTitleAr: string;
    accountNumber: string;
    iban: string;
    branchCode?: string;
    qrPayload: string;
  };
  paymentRules: {
    monthlyAmount: number;
    currency: string;
    deadlineDay: number;
    guidelineUrdu: string[];
    guidelineEn: string[];
    guidelineAr: string[];
  };
}

export const fundAccountInfo: AccountDetails = {
  titleEn: 'Kifaalat e Miyyat Fund - Official HBL Bank Account Details',
  titleUrdu: 'کفالتِ میت فنڈ - حبیب بینک لمیٹڈ (HBL) اکاؤنٹ کی مکمل تفصیلات',
  titleAr: 'صندوق كفالة الميت - تفاصيل الحساب المصرفي الرسمي (HBL)',
  accountHolder: 'Muhammad Iqbal',
  accountHolderUrdu: 'محمد اقبال',
  accountHolderAr: 'محمد إقبال',
  designationUrdu: 'خزانچی و ناظمِ مالیات (کفالتِ میت فنڈ)',
  designationEn: 'Treasurer & Finance Secretary (Kifaalat e Miyyat Fund)',
  designationAr: 'أمين الصندوق ومسؤول المالية (صندوق كفالة الميت)',
  phone: '03349100998', // Calling contact
  whatsapp: '+923469100998', // WhatsApp for correspondence
  email: 'miqbalktk@gmail.com',
  bankAccount: {
    bankName: 'Habib Bank Limited (HBL)',
    bankNameUrdu: 'حبیب بینک لمیٹڈ (HBL)',
    bankNameAr: 'حبيب بنك المحدود (HBL)',
    accountTitle: 'Muhammad Iqbal',
    accountTitleUrdu: 'محمد اقبال',
    accountTitleAr: 'محمد إقبال',
    accountNumber: '11815901035603',
    iban: 'PK49HABB0011815901035603',
    branchCode: '1181',
    qrPayload: 'PK49HABB0011815901035603',
  },
  paymentRules: {
    monthlyAmount: 300,
    currency: 'PKR',
    deadlineDay: 10,
    guidelineUrdu: [
      'ماہانہ قسط کی رقم فی ممبر تمام ممبران کے اتفاق سے مقرر ہے۔',
      'ممبران ایک یا ایک سے زائد مہینوں کی اقساط پیشگی (Advance) بھی ادا کر سکتے ہیں۔',
      'صرف حبیب بینک لمیٹڈ (HBL)، آن لائن بینکنگ، HBL موبائل ایپ، یا راست (Raast) کے ذریعے رقم منتقل فرمائیں۔',
      'ادائیگی کے بعد ٹرانزیکشن کا اسکرین شاٹ / رسید واٹس ایپ نمبر +923469100998 پر خزانچی کو فوراً ارسال کریں۔',
      'کالنگ اور رابطہ کے لیے فون نمبر 03349100998 پر رابطہ کر سکتے ہیں۔',
      'خزانچی ادائیگی کی تصدیق کے بعد فوری طور پر سسٹم میں ڈیجیٹل رسید درج کر کے آپ کو جاری کرے گا۔'
    ],
    guidelineEn: [
      'Monthly contribution per enrolled member is fixed by mutual consensus.',
      'Members can pay contributions for one or multiple months in advance.',
      'Transfer funds strictly via Habib Bank Limited (HBL) Mobile App, Online Banking, IBAN, or Raast.',
      'After payment, please immediately send the payment screenshot to WhatsApp: +923469100998.',
      'For direct phone calls, contact the Treasurer at 03349100998.',
      'Upon verification, the Treasurer will record the payment and issue an official digital receipt.'
    ],
    guidelineAr: [
      'الاشتراك الشهري لكل عضو محدد باتفاق جميع الأعضاء.',
      'يمكن للأعضاء سداد اشتراكات شهر واحد أو عدة أشهر مقدماً.',
      'يرجى التحويل حصرياً عبر حبيب بنك لمیٹڈ (HBL) أو تطبيق HBL أو الآيبان أو نظام راست (Raast).',
      'بعد إتمام الدفع، يرجى إرسال لقطة شاشة التحويل فوراً عبر واتساب إلى الرقم: +923469100998.',
      'للمكالمات الهاتفية المباشرة، يمكنكم الاتصال على الرقم: 03349100998.',
      'سيقوم أمين الصندوق بإصدار إيصال رقمي رسمي معتمد بمجرد تأكيد الاستلام.'
    ]
  }
};
