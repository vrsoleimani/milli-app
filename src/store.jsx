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
      return { s: addTx({ ...s, milli: round(s.milli - m) }, txOf(p.to, 'ارسال · الان', -m, 'out')), ok: { title: 'ارسال انجام شد', amount: m, sub: `به ${p.to}` } };
    }
    case 'request':
      return { s, ok: { title: 'درخواست ارسال شد', sub: `برای ${p.to}`, hideAmount: true } };
    case 'pay': {
      if (p.milli > s.milli) return NO;
      const t = addTx({ ...s, milli: round(s.milli - p.milli + p.reward), rewardsMonth: s.rewardsMonth + p.reward }, txOf(p.to, 'پرداخت QR · الان', -p.milli, 'qr'));
      return { s: t, ok: { title: 'پرداخت انجام شد', amount: p.milli, sub: `به ${p.to}`, reward: p.reward } };
    }
    case 'payItem': {
      const m = round(p.milli, 1);
      if (m > s.milli) return NO;
      const reward = round(m * (p.rate ?? 0.01), 1);
      let n = { ...s, milli: round(s.milli - m + reward), rewardsMonth: round(s.rewardsMonth + reward, 1) };
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
      const a = s.assets.find((x) => x.id === p.from);
      const m = round(p.toman / PRICE);
      return {
        s: addTx({ ...s, milli: round(s.milli + m), assets: s.assets.map((x) => (x.id === p.from ? { ...x, value: x.value - p.toman } : x)) }, txOf(`تبدیل ${a.name} به میلی`, 'الان', m, 'buy')),
        ok: { title: 'تبدیل انجام شد', amount: m, sub: `از ${a.name}` },
      };
    }
    case 'jar':
      return {
        s: { ...s, jars: [...s.jars, { id: `j${Date.now()}`, name: p.name, icon: p.icon, saved: 0, goal: 120000, auto: `${p.freq} ${p.per} میلی` }] },
        ok: { title: 'قلک ساخته شد', sub: p.name, hideAmount: true },
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
