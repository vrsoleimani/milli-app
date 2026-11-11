import { PRICE } from './data.js';

export const fa = (n, d = 0) =>
  Number(n).toLocaleString('fa-IR', { maximumFractionDigits: d, minimumFractionDigits: 0 });

export const HIDDEN = '••••••';

// تبدیل تومان به میلی
export const toMilli = (toman) => toman / PRICE;
export const toToman = (milli) => milli * PRICE;

// نمایش یک مبلغ (ورودی به تومان) در واحد انتخابی
export function money(toman, unit, hidden, opts = {}) {
  if (hidden) return HIDDEN;
  if (unit === 'milli') return `${fa(Math.round(toMilli(toman)))} میلی`;
  return `${fa(Math.round(toman))} تومان`;
}

// نمایش مقدار میلی در واحد انتخابی
export function milliIn(milli, unit, hidden, d = 0) {
  if (hidden) return HIDDEN;
  if (unit === 'milli') return `${fa(milli, d)} میلی`;
  return `${fa(Math.round(toToman(milli)))} تومان`;
}

export const pct = (n) => `${n >= 0 ? '' : '−'}${fa(Math.abs(n), 1)}٪`;
