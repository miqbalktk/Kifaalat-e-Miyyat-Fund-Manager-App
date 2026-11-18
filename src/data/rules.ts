export interface RuleItem {
  id: number;
  titleUrdu: string;
  titleEn: string;
  contentUrdu: string;
  contentEn: string;
  category: 'membership' | 'contributions' | 'aid' | 'general';
}

export const fundRules: RuleItem[] = [
  {
    id: 1,
    titleUrdu: 'قاعدہ 1: [خاندان کی ممبرشپ اور سربراہی]',
    titleEn: 'Rule 1: [Family Membership & Head of Household]',
    contentUrdu: 'ہر شادی شدہ فرد یا خاندان کا سربراہ اپنے خاندان (بیوی اور غیر شادی شدہ بچوں) کی طرف سے کمیٹی کا ممبر ہوگا۔',
    contentEn: 'Every married individual or head of household will represent and be a member of the committee on behalf of their family (spouse and unmarried children).',
    category: 'membership'
  },
  {
    id: 2,
    titleUrdu: 'قاعدہ 2: [غیر شادی شدہ خاندان کی سربراہی]',
    titleEn: 'Rule 2: [Leadership of Unmarried Households]',
    contentUrdu: 'شادی شدہ فرد نہ ہونے کی صورت میں خاندان میں کوئی بھی برسرِ روزگار بھائی، ترجیحاً بڑا بھائی اپنے والدہ اور دوسرے بہن بھائیوں کی طرف سے خاندان کا سربراہ مقرر کیا جا سکتا ہے۔',
    contentEn: 'In the absence of a married member, any earning brother in the family, preferably the eldest brother, can be appointed as family head on behalf of his mother and siblings.',
    category: 'membership'
  },
  {
    id: 3,
    titleUrdu: 'قاعدہ 3: [والدین کی شمولیت]',
    titleEn: 'Rule 3: [Inclusion of Dependent Parents]',
    contentUrdu: 'کسی ممبر کے ایسے والدین جو خود برسرِ روزگار نہ ہوں اور وہ اپنے بیٹوں پر انحصار کرتے ہوں، وہ اس ممبر کے ساتھ خاندان میں شامل تصور ہوں گے۔',
    contentEn: 'Dependent parents of any member who are not independently earning and rely on their sons will be considered covered under that member’s household.',
    category: 'membership'
  },
  {
    id: 4,
    titleUrdu: 'قاعدہ 4: [ماہانہ قسط اور تاریخ]',
    titleEn: 'Rule 4: [Monthly Contribution & Deadline]',
    contentUrdu: 'قسط کی کم از کم رقم مبلغ 300 روپے، ممبران کے مشورے سے مقرر ہو گئی ہے جو ہر ممبر (شادی شدہ فرد یا خاندان کا سربراہ) ہر مہینے کی 10 تاریخ تک لازمی طور پر جمع کرے گا۔',
    contentEn: 'The minimum monthly contribution is set at PKR 300 by consensus, which every member/head of household must deposit by the 10th of every calendar month without fail.',
    category: 'contributions'
  },
  {
    id: 5,
    titleUrdu: 'قاعدہ 5: [حبیب بینک (HBL) اکاؤنٹ اور خزانچی کی رپورٹ]',
    titleEn: 'Rule 5: [Official HBL Account & Treasurer Reporting]',
    contentUrdu: 'ادائیگی اور حساب کتاب میں مکمل شفافیت کے لیے فنڈ کا سرکاری کھاتہ حبیب بینک لمیٹڈ (HBL) میں محمد اقبال (اکاؤنٹ نمبر 11815901035603، IBAN: PK49HABB0011815901035603) کے نام قائم کیا گیا ہے۔ خزانچی اس اکاؤنٹ کا رپورٹ اور بینک اسٹیٹمنٹ ہر مہینے باقاعدہ طور پر کمیٹی واٹس ایپ پر شیئر کرے گا۔ اس کے علاوہ ان افراد کے نام بھی شیئر کرے گا جن کے ذمہ قسط کی رقم بقایا ہے۔',
    contentEn: 'For complete financial transparency, an official Habib Bank Limited (HBL) account in the name of Muhammad Iqbal (Account: 11815901035603, IBAN: PK49HABB0011815901035603) is maintained. The Treasurer will share a regular monthly statement and list of overdue members in the committee WhatsApp correspondence.',
    category: 'contributions'
  },
  {
    id: 6,
    titleUrdu: 'قاعدہ 6: [فنڈ کا استعمال اور مقاصد]',
    titleEn: 'Rule 6: [Fund Utilization & Core Purpose]',
    contentUrdu: 'فی الحال کمیٹی کے فنڈ کو صرف کفالتِ میت کے لیے استعمال کیا جائے گا۔ جبکہ بعد میں فنڈ کی رقم بہت زیادہ جمع ہونے کی صورت میں ممبران کے مشورے سے اس کو دوسرے ناگہانی آفات میں ممبر کی مدد کے لیے بھی استعمال کیا جا سکتا ہے۔',
    contentEn: 'The fund is currently exclusively reserved for death assistance. If reserves grow substantially, it may be utilized for emergency relief in unforeseen calamities upon committee consultation.',
    category: 'general'
  },
  {
    id: 7,
    titleUrdu: 'قاعدہ 7: [چھوٹے نابالغ کی وفات پر امداد]',
    titleEn: 'Rule 7: [Bereavement Aid on Death of Young Minor]',
    contentUrdu: 'ممبران صاحبان کے مشورے کے مطابق ممبر کے خاندان کے ایسے نابالغ فرد جن کی وفات پر دعا ان کے جنازے کے ساتھ ہی ختم ہو جائے، ممبر کو کمیٹی فنڈ سے مبلغ 15 ہزار روپے ادا کیے جائیں گے۔',
    contentEn: 'For the passing of a young minor dependent where prayers conclude with the funeral, the committee fund will provide financial assistance of PKR 15,000 to the member.',
    category: 'aid'
  },
  {
    id: 8,
    titleUrdu: 'قاعدہ 8: [بالغ یا بڑے افراد کی وفات پر امداد]',
    titleEn: 'Rule 8: [Bereavement Aid for Adults / Older Dependents]',
    contentUrdu: 'ممبر کے خاندان کے بالغ افراد یا ایسے بڑے نابالغ افراد، جن کی وفات پر تین دن تک فاتحہ خوانی کی جائے، کمیٹی کے فنڈ سے ممبر کو مبلغ 50 ہزار روپے ادا کیے جائیں گے۔',
    contentEn: 'For the passing of adult family members or older minors where formal 3-day condolence prayers are observed, committee funds of PKR 50,000 will be paid to the member.',
    category: 'aid'
  },
  {
    id: 9,
    titleUrdu: 'قاعدہ 9: [امداد کی ادائیگی کی مدت]',
    titleEn: 'Rule 9: [Aid Disbursement Timeline]',
    contentUrdu: 'کفالت میت فنڈ کمیٹی مقرر کردہ رقم ممبر کو فوتگی کے سوئم یعنی تیسرے دن سے پہلے پہلے ادا کرنے کی پابند ہوگی۔ یہ رقم ورثاء کی سہولت کے مطابق کیش یا بینک ٹرانسفر کی صورت میں ادا کی جا سکتی ہے۔',
    contentEn: 'The committee is bound to disburse the approved grant before the 3rd day (Soyem) of bereavement. Disbursed via cash or bank transfer according to the heirs’ preference.',
    category: 'aid'
  },
  {
    id: 10,
    titleUrdu: 'قاعدہ 10: [بقایا جات کی کٹوتی]',
    titleEn: 'Rule 10: [Deduction of Overdue Dues]',
    contentUrdu: 'کسی ممبر کے ذمہ بقایا واجب الادا رقم (اگر ہو)، فوتگی کی صورت میں دی جانے والی رقم سے کاٹ کر باقی رقم ممبر کو ادا کی جائے گی بشرطِ اس کے کہ اس کی ممبرشپ ختم نہ کی گئی ہو۔',
    contentEn: 'Any overdue dues of a member will be deducted from the disbursement grant, provided membership has not been terminated.',
    category: 'aid'
  },
  {
    id: 11,
    titleUrdu: 'قاعدہ 11: [نئے خاندانوں کی تاخیر سے شمولیت]',
    titleEn: 'Rule 11: [Late Enrollment of New Households]',
    contentUrdu: 'اگر کوئی خاندان بعد میں اس کفالت میت فنڈ میں شامل ہونا چاہتا ہے تو اس کو پچھلے تمام اقساط ایک ساتھ جمع کرنے ہوں گے۔ یا پھر زیادہ رقم کی صورت میں کمیٹی مشورے سے اس باقی ماندہ رقم کو دو یا تین اقساط میں جمع کرنے کی رعایت دے سکتی ہے۔',
    contentEn: 'Any household joining late must pay all past contributions in lump sum. For large accumulated dues, committee may grant relaxation to pay across 2 to 3 installments.',
    category: 'membership'
  },
  {
    id: 12,
    titleUrdu: 'قاعدہ 12: [اضافی چندہ یا عطیات]',
    titleEn: 'Rule 12: [Voluntary Donations & Extra Contributions]',
    contentUrdu: 'صاحبِ حیثیت افراد ماہانہ لازمی چندہ کے علاوہ بھی، کسی بھی وقت، کوئی بھی اضافی رقم اس فنڈ میں جمع کروا سکتے ہیں۔',
    contentEn: 'Members with financial means may voluntarily deposit additional donations, Sadqah, or voluntary contributions into the fund at any time beyond the compulsory fee.',
    category: 'contributions'
  },
  {
    id: 13,
    titleUrdu: 'قاعدہ 13: [اکاؤنٹنٹ کا مقرر ہونا]',
    titleEn: 'Rule 13: [Appointment of Assistant Accountant]',
    contentUrdu: 'خزانچی کی ذمہ داری کی حساسیت کو دیکھتے ہوئے ایک ممبر کو بطور اکاؤنٹنٹ، خزانچی کی مدد کے لیے مقرر کیا جائے گا، جس کے پاس بھی کمیٹی فنڈ کے اکاؤنٹ کی جانچ پڑتال اور اکاؤنٹ سے ضرورت پڑنے پر مطلوبہ رقم نکالنے کے اختیارات اور انتظامات ہوں گے۔',
    contentEn: 'Due to the sensitivity of finances, an assistant accountant will be designated to audit and co-manage withdrawals and reporting alongside the Treasurer.',
    category: 'general'
  },
  {
    id: 14,
    titleUrdu: 'قاعدہ 14: [آن لائن بینکنگ ادائیگی اور رسید]',
    titleEn: 'Rule 14: [HBL Online Banking & Digital Receipt Proof]',
    contentUrdu: 'اس بات کی حتی الامکان کوشش کی جائے کہ ممبران تمام تر ادائیگیاں حبیب بینک لمیٹڈ (HBL)، راست (Raast) یا HBL موبائل ایپ کے ذریعے محمد اقبال کے آفیشل اکاؤنٹ میں منتقل کریں اور رسید کا اسکرین شاٹ واٹس ایپ +923469100998 پر ضرور شیئر کریں تاکہ ریکارڈ میں فوری اندراج ہو سکے۔ نقد ادائیگیاں کافی مسائل پیدا کر سکتی ہیں۔',
    contentEn: 'Members should strictly utilize Habib Bank Limited (HBL) Online Banking, HBL Mobile App, IBAN or Raast to Muhammad Iqbal’s official account and share transaction screenshots to WhatsApp (+923469100998) for immediate digital receipt issuance.',
    category: 'contributions'
  },
  {
    id: 15,
    titleUrdu: 'قاعدہ 15: [ممبرشپ کا خاتمہ اور جمع رقم]',
    titleEn: 'Rule 15: [Membership Termination & Non-Refundability]',
    contentUrdu: 'اگر کوئی ممبر خود اپنی ممبرشپ ختم کرنا چاہتا ہے یا اس کے ذمہ بقایا واجب الادا اقساط کی تعداد چار سے تجاوز کر جائیں تو کمیٹی کی مشاورت سے اس کی ممبرشپ ختم کی جا سکتی ہے۔ اس صورت میں وہ کسی بھی جمع شدہ رقم کا مطالبہ نہیں کر سکتا کیونکہ اس فنڈ میں رقم صدقے کی نیت سے جمع کی جا رہی ہے اور شریعت کی رو سے صدقہ واپس مانگنا گناہ ہے۔',
    contentEn: 'Membership terminates if a member voluntarily resigns or exceeds 4 overdue installments. Past contributions cannot be refunded as they are given under Islamic Sadqah intention.',
    category: 'membership'
  },
  {
    id: 16,
    titleUrdu: 'قاعدہ 16: [قریبی رشتہ داروں کی ضمانت]',
    titleEn: 'Rule 16: [Guarantorship for Close Relatives]',
    contentUrdu: 'یہ فنڈ قریبی رشتہ داروں کے مابین غم و پریشانی کی صورت میں ایک دوسرے کی مدد و تعاون کے لیے قائم کیا گیا ہے جن کے ساتھ ہمارا لازمی آنا جانا ہے۔ تاہم کوئی ممبر اپنے کسی قریبی رشتہ دار جیسے بہنوئی / بھانجے یا کزن وغیرہ کو اپنی ضمانت پر کمیٹی ممبران کے مشورے سے اس فنڈ میں شامل کر سکتا ہے۔ اس غیر متعلقہ ممبر کی ماہانہ چندہ کی ذمہ داری مکمل طور پر ضمانت دینے والے ممبر پر ہوگی۔',
    contentEn: 'A member may sponsor a close relative (e.g. brother-in-law, nephew, cousin) with committee approval, remaining fully responsible as guarantor for their monthly dues.',
    category: 'membership'
  },
  {
    id: 17,
    titleUrdu: 'قاعدہ 17: [شادی کے بعد الگ ممبرشپ]',
    titleEn: 'Rule 17: [Independent Membership After Marriage]',
    contentUrdu: 'کسی ممبر کے خاندان کے غیر شادی شدہ فرد کی شادی ہونے پر وہ فرد فوری طور پر اس ممبر کے خاندان سے نکل جائے گا۔ چونکہ اب وہ ایک الگ خاندان ہے اس لیے اسے خود کو اس کمیٹی فنڈ میں مقررہ کردہ ایک مہینے کا چندہ جمع کر کے رجسٹرڈ کرنا ہوگا۔ بصورتِ دیگر اس کو والد یا خاندان کے سربراہ کی ممبرشپ کی وجہ سے فنڈ سے امداد نہیں دیا جائے گا۔',
    contentEn: 'Upon marriage, a dependant immediately forms a separate household and must register independently with their own monthly due; they are no longer covered under their parents.',
    category: 'membership'
  },
  {
    id: 18,
    titleUrdu: 'قاعدہ 18: [پیشگی ممبرشپ کی شرط]',
    titleEn: 'Rule 18: [Prior Membership Requirement]',
    contentUrdu: 'فنڈ سے مستفید ہونے کے لیے پہلے سے کمیٹی فنڈ کا ممبر ہونا لازمی ہے۔ اس لیے کسی کو اس کے خاندان میں فوتگی کے وقت کمیٹی میں شامل کر کے امداد نہیں دیا جائے گا، اگرچہ وہ تمام بقایا اقساط یک مشت جمع کرنے پر تیار ہو۔',
    contentEn: 'Prior active membership is strictly mandatory to receive benefits. Emergency enrollment at the exact time of death is not permitted, even if lump sum payment is offered.',
    category: 'membership'
  },
  {
    id: 19,
    titleUrdu: 'قاعدہ 19: [بیوہ یا طلاق یافتہ کی شمولیت]',
    titleEn: 'Rule 19: [Inclusion of Widowed or Divorced Dependents]',
    contentUrdu: 'کسی ممبر کے خاندان میں ایسی شادی شدہ بیٹی یا بہن جو بیوہ یا طلاق یافتہ ہونے کے بعد اس کے ساتھ رہتی ہو اور اس کے نان نفقہ کی پوری ذمہ داری اس ممبر پر ہو، اس ممبر کے خاندان کا حصہ تصور ہوگی۔',
    contentEn: 'A widowed or divorced daughter/sister living with a member and dependent on them for daily sustenance will be deemed fully covered under that member’s household.',
    category: 'membership'
  }
];

export const importantNote = {
  urdu: 'ان قواعد و ضوابط کو تمام ممبران اور مشیران کے مشورے اور اتفاقِ رائے سے تجویز کیا گیا ہے۔ پھر بھی کسی ممبر کی کوئی تجویز ہو یا کسی بھی اصول پر کوئی اعتراض ہو تو وہ اپنی تجاویز اور اعتراضات کمیٹی کے سامنے رکھ سکتا ہے۔',
  en: 'These rules and regulations have been formulated through collective consensus among all members and advisors. Any member having suggestions or objections may formally present them before the committee.'
};
