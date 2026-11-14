// داده نمونه اپ جامع میلی (ساختگی، برای نمایش)
export const PRICE = 7480; // قیمت هر میلی به تومان
export const PRICE_CHANGE = 0.8; // درصد تغییر ۲۴ ساعت

export const user = {
  name: 'علی رضایی',
  phone: '۰۹۱۲ ۳۴۵ ۶۷۸۹',
  accounts: [
    { id: 'personal', label: 'حساب شخصی' },
    { id: 'business', label: 'کافه نارنج', sub: 'حساب بیزینس' },
    { id: 'family', label: 'خانواده رضایی', sub: 'حساب خانواده' },
  ],
};

export const initialState = {
  milli: 14750, // موجودی میلی
  rial: 24600000, // کیف پول ریالی به تومان
  rewardsMonth: 186, // پاداش این ماه به میلی
  assets: [
    { id: 'silver', name: 'نقره', sub: '۴۱۰ گرم', group: 'فلزات', value: 6200000, change: 1.4, color: '#c9ced6' },
    { id: 'coin', name: 'سکه', sub: 'ربع‌سکه · ۱ عدد', group: 'فلزات', value: 21000000, change: 0.9, color: '#f2c14e' },
    { id: 'copper', name: 'مس', sub: '۲٫۸ کیلوگرم', group: 'فلزات', value: 2100000, change: -0.6, color: '#c8743f' },
    { id: 'goldfund', name: 'صندوق طلای میلی', sub: '۴۸٬۰۰۰ واحد', group: 'صندوق', value: 48500000, change: 1.8, color: '#2a49e8' },
    { id: 'income', name: 'صندوق درآمد ثابت', sub: 'سود روزشمار ۲۰٪ سالانه', group: 'صندوق', value: 60000000, change: 0.1, color: '#5470ff' },
    { id: 'btc', name: 'بیت‌کوین', sub: '۰٫۰۱۸ BTC', group: 'رمزارز', value: 32000000, change: -3.6, color: '#f7931a' },
    { id: 'eth', name: 'اتریوم', sub: '۰٫۳۵ ETH', group: 'رمزارز', value: 9800000, change: 2.2, color: '#8c8cf0' },
    { id: 'usdt', name: 'تتر', sub: '۱۲۶ USDT', group: 'رمزارز', value: 12400000, change: 0.2, color: '#26a17b' },
    { id: 'foolad', name: 'فولاد مبارکه', sub: '۱٬۰۰۰ سهم', group: 'سهام', value: 8420000, change: -1.1, color: '#3b82f6' },
  ],
  jars: [
    { id: 'home', name: 'خرید خانه', icon: '🏠', saved: 52000, goal: 700000, auto: 'ماهانه ۲۰۰ میلی' },
    { id: 'trip', name: 'سفر نوروز', icon: '✈️', saved: 1800, goal: 4000, auto: 'هفتگی ۱۰۰ میلی' },
    { id: 'dowry', name: 'جهیزیه سارا', icon: '🎁', saved: 3100, goal: 50000, auto: 'هفتگی ۶۷ میلی' },
    { id: 'north', name: 'سفر شمال', icon: '🏖️', saved: 2400, goal: 6000, auto: 'گروهی · ۴ نفر', group: true },
  ],
  tx: [
    { id: 1, title: 'کافه لمیز', sub: 'پرداخت QR · امروز ۹:۱۲', milli: -56, icon: 'qr' },
    { id: 2, title: 'سارا احمدی', sub: 'دریافت · دیروز', milli: 1000, icon: 'in' },
    { id: 3, title: 'پاداش خرید', sub: 'کارت میلی · دیروز', milli: 4, icon: 'gift' },
    { id: 4, title: 'قبض برق', sub: 'قبض · ۱۸ آبان', milli: -120, icon: 'bill' },
    { id: 5, title: 'خرید میلی', sub: 'از کیف پول ریالی · ۱۷ آبان', milli: 2000, icon: 'buy' },
  ],
  credit: { limit: 80000000, used: 30000000, score: 'A', rate: 23 },
  backing: ['milli', 'usdt', 'rial', 'btc'],
  roundup: { on: true, step: 10000, mult: 1, saved: 64, dest: 'milli' }, // خرده‌پول به میلی
  salary: { on: true, milli: 20, jar: 10, fund: 0 }, // تقسیم حقوق (درصد)
  protect: { face: true, places: true, delay: false, limit: 5000 }, // محافظت از دارایی
  locks: [], // طلای مسدود در سود طلایی
  splits: [{ id: 's1', title: 'تولد مریم', total: 2400, people: 3, paid: 2 }], // دنگ‌های باز
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
  goldfund: { name: 'صندوق طلای میلی', color: '#2a49e8' },
  income: { name: 'صندوق درآمد ثابت', color: '#5470ff' },
  silver: { name: 'نقره', color: '#c9ced6' },
};

// واحد هر دارایی برای نمایش مقدار (از داده نمونه: ارزش ÷ مقدار = قیمت هر واحد)
export const UNITS = {
  silver: { qty: 410, u: 'گرم', dec: 1 },
  coin: { qty: 1, u: 'ربع‌سکه', dec: 2 },
  copper: { qty: 2.8, u: 'کیلوگرم', dec: 2 },
  goldfund: { qty: 48000, u: 'واحد', dec: 0 },
  btc: { qty: 0.018, u: 'BTC', dec: 8 },
  eth: { qty: 0.35, u: 'ETH', dec: 6 },
  usdt: { qty: 126, u: 'USDT', dec: 2 },
  foolad: { qty: 1000, u: 'سهم', dec: 0 },
};
