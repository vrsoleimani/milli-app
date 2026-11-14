import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Ctx } from './ui.jsx';
import { initialState, PRICE } from './data.js';
import { fa } from './format.js';

export const MONTHS = ['آذر', 'دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان'];

// قسط ماهانه با نرخ سالانه
export function monthly(principal, months, rate = 0.23) {
  const r = rate / 12;
  return Math.round((principal * r) / (1 - Math.pow(1 + r, -months)));
}

const start = {
  ...initialState,
  account: 'personal',
  accounts: [
    { id: 'personal', label: 'حساب شخصی', sub: 'فعال', type: 'personal' },
    { id: 'business', label: 'کافه نارنج', sub: 'حساب بیزینس', type: 'business' },
    { id: 'family', label: 'خانواده رضایی', sub: 'حساب خانواده', type: 'family' },
  ],
  installments: [{ id: 'i1', title: 'خرید اعتباری', monthly: 4200000, left: 7, k: 0, total: 12 }],
  frozen: false,
  settled: false,
  autoRial: true,
};

const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const txOf = (title, sub, milli, icon) => ({ id: Math.random(), title, sub, milli, icon });
const addTx = (s, t) => ({ ...s, tx: [t, ...s.tx] });
const addInst = (s, title, toman, months) => ({
  ...s,
  installments: [...s.installments, { id: `i${Date.now()}`, title, monthly: monthly(toman, months), left: months, k: 0, total: months }],
});
const NO = { error: 'موجودی کافی نیست' };
const SRC = { milli: 'میلی', rial: 'کیف پول ریالی' };
// برداشت از منبع انتخابی (میلی، کیف پول ریالی یا یک دارایی)
function debit(s, source = 'milli', milli) {
  const toman = Math.round(milli * PRICE);
  if (source === 'milli') return milli > s.milli ? null : { ...s, milli: round(s.milli - milli) };
  if (source === 'rial') return toman > s.rial ? null : { ...s, rial: s.rial - toman };
  const a = s.assets.find((x) => x.id === source);
  if (!a || toman > a.value) return null;
  return { ...s, assets: s.assets.map((x) => (x.id === source ? { ...x, value: x.value - toman } : x)) };
}
const srcName = (s, id = 'milli') => SRC[id] || s.assets.find((x) => x.id === id)?.name || 'میلی';

// هر کنش: وضعیت تازه و پیام موفقیت یا خطا
function apply(s, kind, p) {
  switch (kind) {
    case 'buy': {
      const m = round(p.milli), cost = Math.round(m * PRICE);
      if (cost > s.rial) return NO;
      return {
        s: addTx({ ...s, milli: round(s.milli + m), rial: s.rial - cost }, txOf('خرید میلی', 'از کیف پول ریالی · الان', m, 'buy')),
        ok: { title: 'خرید انجام شد', amount: m, sub: `${fa(cost)} تومان از کیف پول ریالی` },
      };
    }
    case 'sell': {
      const m = round(p.milli), t = Math.round(m * PRICE);
      if (m > s.milli) return NO;
      return {
        s: addTx({ ...s, milli: round(s.milli - m), rial: s.rial + t }, txOf('فروش میلی', 'به کیف پول ریالی · الان', -m, 'sell')),
        ok: { title: 'فروش انجام شد', amount: m, sub: `${fa(t)} تومان به کیف پول ریالی واریز شد` },
      };
    }
    case 'send': {
      const m = round(p.milli);
      if (m > s.milli) return NO;
      return { s: addTx({ ...s, milli: round(s.milli - m) }, txOf(p.to, `${p.gift ? `هدیه ${p.gift}` : 'ارسال'} · الان`, -m, p.gift ? 'gift' : 'out')), ok: { title: p.gift ? 'هدیه ارسال شد' : 'ارسال انجام شد', amount: m, sub: p.gift ? `کارت ${p.gift} برای ${p.to}` : `به ${p.to}` } };
    }
    case 'request':
      return { s, ok: { title: 'درخواست ارسال شد', sub: `برای ${p.to}`, hideAmount: true } };
    case 'pay': {
      const d = debit(s, p.source, p.milli);
      if (!d) return NO;
      const t = addTx({ ...d, milli: round(d.milli + p.reward), rewardsMonth: s.rewardsMonth + p.reward }, txOf(p.to, `پرداخت QR · از ${srcName(s, p.source)} · الان`, -p.milli, 'qr'));
      return { s: t, ok: { title: 'پرداخت انجام شد', amount: p.milli, sub: `به ${p.to}`, reward: p.reward } };
    }
    case 'payItem': {
      const m = round(p.milli, 1);
      const d = debit(s, p.source, m);
      if (!d) return NO;
      const reward = round(m * (p.rate ?? 0.01), 1);
      let n = { ...d, milli: round(d.milli + reward), rewardsMonth: round(s.rewardsMonth + reward, 1) };
      if (p.kind === 'installment') {
        n.credit = { ...s.credit, used: Math.max(0, s.credit.used - p.toman) };
        n.installments = s.installments.map((i) => (i.id === p.instId ? { ...i, left: i.left - 1, k: i.k + 1 } : i)).filter((i) => i.left > 0);
      }
      n = addTx(n, txOf(p.title, `${p.txSub || 'پرداخت'} · الان`, -m, p.icon || 'shop'));
      return { s: n, ok: { title: p.successTitle || 'پرداخت انجام شد', amount: m, sub: p.sub, reward } };
    }
    case 'bills': {
      const m = round(p.milli, 1);
      if (m > s.milli) return NO;
      const reward = round(m * 0.01, 1);
      return {
        s: addTx({ ...s, milli: round(s.milli - m + reward), rewardsMonth: round(s.rewardsMonth + reward, 1) }, txOf('قبض و شارژ', 'پرداخت ۴ قبض · الان', -m, 'bill')),
        ok: { title: 'قبض‌ها پرداخت شد', amount: m, sub: 'هر چهار قبض', reward },
      };
    }
    case 'convert': {
      const name = (id) => srcName(s, id);
      const t = Math.round(p.toman), m = round(p.milli ?? t / PRICE);
      const nt = Math.round(p.net ?? t), nm = round(nt / PRICE); // دریافتی بعد از کارمزد
      const d = debit(s, p.from, p.milli ?? t / PRICE);
      if (!d || !t) return NO;
      let n = d;
      if (p.to === 'milli') n = { ...n, milli: round(n.milli + nm) };
      else if (p.to === 'rial') n = { ...n, rial: n.rial + nt };
      else n = { ...n, assets: n.assets.map((x) => (x.id === p.to ? { ...x, value: x.value + nt } : x)) };
      const sign = p.from === 'milli' ? -m : nm;
      const feeTxt = p.fee ? ` · ${p.fee}` : '';
      return {
        s: addTx(n, txOf(`تبدیل ${name(p.from)} به ${name(p.to)}`, `تبدیل · الان${feeTxt}`, sign, p.from === 'milli' ? 'sell' : 'buy')),
        ok: p.to === 'milli'
          ? { title: 'تبدیل انجام شد', amount: nm, sub: `از ${name(p.from)}${feeTxt}` }
          : { title: 'تبدیل انجام شد', toman: nt, qty: p.outText, qtyUnit: p.outUnit, sub: `از ${name(p.from)} · ≈ ${fa(nt)} تومان${feeTxt}` },
      };
    }
    case 'jar':
      return {
        s: { ...s, jars: [...s.jars, { id: `j${Date.now()}`, name: p.name, icon: p.icon, saved: 0, goal: 36000, auto: p.group ? `گروهی · ${fa(p.group + 1)} نفر` : `${p.freq} ${p.per} میلی`, group: !!p.group }] },
        ok: { title: 'قلک ساخته شد', sub: p.name, hideAmount: true },
      };
    case 'lock': {
      const m = round(p.milli);
      if (m > s.milli) return NO;
      return {
        s: addTx({ ...s, milli: round(s.milli - m), locks: [...(s.locks || []), { id: `l${Date.now()}`, milli: m, months: p.months }] }, txOf('سود طلایی', `مسدود برای ${fa(p.months)} ماه · الان`, -m, 'buy')),
        ok: { title: 'سود طلایی فعال شد', amount: m, sub: `ماهانه ${fa(round(m * 0.01, 1), 1)} میلی سود · ${fa(p.months)} ماه` },
      };
    }
    case 'split':
      return {
        s: { ...s, splits: [{ id: `s${Date.now()}`, title: p.title, total: p.total, people: p.people, paid: 0 }, ...s.splits] },
        ok: { title: 'درخواست دنگ ارسال شد', amount: round(p.total / (p.people + 1), 1), sub: `سهم هر نفر · ${p.title} · ${fa(p.people)} نفر` },
      };
    case 'creditUp':
      return { s: { ...s, credit: { ...s.credit, limit: p.limit } }, ok: { title: 'سقف اعتبار بالا رفت', sub: `سقف تازه ${fa(p.limit / 1e6)} میلیون تومان`, hideAmount: true } };
    case 'buyAsset': {
      if (p.toman > s.rial) return NO;
      const a = s.assets.find((x) => x.id === p.id);
      return {
        s: addTx({ ...s, rial: s.rial - p.toman, assets: s.assets.map((x) => (x.id === p.id ? { ...x, value: x.value + p.toman } : x)) }, txOf(`خرید ${a.name}`, 'از کیف پول ریالی · الان', -round(p.toman / PRICE), 'buy')),
        ok: { title: 'خرید انجام شد', toman: p.toman, sub: a.name },
      };
    }
    case 'sellAsset': {
      const a = s.assets.find((x) => x.id === p.id);
      if (p.toman > a.value) return NO;
      return {
        s: addTx({ ...s, rial: s.rial + p.toman, assets: s.assets.map((x) => (x.id === p.id ? { ...x, value: x.value - p.toman } : x)) }, txOf(`فروش ${a.name}`, 'به کیف پول ریالی · الان', round(p.toman / PRICE), 'sell')),
        ok: { title: 'فروش انجام شد', toman: p.toman, sub: a.name },
      };
    }
    case 'deposit':
      return { s: { ...s, rial: s.rial + p.toman }, ok: { title: 'واریز انجام شد', toman: p.toman, sub: 'به کیف پول ریالی' } };
    case 'withdraw':
      if (p.toman > s.rial) return NO;
      return { s: { ...s, rial: s.rial - p.toman }, ok: { title: 'برداشت انجام شد', toman: p.toman, sub: 'از کیف پول ریالی' } };
    case 'loan': {
      const left = s.credit.limit - s.credit.used;
      if (p.toman > left) return NO;
      const n = addInst({ ...s, rial: s.rial + p.toman, credit: { ...s.credit, used: s.credit.used + p.toman } }, 'وام نقدی', p.toman, p.months);
      return { s: addTx(n, txOf('وام نقدی', 'به کیف پول ریالی · الان', round(p.toman / PRICE), 'in')), ok: { title: 'وام واریز شد', toman: p.toman, sub: `${fa(p.months)} قسط ماهانه` } };
    }
    case 'creditPurchase': {
      const left = s.credit.limit - s.credit.used;
      if (p.toman > left) return NO;
      const n = addInst({ ...s, credit: { ...s.credit, used: s.credit.used + p.toman } }, `خرید اعتباری · ${p.merchant}`, p.toman, p.months);
      return { s: addTx(n, txOf(p.merchant, 'خرید اعتباری · الان', -round(p.toman / PRICE), 'shop')), ok: { title: 'خرید اعتباری ثبت شد', toman: p.toman, sub: `${p.merchant} · ${fa(p.months)} قسط` } };
    }
    case 'settle':
      return { s: { ...s, rial: s.rial + p.toman, settled: true }, ok: { title: 'تسویه انجام شد', toman: p.toman, sub: 'به کیف پول ریالی واریز شد' } };
    case 'newAccount':
      return {
        s: { ...s, accounts: [...s.accounts, { id: `a${Date.now()}`, label: p.name, sub: p.type === 'business' ? 'حساب بیزینس' : 'حساب خانواده', type: p.type }] },
        ok: { title: 'حساب تازه ساخته شد', sub: p.name, hideAmount: true },
      };
    case 'cardPin':
      return { s, ok: { title: 'رمز دوم ثبت شد', sub: 'از این پس با همین رمز پرداخت می‌کنی', hideAmount: true } };
    default:
      return { s, ok: { title: 'انجام شد', hideAmount: true } };
  }
}

export function Provider({ children, Screens }) {
  const [state, setState] = useState(start);
  const [unit, setUnitRaw] = useState(() => {
    try { return localStorage.getItem('milli-unit') === 'toman' ? 'toman' : 'milli'; } catch { return 'milli'; }
  });
  const [hidden, setHidden] = useState(false);
  const [nav, setNav] = useState({ tab: 'home', stack: [] });
  const [toastMsg, setToastMsg] = useState(null);
  const timer = useRef();
  const stateRef = useRef(state);
  stateRef.current = state;

  const setUnit = useCallback((u) => {
    setUnitRaw(u);
    try { localStorage.setItem('milli-unit', u); } catch { /* ignore */ }
  }, []);
  const toggleHidden = useCallback(() => setHidden((h) => !h), []);
  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);
  const patch = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), []);

  const go = useCallback((id, params = {}) => {
    if (id.startsWith('tab:')) return setNav({ tab: id.slice(4), stack: [] });
    if (id === 'welcome') return setNav((n) => ({ ...n, stack: [{ id, params, key: Math.random() }] }));
    setNav((n) => ({ ...n, stack: [...n.stack, { id, params, key: Math.random() }] }));
  }, []);
  const back = useCallback(() => setNav((n) => ({ ...n, stack: n.stack.slice(0, -1) })), []);
  const setTab = useCallback((t) => setNav({ tab: t, stack: [] }), []);

  const act = useCallback((kind, p = {}) => {
    const r = apply(stateRef.current, kind, p);
    if (r.error) return toast(r.error);
    setState(r.s);
    setNav((n) => ({ ...n, stack: [...n.stack.slice(0, -1), { id: 'success', params: r.ok, key: Math.random() }] }));
  }, [toast]);

  const value = useMemo(() => ({
    state, unit, hidden, tab: nav.tab, setUnit, toggleHidden, go, back, setTab, act, toast, patch,
  }), [state, unit, hidden, nav.tab, setUnit, toggleHidden, go, back, setTab, act, toast, patch]);

  const top = nav.stack[nav.stack.length - 1];
  return (
    <Ctx.Provider value={value}>
      {children({ top, tab: nav.tab, toastMsg })}
    </Ctx.Provider>
  );
}
