// داده نمونه اپ جامع میلی (ساختگی، برای نمایش)
// قیمت‌ها: بازار ایران، شنبه ۲۳ آبان ۱۴۰۵ حدود ساعت ۱۲
// میلی: milli.gold · رمزارز: میانه صرافی‌های ایرانی · ربع‌سکه، نقره، مس و صندوق طلا: tgju · فولاد: alanchand
export const PRICE = 24898; // قیمت هر میلی (یک میلی‌گرم طلای ۱۸) به تومان
export const PRICE_CHANGE = 0.3; // درصد تغییر ۲۴ ساعت

export const user = {
  name: 'علی رضایی',
  phone: '۰۹۱۲ ۳۴۵ ۶۷۸۹',
  accounts: [
    { id: 'personal', label: 'حساب شخصی' },
    { id: 'business', label: 'کافه نارنج', sub: 'حساب بیزینس' },
    { id: 'family', label: 'خانواده رضایی', sub: 'حساب خانواده' },
  ],
};

// فهرست کامل سایر دارایی‌ها با مقدار نمونه «سبد پر» (قیمت هر واحد = ارزش ÷ مقدار در UNITS)
export const fullAssets = [
  { id: 'silver', name: 'نقره', sub: '۴۱۰ گرم', group: 'فلزات', value: 187361800, change: -0.2, color: '#c9ced6' },
  { id: 'coin', name: 'سکه', sub: 'ربع‌سکه · ۱ عدد', group: 'فلزات', value: 72840000, change: 0.5, color: '#f2c14e' },
  { id: 'copper', name: 'مس', sub: '۲٫۸ کیلوگرم', group: 'فلزات', value: 10166489, change: 0, color: '#c8743f' },
  { id: 'goldfund', name: 'صندوق طلای میلی', sub: '۴۸٬۰۰۰ واحد', group: 'صندوق', value: 106512000, change: 0, color: '#2a49e8' },
  { id: 'income', name: 'صندوق درآمد ثابت', sub: 'سود روزشمار ۲۰٪ سالانه', group: 'صندوق', value: 60000000, change: 0.1, color: '#5470ff' },
  { id: 'millix', name: 'میلیکس', sub: '۲٬۰۰۰ MLX', group: 'رمزارز', value: 49796000, change: 0.3, color: '#ffd66b', peg: true }, // توکن میلی: هر MLX معادل یک میلی
  { id: 'btc', name: 'بیت‌کوین', sub: '۰٫۰۱۸ BTC', group: 'رمزارز', value: 328161551, change: -2.5, color: '#f7931a' },
  { id: 'eth', name: 'اتریوم', sub: '۰٫۳۵ ETH', group: 'رمزارز', value: 180736031, change: -1.7, color: '#8c8cf0' },
  { id: 'usdt', name: 'تتر', sub: '۱۲۶ USDT', group: 'رمزارز', value: 34220529, change: 0.3, color: '#26a17b' },
  { id: 'foolad', name: 'فولاد مبارکه', sub: '۲۰٬۰۰۰ سهم', group: 'سهام', value: 10020000, change: 1.2, color: '#3b82f6' },
];
// کاربر نمونه فقط این چند دارایی را دارد؛ بقیه با اولین خرید به فهرستش اضافه می‌شوند
export const HELD = ['millix', 'usdt', 'coin'];

export const initialState = {
  milli: 14750, // موجودی میلی
  rial: 24600000, // کیف پول ریالی به تومان
  rewardsMonth: 56, // پاداش این ماه به میلی
  assets: fullAssets.map((a) => (HELD.includes(a.id) ? a : { ...a, value: 0 })),
  jars: [
    { id: 'home', name: 'خرید خانه', icon: '🏠', saved: 15600, goal: 210000, auto: 'ماهانه ۶۰ میلی' },
    { id: 'trip', name: 'سفر نوروز', icon: '✈️', saved: 540, goal: 1200, auto: 'هفتگی ۳۰ میلی' },
    { id: 'dowry', name: 'جهیزیه سارا', icon: '🎁', saved: 930, goal: 15000, auto: 'هفتگی ۲۰ میلی' },
    { id: 'north', name: 'سفر شمال', icon: '🏖️', saved: 720, goal: 1800, auto: 'گروهی · ۴ نفر', group: true },
  ],
  tx: [
    { id: 1, title: 'کافه لمیز', sub: 'پرداخت QR · امروز ۹:۱۲', milli: -17, icon: 'qr' },
    { id: 2, title: 'سارا احمدی', sub: 'دریافت · دیروز', milli: 300, icon: 'in' },
    { id: 3, title: 'پاداش خرید', sub: 'کارت میلی · دیروز', milli: 1, icon: 'gift' },
    { id: 4, title: 'قبض برق', sub: 'قبض · ۱۸ آبان', milli: -36, icon: 'bill' },
    { id: 5, title: 'خرید میلی', sub: 'از کیف پول ریالی · ۱۷ آبان', milli: 600, icon: 'buy' },
  ],
  credit: { limit: 80000000, used: 30000000, score: 'A', rate: 23 },
  backing: ['milli', 'usdt', 'rial'],
  roundup: { on: true, step: 10000, mult: 1, saved: 19, dest: 'milli' }, // خرده‌پول به میلی
  salary: { on: true, milli: 20, jar: 10, fund: 0 }, // تقسیم حقوق (درصد)
  protect: { face: true, places: true, delay: false, limit: 1500 }, // محافظت از دارایی
  locks: [], // طلای مسدود در سود طلایی
  splits: [{ id: 's1', title: 'تولد مریم', total: 720, people: 3, paid: 2 }], // دنگ‌های باز
};

export const contacts = [
  { id: 'sara', name: 'سارا احمدی', initial: 'س', color: '#f59e0b' },
  { id: 'reza', name: 'رضا کریمی', initial: 'ر', color: '#3b82f6' },
  { id: 'maryam', name: 'مریم نوری', initial: 'م', color: '#ec4899' },
  { id: 'hamid', name: 'حمید صالحی', initial: 'ح', color: '#22c55e' },
  { id: 'neda', name: 'ندا رحیمی', initial: 'ن', color: '#a855f7' },
];

export const bills = [
  { id: 'elec', name: 'برق', sub: 'شناسه ۸۸۲۱ ۰۴۵', toman: 897600, icon: 'zap' },
  { id: 'gas', name: 'گاز', sub: 'شناسه ۴۱۰۲ ۷۷۸', toman: 418880, icon: 'flame' },
  { id: 'water', name: 'آب', sub: 'شناسه ۲۲۹۰ ۱۱۳', toman: 224400, icon: 'drop' },
  { id: 'mobile', name: 'تلفن همراه', sub: '۰۹۱۲ ۳۴۵ ۶۷۸۹', toman: 351560, icon: 'phone' },
];

export const merchants = [
  { name: 'کافه لمیز', sub: 'کافه · ۳۰۰ متر', reward: '۲٪' },
  { name: 'افق کوروش', sub: 'فروشگاه · ۵۰۰ متر', reward: '۱٪' },
  { name: 'میلی گالری', sub: 'طلا و جواهر · ۱٫۲ کیلومتر', reward: '۳٪' },
];

export const backingLabels = {
  milli: { name: 'میلی', color: '#FBB918' },
  usdt: { name: 'تتر', color: '#26a17b' },
  rial: { name: 'کیف پول ریالی', color: '#9ca3af' },
  btc: { name: 'بیت‌کوین', color: '#f7931a' },
  millix: { name: 'میلیکس', color: '#ffd66b' },
  goldfund: { name: 'صندوق طلای میلی', color: '#2a49e8' },
  income: { name: 'صندوق درآمد ثابت', color: '#5470ff' },
  silver: { name: 'نقره', color: '#c9ced6' },
};

// واحد هر دارایی (ارزش ÷ مقدار = قیمت روز هر واحد)
// نقره ۴۵۶٬۹۸۰ ت/گرم · ربع‌سکه ۷۲٬۸۴۰٬۰۰۰ · مس ۳٬۶۳۰٬۸۸۹ ت/کیلو (۱۳٬۳۴۵ دلار در تن × دلار ۲۷۲٬۰۸۵)
// میلیکس (MLX) توکن میلی است و قیمتش همان قیمت هر میلی است
// صندوق طلا ۲٬۲۱۹ ت/واحد (جام طلا) · BTC ۱۸٬۲۳۱٬۱۹۷٬۳۰۳ · ETH ۵۱۶٬۳۸۸٬۶۵۹ · USDT ۲۷۱٬۵۹۲ · فولاد ۵۰۱ ت/سهم
export const UNITS = {
  silver: { qty: 410, u: 'گرم', dec: 1 },
  coin: { qty: 1, u: 'ربع‌سکه', dec: 2 },
  copper: { qty: 2.8, u: 'کیلوگرم', dec: 2 },
  goldfund: { qty: 48000, u: 'واحد', dec: 0 },
  millix: { qty: 2000, u: 'MLX', dec: 2 },
  btc: { qty: 0.018, u: 'BTC', dec: 8 },
  eth: { qty: 0.35, u: 'ETH', dec: 6 },
  usdt: { qty: 126, u: 'USDT', dec: 2 },
  foolad: { qty: 20000, u: 'سهم', dec: 0 },
};

// کارمزد تبدیل (درصد). میلی: جدول کارمزد milli.gold (خرید و فروش ۰٫۵٪، حداقل ۱ میلی).
// سایر دارایی‌ها عدد نمونه‌اند و منبع ندارند. تبدیل به میلی همیشه بدون کارمزد است.
// هر تبدیل یک کارمزد دارد و از مبدا کم می‌شود.
export const FEES = {
  milli: 0.5, rial: 0,
  silver: 0.5, coin: 0.5, copper: 0.5, foolad: 0.5,
  goldfund: 0.3, income: 0.3,
  btc: 0.4, eth: 0.4, usdt: 0.4, millix: 0.4, // میلی به میلیکس و برعکس: بدون کارمزد (convFee)
};
export const MILLI_MIN_FEE = 1; // حداقل کارمزد میلی

// ─── کاربر نمونه قابل انتخاب (آزمون کاربر، پارامتر persona) ───
// only: فقط میلی (حالت بیشتر کاربران) · multi: چند دارایی (حالت پیش‌فرض موکاپ) · new: تازه‌وارد با موجودی صفر
export function personaState(base, persona) {
  const noAssets = base.assets.map((a) => ({ ...a, value: 0 }));
  if (persona === 'only') return { ...base, assets: noAssets, backing: ['milli', 'rial'] };
  if (persona === 'new') {
    return {
      ...base,
      milli: 0, rial: 0, rewardsMonth: 0, assets: noAssets, jars: [], tx: [], locks: [], splits: [], installments: [],
      credit: { ...base.credit, limit: 0, used: 0 }, backing: ['milli', 'rial'],
      roundup: { ...base.roundup, saved: 0 },
    };
  }
  return base;
}
