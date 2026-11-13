import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Download, Info, TrendingUp } from 'lucide-react';
import { useApp, NavBar, ViewToggles, Diamond, AssetIcon, SectionTitle } from './ui.jsx';
import { PRICE } from './data.js';
import { fa, pct, HIDDEN } from './format.js';

/* ───────────── داده نمونه سود و زیان (ساختگی) ─────────────
   هر بازه: بازده تومانی طلا (g)، بازده هر دارایی، واریز و برداشت خالص و ضریب زمان (k، بر حسب ماه). */
const RANGES = [
  { id: 'd', label: 'امروز', title: 'امروز', from: '۰۰:۰۰', n: 24, g: 0.8, k: 1 / 30, dep: 0 },
  { id: 'w', label: 'هفته', title: '۷ روز گذشته', from: '۱۵ آبان', n: 14, g: 1.9, k: 0.25, dep: 3000000 },
  { id: 'm', label: 'ماه', title: '۳۰ روز گذشته', from: '۲۲ مهر', n: 30, g: 3.1, k: 1, dep: 18000000 },
  { id: 'q', label: '۳ ماه', title: '۳ ماه گذشته', from: '۲۲ مرداد', n: 45, g: 9.4, k: 3, dep: 46000000 },
  { id: 'y', label: 'سال', title: 'یک سال گذشته', from: 'آبان ۱۴۰۴', n: 52, g: 38, k: 11, dep: 210000000 },
  { id: 'all', label: 'از ابتدا', title: 'از ابتدا', from: 'مهر ۱۴۰۳', n: 60, g: 112, k: 18, dep: null },
  { id: 'c', label: 'دلخواه', title: '۱ مهر تا ۲۲ آبان', from: '۱ مهر', n: 40, g: 5.6, k: 1.7, dep: 27000000 },
];
const RI = Object.fromEntries(RANGES.map((r, i) => [r.id, i]));
// بازده قیمتی هر دارایی (٪) به ترتیب بازه‌ها؛ خانه اول از تغییر روزانه خود دارایی خوانده می‌شود
const RET = {
  silver: [null, 2.6, 6, 14, 52, 71, 9],
  coin: [null, 2.1, 3.6, 10.5, 41, 96, 6.2],
  copper: [null, -0.9, -1.2, 2.1, 12, 9, -0.4],
  goldfund: [null, 2.2, 3.4, 9.9, 39, 88, 6],
  btc: [null, 4.1, 14, 22, 85, 140, 17],
  eth: [null, 3, 9, -6, 31, 44, 4],
  usdt: [null, 1.1, 4.5, 11, 46, 73, 7],
  foolad: [null, -1.8, -2.3, -7.5, 8, -4, -5.1],
};
const INCOME_YIELD = [0.06, 0.4, 1.6, 4.9, 20, 31, 2.9]; // صندوق درآمد ثابت: همه بازده از نوع سود است
const FEE = { btc: 0.0025, eth: 0.002, usdt: 0.001, foolad: 0.003, income: 0 }; // کارمزد ماهانه نسبت به ارزش
const REALIZED = { btc: 0.3, foolad: 0.2, silver: 0.15 }; // سهم فروخته‌شده از سود قیمتی
// اجزای باکس میلی به میلی: سود طلایی، پاداش کارت و خرده‌پول، کارمزد
const MILLI_YIELD = [1, 7, 30, 90, 330, 420, 50];
const MILLI_REWARD = [9, 58, 250, 720, 2650, 4100, 410];
const MILLI_FEE = [0, -5, -22, -70, -260, -480, -35];
const UNIT = {
  milli: ['هر میلی', PRICE], jars: ['هر میلی', PRICE], silver: ['هر گرم', 15122], coin: ['هر عدد', 21000000],
  copper: ['هر کیلوگرم', 750000], goldfund: ['هر واحد', 1010], income: ['هر واحد', 10000], btc: ['هر بیت‌کوین', 1777777778],
  eth: ['هر اتریوم', 28000000], usdt: ['هر تتر', 98413], foolad: ['هر سهم', 8420],
};
const GROUP_OF = { فلزات: 'سکه و فلزات', صندوق: 'صندوق‌ها', رمزارز: 'رمزارز', سهام: 'سهام' };
const GROUP_COLOR = { میلی: '#fbb918', 'قلک‌ها': '#e0a100', 'صندوق‌ها': '#2a49e8', رمزارز: '#f7931a', سهام: '#3b82f6', 'سکه و فلزات': '#c9ced6' };

// محاسبه سود و زیان یک بازه، هم به تومان و هم به میلی (نسبت به طلا)
export function computePnl(state, rid = 'm') {
  const i = RI[rid] ?? 2;
  const r = RANGES[i];
  const g = r.g / 100;
  const locked = (state.locks || []).reduce((s, l) => s + l.milli, 0);
  const jarsM = state.jars.reduce((s, j) => s + j.saved, 0);
  const raw = [
    { id: 'milli', name: 'میلی (طلا)', group: 'میلی', color: '#fbb918', V: (state.milli + locked) * PRICE, rho: g, y: MILLI_YIELD[i] * PRICE, rw: MILLI_REWARD[i] * PRICE, fee: MILLI_FEE[i] * PRICE },
    { id: 'jars', name: 'قلک‌ها', group: 'قلک‌ها', color: '#e0a100', V: jarsM * PRICE, rho: g, y: 0, rw: 0, fee: 0 },
    ...state.assets.map((a) => {
      const income = a.id === 'income';
      const rho = income ? 0 : (i === 0 ? a.change : RET[a.id]?.[i] ?? r.g * 0.8) / 100;
      const y = income ? a.value * (INCOME_YIELD[i] / 100) / (1 + INCOME_YIELD[i] / 100) : (a.id === 'foolad' && i >= 4 && i <= 5 ? 620000 : 0);
      return { id: a.id, name: a.name, group: GROUP_OF[a.group] || a.group, color: a.color, V: a.value, rho, y, rw: 0, fee: -a.value * (FEE[a.id] ?? 0.0008) * r.k };
    }),
  ];
  const items = raw.map((x) => {
    const ex = x.y + x.rw + x.fee;
    const S = (x.V - ex) / (1 + x.rho); // ارزش ابتدای دوره به تومان
    const priceT = x.rho * S;
    const T = priceT + ex;
    const M = (T - g * S) / PRICE; // سود و زیان به میلی
    const priceM = M - ex / PRICE;
    const z = REALIZED[x.id] || 0;
    return {
      ...x, S,
      pl: { t: T, m: M, pt: (T / S) * 100, pm: (M / ((S * (1 + g)) / PRICE)) * 100 },
      price: { t: priceT, m: priceM }, yld: { t: x.y, m: x.y / PRICE }, reward: { t: x.rw, m: x.rw / PRICE }, fees: { t: x.fee, m: x.fee / PRICE },
      realized: { t: z * priceT + ex, m: z * priceM + ex / PRICE }, unrealized: { t: (1 - z) * priceT, m: (1 - z) * priceM },
    };
  });
  const sum = (f) => items.reduce((s, x) => ({ t: s.t + f(x).t, m: s.m + f(x).m }), { t: 0, m: 0 });
  const total = sum((x) => x.pl);
  const endT = items.reduce((s, x) => s + x.V, 0);
  const end = { t: endT, m: endT / PRICE };
  const all = r.dep == null;
  const dep = all ? { t: end.t - total.t, m: end.m - total.m } : { t: r.dep, m: (r.dep * (1 + g / 2)) / PRICE };
  const start = { t: end.t - total.t - dep.t, m: end.m - total.m - dep.m };
  const w = all ? 1 : 0.5;
  total.pt = (total.t / (start.t + dep.t * w)) * 100;
  total.pm = (total.m / (start.m + dep.m * w)) * 100;
  const groups = Object.keys(GROUP_COLOR).map((name) => {
    const xs = items.filter((x) => x.group === name);
    return { name, color: GROUP_COLOR[name], pl: xs.reduce((s, x) => ({ t: s.t + x.pl.t, m: s.m + x.pl.m }), { t: 0, m: 0 }) };
  });
  const sources = [
    { name: 'تغییر قیمت', pl: sum((x) => x.price) }, { name: 'سود طلایی و صندوق', pl: sum((x) => x.yld) },
    { name: 'پاداش و خرده‌پول', pl: sum((x) => x.reward) }, { name: 'کارمزد', pl: sum((x) => x.fees) },
  ];
  // اگر همه دارایی میلی بود (فقط در حالت تومان معنا دارد؛ در حالت میلی برابر صفر است)
  const bench = { t: total.t - total.m * PRICE, m: 0 };
  return { r, i, items, groups, sources, total, start, end, dep, bench, realized: sum((x) => x.realized), unrealized: sum((x) => x.unrealized) };
}

/* ───────────── نمایش عدد ───────────── */
const sign = (v) => (v > 0 ? '+' : v < 0 ? '−' : '');
const tone = (v) => (Math.round(v) > 0 ? 'up' : Math.round(v) < 0 ? 'down' : 'muted');
function useUnit() {
  const { unit, hidden } = useApp();
  const k = unit === 'milli' ? 'm' : 't';
  return { k, hidden, name: unit === 'milli' ? 'میلی' : 'تومان', pk: unit === 'milli' ? 'pm' : 'pt' };
}
// مبلغ علامت‌دار در واحد فعلی
function PL({ v, plain }) {
  const { k, hidden, name } = useUnit();
  const x = v[k];
  if (hidden) return <span className="num">{HIDDEN}</span>;
  return <span className={`num ${plain ? '' : tone(x)}`}>{plain ? '' : sign(Math.round(x))}{fa(Math.abs(Math.round(x)))} {name}</span>;
}
// عدد فشرده برای نمودار
function compact(x, k) {
  const a = Math.abs(x);
  if (k === 'm') return fa(Math.round(a));
  if (a >= 1e9) return `${fa(a / 1e9, 2)} میلیارد`;
  if (a >= 1e6) return `${fa(a / 1e6, 1)} میلیون`;
  return `${fa(Math.round(a / 1e3))} هزار`;
}
function Pct({ v }) {
  return <span className={`num ${tone(v * 100)}`}>{v >= 0 ? '↑' : '↓'} {pct(Math.abs(v))}</span>;
}

/* ───────────── نمودار آبشاری (افقی، مناسب گوشی) ───────────── */
function Waterfall({ d, by }) {
  const { k, hidden } = useUnit();
  const steps = (by === 'source' ? d.sources : d.groups).filter((s) => Math.abs(s.pl[k]) >= 0.5);
  let run = d.start[k];
  const rows = [{ name: `ابتدای دوره`, kind: 'base', from: 0, to: run, val: run }];
  if (Math.abs(d.dep[k]) >= 0.5) { rows.push({ name: 'واریز و برداشت', kind: 'flow', from: run, to: run + d.dep[k], val: d.dep[k] }); run += d.dep[k]; }
  steps.forEach((s) => { rows.push({ name: s.name, color: s.color, kind: 'step', from: run, to: run + s.pl[k], val: s.pl[k] }); run += s.pl[k]; });
  rows.push({ name: 'پایان دوره', kind: 'base end', from: 0, to: run, val: run });
  const levels = rows.flatMap((x) => (x.kind.startsWith('base') ? [x.to] : [x.from, x.to]));
  let lo = Math.min(...levels), hi = Math.max(...levels);
  const pad = (hi - lo || hi || 1) * 0.12;
  const cut = lo - pad > hi * 0.3; // محور بریده: ستون‌های ابتدا و پایان کامل نشان داده نمی‌شوند
  lo = cut ? lo - (hi - lo) * 0.6 : 0; hi += pad * 0.4;
  const X = (v) => ((Math.max(v, lo) - lo) / (hi - lo)) * 100;
  return (
    <div className="wf">
      {rows.map((x, n) => {
        const a = X(Math.min(x.from, x.to)), b = X(Math.max(x.from, x.to));
        const base = x.kind.startsWith('base');
        const cls = base ? x.kind : x.kind === 'flow' ? 'flow' : x.val >= 0 ? 'pos' : 'neg';
        return (
          <div className="wf-row" key={x.name}>
            <span className="wf-label">{x.color && <Diamond color={x.color} size={7} />}{x.name}</span>
            <span className="wf-track">
              <i className={`wf-bar ${cls} ${base && cut ? 'cut' : ''}`} style={{ left: `${a}%`, width: `max(3px, ${b - a}%)` }} />
              {n < rows.length - 1 && <b className="wf-link" style={{ left: `${X(x.to)}%` }} />}
            </span>
            <span className={`wf-val num ${base ? '' : x.kind === 'flow' ? 'muted' : tone(x.val)}`}>
              {hidden ? '••••' : `${base ? '' : sign(x.val)}${compact(x.val, k)}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────── نمودار روند تجمعی ───────────── */
function bridge(n, seed, endV, amp) {
  let s = seed, v = 0;
  const w = [];
  for (let i = 0; i < n; i++) { s = (s * 9301 + 49297) % 233280; v += s / 233280 - 0.5; w.push(v); }
  const b = w.map((x, i) => x - (i / (n - 1)) * w[n - 1]);
  const mx = Math.max(...b.map(Math.abs)) || 1;
  return b.map((x, i) => (i / (n - 1)) * endV + (x / mx) * amp);
}
function Trend({ d }) {
  const { k, hidden } = useUnit();
  const W = 350, H = 180, T = d.total[k], B = d.bench[k];
  const amp = Math.max(Math.abs(T), Math.abs(B), 1) * 0.28;
  const mine = bridge(d.r.n, 17 + d.i * 5, T, amp);
  const ref = k === 't' ? bridge(d.r.n, 41 + d.i * 3, B, amp * 0.5) : null;
  const all = [...mine, ...(ref || []), 0];
  const lo = Math.min(...all), hi = Math.max(...all);
  const Y = (v) => 12 + (1 - (v - lo) / (hi - lo || 1)) * (H - 26);
  const path = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${((i / (arr.length - 1)) * W).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const z = Y(0);
  const diff = { t: d.total.t - d.bench.t, m: d.total.m };
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ direction: 'ltr', display: 'block' }}>
        <defs><linearGradient id="pnlg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbb918" stopOpacity=".3" /><stop offset="1" stopColor="#fbb918" stopOpacity="0" /></linearGradient></defs>
        <path d={`${path(mine)} L${W},${z} L0,${z} Z`} fill="url(#pnlg)" />
        <line x1="0" x2={W} y1={z} y2={z} stroke="#5c5c5c" strokeWidth="1" strokeDasharray="3 4" />
        {ref && <path d={path(ref)} fill="none" stroke="#9a9a9a" strokeWidth="1.6" strokeDasharray="5 4" strokeLinecap="round" />}
        <path d={path(mine)} fill="none" stroke="#fbb918" strokeWidth="2.3" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={W} cy={Y(T)} r="4.5" fill="#fbb918" />
      </svg>
      <div className="between xs muted mt8"><span>{d.r.from}</span><span>امروز</span></div>
      <div className="row xs mt12" style={{ gap: 16, flexWrap: 'wrap' }}>
        <span className="row" style={{ gap: 6 }}><i className="lg-line" />سود و زیان تجمعی شما</span>
        <span className="row muted" style={{ gap: 6 }}><i className="lg-line dash" />{k === 't' ? 'اگر همه دارایی میلی بود' : 'خط صفر: نگه‌داشتن میلی'}</span>
      </div>
      <div className="card soft mt12 between small" style={{ padding: 14 }}>
        <span>{k === 't' ? 'در مقایسه با نگه‌داشتن همه دارایی به میلی' : 'نسبت به نگه‌داشتن همه دارایی به میلی'}</span>
        <b>{hidden ? HIDDEN : <PL v={diff} />}</b>
      </div>
    </>
  );
}

/* ───────────── تقویم سود و زیان روزانه ───────────── */
const WEEK = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const CAL = [
  { name: 'مهر ۱۴۰۵', days: 30, first: 4, upto: 30, seed: 71 },
  { name: 'آبان ۱۴۰۵', days: 30, first: 6, upto: 22, seed: 23 },
];
function dailySeries(cal, k, base, today) {
  let s = cal.seed + (k === 'm' ? 900 : 0);
  return Array.from({ length: cal.upto }, (_, i) => {
    s = (s * 9301 + 49297) % 233280;
    if (today != null && i === cal.upto - 1) return today;
    const x = s / 233280 - (k === 'm' ? 0.48 : 0.4);
    return k === 'm' ? x * 190 : x * base * 0.011;
  });
}
function Calendar({ state }) {
  const { k, hidden } = useUnit();
  const [mi, setMi] = useState(1);
  const [sel, setSel] = useState(null);
  const cal = CAL[mi];
  const day = computePnl(state, 'd');
  const vals = dailySeries(cal, k, day.end.t, mi === 1 ? day.total[k] : null);
  const mx = Math.max(...vals.map(Math.abs));
  const cells = [...Array(cal.first).fill(null), ...Array.from({ length: cal.days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  const pick = sel && sel <= cal.upto ? sel : cal.upto;
  const best = vals.indexOf(Math.max(...vals)) + 1;
  const month = vals.reduce((a, b) => a + b, 0);
  const v2 = (x) => ({ t: x, m: x });
  return (
    <div className="card">
      <div className="between">
        <button className="icon-btn sm" disabled={mi === CAL.length - 1} onClick={() => { setMi(mi + 1); setSel(null); }} aria-label="ماه بعد"><ChevronRight size={18} /></button>
        <span className="col" style={{ alignItems: 'center', gap: 2 }}>
          <span className="h3">{cal.name}</span>
          <span className="xs"><PL v={v2(month)} /></span>
        </span>
        <button className="icon-btn sm" disabled={mi === 0} onClick={() => { setMi(mi - 1); setSel(null); }} aria-label="ماه قبل"><ChevronLeft size={18} /></button>
      </div>
      <div className="cal mt12">
        {WEEK.map((w) => <span key={w} className="cal-h">{w}</span>)}
        <span className="cal-h">هفته</span>
        {weeks.map((wk, wi) => {
          const ws = wk.filter((x) => x && x <= cal.upto).reduce((s, x) => s + vals[x - 1], 0);
          const has = wk.some((x) => x && x <= cal.upto);
          return (
            <React.Fragment key={wi}>
              {wk.map((dn, di) => {
                if (!dn) return <span key={di} />;
                const v = dn <= cal.upto ? vals[dn - 1] : null;
                const a = v == null ? 0 : 0.14 + 0.62 * (Math.abs(v) / mx);
                return (
                  <button key={di} className={`cal-d ${dn === pick ? 'on' : ''} ${v == null ? 'off' : ''}`} disabled={v == null} onClick={() => setSel(dn)}
                    style={v == null ? null : { background: v >= 0 ? `rgba(43,211,107,${a})` : `rgba(255,90,90,${a})` }}>
                    {fa(dn)}
                  </button>
                );
              })}
              <span className={`cal-w num ${has ? tone(ws) : 'faint'}`}>{!has ? '–' : hidden ? '••' : `${sign(ws)}${k === 'm' ? fa(Math.round(Math.abs(ws))) : fa(Math.abs(ws) / 1e6, 1)}`}</span>
            </React.Fragment>
          );
        })}
      </div>
      <div className="xs faint mt8" style={{ textAlign: 'left' }}>ستون هفته به {k === 'm' ? 'میلی' : 'میلیون تومان'}</div>
      <div className="divider" />
      <div className="between small"><span className="muted">{fa(pick)} {cal.name.split(' ')[0]}</span><b><PL v={v2(vals[pick - 1])} /></b></div>
      <div className="between small mt8"><span className="muted">روزهای مثبت</span><span className="num">{fa(vals.filter((x) => x > 0).length)} از {fa(cal.upto)} روز</span></div>
      <div className="between small mt8"><span className="muted">بهترین روز</span><span className="num">{fa(best)} {cal.name.split(' ')[0]} · <PL v={v2(vals[best - 1])} /></span></div>
    </div>
  );
}

/* ───────────── ردیف دارایی با جزئیات بازشو ───────────── */
function AssetRow({ x, open, onToggle, share }) {
  const { go } = useApp();
  const { k, pk, hidden } = useUnit();
  const [uLabel, uNow] = UNIT[x.id] || ['هر واحد', 0];
  const avg = uNow / (1 + (x.id === 'income' ? 0 : (RET[x.id]?.[5] ?? 112) / 100));
  const cell = (label, node) => <div className="col gap4"><span className="xs muted">{label}</span><span className="small" style={{ fontWeight: 700 }}>{node}</span></div>;
  const toman = (v) => (hidden ? HIDDEN : `${fa(Math.round(v))} تومان`);
  return (
    <div className="pl-item">
      <button className="list-row" style={{ width: '100%', textAlign: 'right', borderBottom: 0 }} onClick={onToggle}>
        <AssetIcon color={x.color} />
        <span className="grow col gap4">
          <span className="h3">{x.name}</span>
          <span className="bar" style={{ height: 4, width: 96 }}><i style={{ width: `${Math.max(4, share * 100)}%`, background: x.pl[k] >= 0 ? 'var(--green)' : 'var(--red)' }} /></span>
        </span>
        <span className="end col gap4" style={{ alignItems: 'flex-end' }}>
          <span className="h3"><PL v={x.pl} /></span>
          <span className="small"><Pct v={x.pl[pk]} /></span>
        </span>
        <ChevronDown size={17} className="faint" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '.2s' }} />
      </button>
      {open && (
        <div className="pl-detail">
          <div className="pl-grid">
            {cell(`میانگین خرید (${uLabel})`, <span className="num">{toman(avg)}</span>)}
            {cell(`قیمت فعلی (${uLabel})`, <span className="num">{toman(uNow)}</span>)}
            {cell('محقق‌نشده (دارایی فعلی)', <PL v={x.unrealized} />)}
            {cell('محقق‌شده (فروش و دریافتی)', <PL v={x.realized} />)}
            {cell('تغییر قیمت', <PL v={x.price} />)}
            {cell('سود، پاداش و کارمزد', <PL v={{ t: x.yld.t + x.reward.t + x.fees.t, m: x.yld.m + x.reward.m + x.fees.m }} />)}
          </div>
          {x.id !== 'jars' && (
            <button className="btn ghost small mt12" style={{ width: '100%' }} onClick={() => (x.id === 'milli' ? go('price') : go('asset', { id: x.id }))}>
              {x.id === 'milli' ? 'قیمت میلی' : `صفحه ${x.name}`}<ChevronLeft size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────────── صفحه سود و زیان ───────────── */
export function Pnl({ p = {} }) {
  const { state, toast } = useApp();
  const { k, pk, hidden, name } = useUnit();
  const [rid, setRid] = useState(p.range || 'm');
  const [view, setView] = useState(p.view || 'wf');
  const [by, setBy] = useState(p.by || 'asset');
  const [sort, setSort] = useState('amount');
  const [open, setOpen] = useState(p.open || null);
  const [help, setHelp] = useState(!!p.help);
  const d = computePnl(state, rid);
  const T = d.total[k];
  const list = [...d.items].sort((a, b) => (sort === 'amount' ? b.pl[k] - a.pl[k] : b.pl[pk] - a.pl[pk]));
  const mx = Math.max(...d.items.map((x) => Math.abs(x.pl[k]))) || 1;
  const other = { t: d.total.m, m: d.total.t }; // همان عدد در واحد مقابل
  return (
    <>
      <NavBar title="سود و زیان" end={<button className="icon-btn" onClick={() => toast('گزارش سود و زیان آماده شد')} aria-label="دریافت گزارش"><Download size={19} /></button>} />
      <div className="hscroll" style={{ gap: 8 }}>
        {RANGES.map((r) => <button key={r.id} className={`pill ${rid === r.id ? 'active' : ''}`} onClick={() => setRid(r.id)}>{r.label}</button>)}
      </div>
      {rid === 'c' && (
        <div className="row mt12" style={{ gap: 10 }}>
          <div className="field grow"><label>از تاریخ</label><div className="v num">۱ مهر ۱۴۰۵</div></div>
          <div className="field grow"><label>تا تاریخ</label><div className="v num">۲۲ آبان ۱۴۰۵</div></div>
        </div>
      )}

      <div className="balance-card mt16">
        <div className="between">
          <span className="muted small">سود و زیان · {d.r.title}</span>
          <ViewToggles />
        </div>
        <div className={`big-num num mt12 ${hidden ? '' : tone(T)}`} style={k === 't' ? { fontSize: 32 } : null}>
          {hidden ? HIDDEN : <>{sign(Math.round(T))}{fa(Math.abs(Math.round(T)))}<small>{name}</small></>}
        </div>
        <div className="between mt8">
          <span className="small"><Pct v={d.total[pk]} /> <span className="muted">بازده دوره</span></span>
          <span className="small muted num">{hidden ? HIDDEN : `${k === 'm' ? 'به تومان' : 'به میلی'}: ${sign(Math.round(other[k]))}${fa(Math.abs(Math.round(other[k])))}`}</span>
        </div>
        <div className="divider" />
        <div className="row" style={{ gap: 10 }}>
          <div className="grow col gap4"><span className="xs muted">محقق‌شده</span><span className="h3"><PL v={d.realized} /></span></div>
          <div className="grow col gap4"><span className="xs muted">محقق‌نشده</span><span className="h3"><PL v={d.unrealized} /></span></div>
        </div>
      </div>

      <div className="card mt16">
        <div className="segment" style={{ background: 'var(--surface-2)' }}>
          {[['wf', 'آبشاری'], ['trend', 'روند']].map(([id, l]) => <button key={id} className={view === id ? 'on' : ''} onClick={() => setView(id)}>{l}</button>)}
        </div>
        {view === 'wf' ? (
          <>
            <div className="between mt12">
              <span className="row" style={{ gap: 8 }}>
                {[['asset', 'بر اساس دارایی'], ['source', 'بر اساس منبع']].map(([id, l]) => <button key={id} className={`pill sm ${by === id ? 'active' : ''}`} onClick={() => setBy(id)}>{l}</button>)}
              </span>
              <span className="xs faint">{k === 'm' ? 'به میلی' : 'به تومان'}</span>
            </div>
            <Waterfall d={d} by={by} />
          </>
        ) : <div className="mt16"><Trend d={d} /></div>}
      </div>

      <button className="row mt12 small muted" style={{ gap: 8, width: '100%', textAlign: 'right' }} onClick={() => setHelp(!help)}>
        <Info size={16} /><span className="grow">سود و زیان چطور حساب می‌شود؟</span>
        <ChevronDown size={16} style={{ transform: help ? 'rotate(180deg)' : 'none' }} />
      </button>
      {help && (
        <div className="card soft mt8 small" style={{ lineHeight: 2 }}>
          سود و زیان هر بازه برابر است با ارزش پایان دوره، منهای ارزش ابتدای دوره، منهای واریز و برداشت خالص؛ پس پولی که تازه آورده‌ای سود حساب نمی‌شود.
          در حالت میلی، همه دارایی‌ها با طلا سنجیده می‌شوند: خودِ میلی فقط از سود طلایی و پاداش رشد می‌کند و بقیه دارایی‌ها نسبت به طلا دیده می‌شوند.
          کیف پول ریالی در این محاسبه نیست.
        </div>
      )}

      <SectionTitle title="به تفکیک دارایی" />
      <div className="segment">
        {[['amount', 'بیشترین مبلغ'], ['pct', 'بیشترین بازده']].map(([id, l]) => <button key={id} className={sort === id ? 'on' : ''} onClick={() => setSort(id)}>{l}</button>)}
      </div>
      <div className="mt8">
        {list.map((x) => <AssetRow key={x.id} x={x} share={Math.abs(x.pl[k]) / mx} open={open === x.id} onToggle={() => setOpen(open === x.id ? null : x.id)} />)}
      </div>

      <SectionTitle title="تقویم سود و زیان" />
      <Calendar state={state} />

      <button className="btn ghost mt16" onClick={() => toast('گزارش سود و زیان آماده شد')}><Download size={19} />دریافت گزارش {d.r.title}</button>
    </>
  );
}

// ردیف لینک سود و زیان در باکس مجموع دارایی
export function PnlLink() {
  const { state, go } = useApp();
  const { pk } = useUnit();
  const d = computePnl(state, 'm');
  return (
    <button className="between" style={{ width: '100%' }} onClick={() => go('pnl')}>
      <span className="row gap8"><TrendingUp size={17} className="gold" /><span className="small">سود و زیان ماه</span></span>
      <span className="row gap8">
        <span className="h3"><PL v={d.total} /></span>
        <span className="small"><Pct v={d.total[pk]} /></span>
        <ChevronLeft size={17} className="faint" />
      </span>
    </button>
  );
}
