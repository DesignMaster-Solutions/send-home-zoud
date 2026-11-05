// Every line Send Home shows, in English and Arabic (RTL). No DOM: game.js and tests/i18n.test.mjs share it.
// The Arabic was drafted with an AI assistant; a native-speaker review is in the budget before any release outside the jam.
export const LANGS = ['en', 'ar'];
export const STORAGE_KEY = 'sendhome.lang';

export function pickLang(search, stored, deviceLang = '') {
  const q = new URLSearchParams(search).get('lang');
  if (LANGS.includes(q)) return q;
  if (LANGS.includes(stored)) return stored;
  return /^ar\b/i.test(deviceLang) ? 'ar' : 'en';
}

// Home corridors. Mid-market rates are fixed for the game; date and source in README "Facts and sources".
export const CORRIDORS = {
  // mid: open.er-api.com, 04/11/2026. rpw: World Bank Remittance Prices Worldwide, Q1 2025, average total cost of sending AED 735.
  india: { cur: 'INR', mid: 25.82, rpw: 3.68, en: 'India', ar: 'الهند', sym: '₹' },
  pakistan: { cur: 'PKR', mid: 75.36, rpw: 1.42, en: 'Pakistan', ar: 'باكستان', sym: 'Rs ' },
  philippines: { cur: 'PHP', mid: 17.30, rpw: 3.04, en: 'the Philippines', ar: 'الفلبين', sym: '₱' },
};

export const STR = {
  title: ['SEND HOME', 'أرسِلها إلى البيت'],
  pitch: ['You work in Dubai. Your family lives in {home}. Twelve paydays. Every dirham you send has to arrive.',
    'تعمل في دبي وعائلتك في {home}. اثنا عشر راتباً، وكل درهم ترسله يجب أن يصل.'],
  how1: ['Split each salary: what you send, and what you keep as a cushion for trouble here.',
    'قسّم كل راتب: ما ترسله، وما تحتفظ به احتياطاً لمتاعب هنا.'],
  how2: ['On the street of counters, read fee and rate. What counts is what your family receives.',
    'في شارع محلات الصرافة اقرأ الرسوم والسعر. المهم هو ما تستلمه عائلتك.'],
  how3: ['The counters close for Friday prayer at 12:45. Asking for a quote takes 2 minutes.',
    'تُغلق المحلات لصلاة الجمعة عند 12:45. السؤال عن عرض يستغرق دقيقتين.'],
  homeIs: ['Family in', 'العائلة في'],
  start: ['Start the year', 'ابدأ السنة'],
  settings: ['Settings, saved on this device', 'الإعدادات، تُحفظ على هذا الجهاز'],
  a11y_large: ['Large text', 'نص كبير'],
  a11y_contrast: ['High contrast', 'تباين عالٍ'],
  a11y_calm: ['Calm (no clock)', 'هادئ (بلا ساعة)'],
  a11y_plain: ['Plain words', 'كلمات بسيطة'],
  a11y_mute: ['Sound off', 'بلا صوت'],
  payday: ['Payday {n} of 12', 'الراتب {n} من 12'],
  cushion: ['Cushion', 'الاحتياطي'],
  debt: ['Salary advance owed', 'سلفة الراتب المستحقة'],
  atHome: ['At home', 'في البيت'],
  salary: ['Salary', 'الراتب'],
  bills: ['Rent share, food, transport', 'حصة الإيجار والطعام والمواصلات'],
  repaid: ['Salary advance repaid', 'سداد سلفة الراتب'],
  lateSalary: ['Your salary is a month late this time. The bills here are not.', 'تأخّر راتبك شهراً هذه المرة، أما الفواتير هنا فلم تتأخّر.'],
  backPay: ['Back pay from last month arrived', 'وصل راتب الشهر الماضي المتأخر'],
  em_phone: ['Your phone screen broke, and you need it for work', 'انكسرت شاشة هاتفك وأنت تحتاجه للعمل'],
  em_clinic: ['Clinic visit your insurance does not cover', 'زيارة عيادة لا يغطيها تأمينك'],
  em_visa: ['Your rent share went up', 'ارتفعت حصتك من الإيجار'],
  paidCushion: ['paid from your cushion', 'دُفعت من احتياطيك'],
  borrowed: ['{x} borrowed as a salary advance, charge {c}', 'اقترضت {x} سلفة على الراتب، بتكلفة {c}'],
  msgFrom: ['Message from home', 'رسالة من البيت'],
  need_school: ['School fees for your daughter', 'الرسوم المدرسية لابنتك'],
  need_roof: ['Fix the roof before the rains', 'إصلاح السقف قبل الأمطار'],
  need_wedding: ['Your cousin\'s wedding gift', 'هدية زفاف ابن عمك'],
  need_hospital: ['Your father\'s hospital bill', 'فاتورة مستشفى والدك'],
  dueOn: ['needed by payday {n}', 'مطلوبة بحلول الراتب {n}'],
  dueNow: ['needed this payday', 'مطلوبة في هذا الراتب'],
  monthly: ['The family lives on {x} a month', 'تعيش العائلة على {x} شهرياً'],
  sendNow: ['Send home now', 'أرسل الآن'],
  keep: ['Keep as cushion', 'احتفظ احتياطياً'],
  toStreet: ['Go to the street', 'اذهب إلى الشارع'],
  keepAll: ['Keep it all', 'احتفظ بالكل'],
  fair: ['Mid-market rate today: 1 AED = {r} {cur}', 'سعر السوق المتوسط اليوم: 1 درهم = {r} {cur}'],
  fairHint: ['Their rate below this is a hidden cost.', 'كل سعر أقل من هذا تكلفة مخفية.'],
  clock: ['Counters close at 12:45', 'تُغلق المحلات عند 12:45'],
  clockFirst: ['First Friday: no clock, take your time. From the next payday the counters close at 12:45.', 'أول جمعة: بلا ساعة، خذ وقتك. من الراتب القادم تُغلق المحلات عند 12:45.'],
  clockCalm: ['Calm mode: no clock, take your time.', 'الوضع الهادئ: بلا ساعة، خذ وقتك.'],
  pause: ['Pause', 'إيقاف'],
  paused: ['Paused. The clock waits for you.', 'متوقف. الساعة تنتظرك.'],
  resume: ['Resume', 'متابعة'],
  fee: ['Fee', 'الرسوم'],
  rate: ['Rate', 'السعر'],
  queue: ['Queue {m} min', 'الطابور {m} دقيقة'],
  noQueue: ['No queue', 'بلا طابور'],
  closed: ['Closed: queue too long', 'مغلق: الطابور طويل'],
  zeroFee: ['ZERO FEE!', 'بلا رسوم!'],
  feeWaived: ['Fee waived today', 'بلا رسوم اليوم'],
  setup: ['First time: ID check {m} min', 'أول مرة: التحقق من الهوية {m} دقيقة'],
  noReceipt: ['Cash, no receipt, better than the bank', 'نقداً، بلا إيصال، أفضل من البنك'],
  c_bank: ['Pearl Street Bank', 'بنك شارع اللؤلؤ'],
  c_saffron: ['Saffron Lane Exchange', 'صرافة درب الزعفران'],
  c_dhow: ['Blue Dhow Money', 'الداو الأزرق للتحويل'],
  c_zero: ['Metro Kiosk', 'كشك المترو'],
  c_app: ['Paper Kite app', 'تطبيق الطائرة الورقية'],
  c_informal: ['A friend of a friend, on the phone', 'صديق لصديق، على الهاتف'],
  c_informal_again: ['Another friend of a friend, new number', 'صديق آخر لصديق، رقم جديد'],
  quote: ['Ask for a quote', 'اطلب عرضاً'],
  quoteFor: ['For {x}, your family receives', 'مقابل {x}، تستلم عائلتك'],
  sendHere: ['Send here', 'أرسل من هنا'],
  back: ['Look elsewhere', 'ابحث في مكان آخر'],
  timeUp: ['12:45. The counters are closed for prayer. The money waits for next payday.',
    '12:45. أُغلقت المحلات للصلاة. المال ينتظر الراتب القادم.'],
  receipt: ['Receipt', 'الإيصال'],
  rSent: ['You paid', 'دفعت'],
  rFee: ['Fee', 'الرسوم'],
  rRate: ['Their rate (mid-market {m})', 'سعرهم (السوق المتوسط {m})'],
  rMargin: ['Hidden in the rate (exchange-rate margin)', 'مخفي في السعر (هامش سعر الصرف)'],
  rTotal: ['Total cost', 'التكلفة الإجمالية'],
  rGets: ['Your family receives', 'تستلم عائلتك'],
  rBest: ['Best on the street today: {x} more', 'أفضل عرض في الشارع اليوم: {x} أكثر'],
  rWasBest: ['That was the best deal on the street today.', 'كان هذا أفضل عرض في الشارع اليوم.'],
  rGoal: ['The UN goal for 2030: under 3%.', 'هدف الأمم المتحدة لعام 2030: أقل من 3%.'],
  rReal: ['Real average from the UAE to {home} for AED 735: {p}% (World Bank, early 2025).',
    'المتوسط الحقيقي من الإمارات إلى {home} لمبلغ 735 درهماً: {p}% (البنك الدولي، مطلع 2025).'],
  rInformalOk: ['No receipt. This time it arrived.', 'بلا إيصال. هذه المرة وصل المال.'],
  rInformalLost: ['The number does not answer any more. {x} never arrived, and there is no receipt to claim it.',
    'الرقم لم يعد يجيب. لم يصل {x}، ولا يوجد إيصال للمطالبة به.'],
  next: ['Next', 'التالي'],
  homeNews: ['News from home', 'أخبار من البيت'],
  needMet: ['{need}: paid. They sent a photo.', '{need}: دُفعت. أرسلوا صورة.'],
  needMissed: ['{need}: not enough arrived in time.', '{need}: لم يصل ما يكفي في الوقت.'],
  cap_title: ['You work in Dubai and your family lives in {home}. One year, twelve paydays.', 'تعمل في دبي وعائلتك في {home}. سنة واحدة، اثنا عشر راتباً.'],
  cap_payday: ['Each payday: choose what to send home and what to keep as a cushion here.', 'في كل راتب: اختر ما ترسله إلى البيت وما تحتفظ به احتياطاً هنا.'],
  cap_zero: ['The loud kiosk shouts ZERO FEE. Its rate is the lowest on the street.', 'الكشك الصاخب ينادي بلا رسوم. لكن سعره الأدنى في الشارع.'],
  cap_compare: ['What counts is what the family receives. Ask, compare, then send.', 'المهم ما تستلمه العائلة. اسأل وقارن ثم أرسل.'],
  cap_receipt: ['The receipt: the fee plus the margin hidden in the rate, against the mid-market rate.', 'الإيصال: الرسوم مع الهامش المخفي في السعر، مقارنةً بسعر السوق المتوسط.'],
  cap_news: ['News from home: did the money cover what they needed?', 'أخبار من البيت: هل غطى المال ما يحتاجونه؟'],
  cap_phone: ['A friend of a friend on the phone: a better rate in cash, no receipt.', 'صديق لصديق على الهاتف: سعر أفضل نقداً، بلا إيصال.'],
  cap_lost: ['This time the money never arrived. No receipt, nothing to claim.', 'هذه المرة لم يصل المال. لا إيصال، ولا شيء للمطالبة به.'],
  cap_end: ['The year is over: what reached home, and what was lost on the way.', 'انتهت السنة: ما وصل إلى البيت، وما ضاع في الطريق.'],
  short: ['The family went short this month by {x}.', 'نقص على العائلة هذا الشهر {x}.'],
  shortCost: ['The family went short this month by {x}: the fee and the rate took that. Next time send a little more than they need.',
    'نقص على العائلة هذا الشهر {x}: هذا ما أخذته الرسوم والسعر. في المرة القادمة أرسل أكثر قليلاً مما يحتاجون.'],
  spent: ['Of what was left at home, {x} went on everyday things. Money sitting idle gets spent.', 'مما بقي في البيت، ذهب {x} على أشياء يومية. المال الذي ينتظر يُصرف.'],
  eShort: ['Months the family went short', 'أشهر نقص فيها المال على العائلة'],
  fine: ['The family had what they needed this month.', 'كان لدى العائلة ما تحتاجه هذا الشهر.'],
  endTitle: ['The year is over', 'انتهت السنة'],
  end_thriving: ['Home is safe, and so are you', 'البيت بأمان، وأنت كذلك'],
  end_home: ['Everything reached home', 'وصل كل شيء إلى البيت'],
  end_standing: ['You kept standing', 'بقيت صامداً'],
  end_hard: ['A hard year', 'سنة صعبة'],
  endSub_thriving: ['Every need was paid and you still hold a cushion of {x}.', 'دُفعت كل الحاجات وما زال لديك احتياطي {x}.'],
  endSub_home: ['Every need was paid. Next year, a bigger cushion would let you breathe.', 'دُفعت كل الحاجات. في السنة القادمة، احتياطي أكبر يمنحك راحة.'],
  endSub_standing: ['Not everything arrived in time, but you end the year without debt.', 'لم يصل كل شيء في وقته، لكنك تنهي السنة بلا دين.'],
  endSub_hard: ['Debt here and needs missed at home. Reading the board and keeping a cushion would change this.',
    'دين هنا وحاجات فاتت في البيت. قراءة اللوحة والاحتفاظ باحتياطي يغيّران ذلك.'],
  eReached: ['Reached home', 'وصل إلى البيت'],
  eCosts: ['Lost to fees and rates', 'ضاع في الرسوم والأسعار'],
  eInformal: ['Lost with no receipt', 'ضاع بلا إيصال'],
  eAdvance: ['Paid for salary advances', 'دُفع على سلف الراتب'],
  eNeeds: ['Needs paid at home', 'حاجات دُفعت في البيت'],
  again: ['Play again', 'العب مرة أخرى'],
};

export function t(key, lang, vars = {}) {
  const row = STR[key];
  if (!row) throw new Error(`missing string ${key}`);
  let s = row[lang === 'ar' ? 1 : 0];
  for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
}

// Money: AED for the player, the home currency for the family. Latin digits in both languages (read the same on receipts).
export function aed(x, lang) {
  const n = Math.round(x).toLocaleString('en-US');
  return lang === 'ar' ? `${n} درهم` : `AED ${n}`;
}
export function home(x, corridor) {
  const c = CORRIDORS[corridor];
  return `${c.sym}${Math.round(x).toLocaleString('en-US')}`;
}
