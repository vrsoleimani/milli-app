import React, { useState } from 'react';
import {
  Wallet, Check, Search, Share2, Zap, Flame, Droplet, Smartphone, ArrowUpDown, Calendar, X, Gift, ChevronDown, Store,
  Info, Users,
} from 'lucide-react';
import { useApp, NavBar, Keypad, Avatar, Diamond, AssetIcon, Toggle, Row, M } from './ui.jsx';
import { PRICE, contacts, bills, UNITS, initialState, FEES, MILLI_MIN_FEE } from './data.js';
import { fa } from './format.js';
import { SourceRow, sourceBalance } from './extra.jsx';

// ورودی مبلغ با صفحه‌کلید؛ مقدار به واحد انتخابی
function useAmount(initial = '') {
  const [v, setV] = useState(initial);
  const onKey = (k) => {
    if (k === 'del') return setV((s) => s.slice(0, -1));
    if (k === '٫') return setV((s) => (s.includes('.') || !s ? s : s + '.'));
    const d = '۰۱۲۳۴۵۶۷۸۹'.indexOf(k);
    setV((s) => (s.length >= 12 ? s : (s === '0' ? '' : s) + d));
  };
  return [v, setV, onKey];
}

function AmountDisplay({ raw, unit }) {
  const n = Number(raw || 0);
  const shown = raw ? (raw.endsWith('.') ? fa(Math.floor(n)) + '٫' : fa(n, 2)) : '۰';
  const other = unit === 'milli' ? `${fa(Math.round(n * PRICE))} تومان` : `${fa(n / PRICE, 1)} میلی`;
  return (
    <div className="amount-entry">
      <div className="val num">{shown}<small>{unit === 'milli' ? 'میلی' : 'تومان'}</small></div>
      <div className="small muted mt8 num">≈ {other}</div>
    </div>
  );
}

function UnitFlip() {
  const { unit, setUnit } = useApp();
  return (
    <button className="pill" style={{ height: 30, padding: '0 10px' }} onClick={() => setUnit(unit === 'milli' ? 'toman' : 'milli')}>
      <ArrowUpDown size={14} />{unit === 'milli' ? 'تومان' : 'میلی'}
    </button>
  );
}

const toMilliAmount = (raw, unit) => (unit === 'milli' ? Number(raw || 0) : Number(raw || 0) / PRICE);

/* ───────────── خرید میلی ───────────── */
export function Buy({ preset = '' }) {
  const { state, unit, act } = useApp();
  const [raw, setRaw, onKey] = useAmount(preset);
  const [auto, setAuto] = useState(false);
  const m = toMilliAmount(raw, unit);
  const cost = Math.round(m * PRICE);
  const short = cost > state.rial;
  return (
    <>
      <NavBar title="خرید میلی" end={<UnitFlip />} />
      <div className="field row">
        <Wallet size={20} className="gold" />
        <div className="grow"><label>پرداخت از کیف پول ریالی</label><div className="v num">موجودی {fa(state.rial)} تومان</div></div>
      </div>
      <AmountDisplay raw={raw} unit={unit} />
      <div className="chips">
        {(unit === 'milli' ? [50, 100, 500, 1000] : [500000, 1000000, 5000000]).map((x) => (
          <button key={x} className="pill num" onClick={() => setRaw(String(x))}>{fa(x)}</button>
        ))}
      </div>
      <div className="between card soft mt16" style={{ padding: 14 }}>
        <span className="col gap4"><span className="h3">هر هفته همین مقدار بخر</span><span className="xs muted">پس‌انداز خودکار، پنجشنبه‌ها</span></span>
        <Toggle on={auto} onClick={() => setAuto(!auto)} />
      </div>
      <Keypad onKey={onKey} />
      <button className="btn primary mt12" disabled={!m || short} onClick={() => act('buy', { milli: m, auto })}>{short ? 'موجودی کیف پول کافی نیست' : `خرید ${m ? `${fa(m, 1)} میلی` : ''}`}</button>
    </>
  );
}

/* ───────────── ارسال میلی ───────────── */
const OCCASIONS = [['تولد', '🎂'], ['عیدی', '🌸'], ['عروسی', '💍'], ['تشکر', '🙏']];
export function Send({ to = 'sara', preset = '', gift: giftInit = false }) {
  const { state, unit, act } = useApp();
  const [sel, setSel] = useState(to || 'sara');
  const [gift, setGift] = useState(giftInit);
  const [occ, setOcc] = useState('تولد');
  const [raw, , onKey] = useAmount(preset);
  const c = contacts.find((x) => x.id === sel);
  const m = toMilliAmount(raw, unit);
  return (
    <>
      <NavBar title={gift ? 'هدیه میلی' : 'ارسال میلی'} end={<UnitFlip />} />
      <div className="hscroll" style={{ gap: 14 }}>
        <button className="col gap8" style={{ alignItems: 'center', minWidth: 56 }}>
          <span className="avatar" style={{ background: 'var(--surface)', color: 'var(--text)', width: 48, height: 48 }}><Search size={20} /></span>
          <span className="xs">جستجو</span>
        </button>
        {contacts.map((x) => (
          <button key={x.id} className="col gap8" style={{ alignItems: 'center', minWidth: 56, opacity: x.id === sel ? 1 : 0.45 }} onClick={() => setSel(x.id)}>
            <span style={{ borderRadius: '50%', boxShadow: x.id === sel ? '0 0 0 2px var(--bg), 0 0 0 4px var(--gold)' : 'none' }}><Avatar c={x} size={48} /></span>
            <span className="xs">{x.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>
      <div className="small muted mt16" style={{ textAlign: 'center' }}>به {c.name}</div>
      <AmountDisplay raw={raw} unit={unit} />
      <div className="field" style={{ padding: '10px 16px' }}><input placeholder={gift ? 'پیام تبریک' : 'یادداشت (مثلاً سهم شام)'} defaultValue={preset && !gift ? 'سهم شام دیشب' : ''} style={{ width: '100%' }} /></div>
      <div className="between mt12" style={{ padding: '0 4px' }}>
        <span className="row gap8 small"><Gift size={17} className="gold" />ارسال به شکل هدیه با کارت تبریک</span>
        <Toggle on={gift} onClick={() => setGift(!gift)} />
      </div>
      {gift && (
        <div className="chips mt12">
          {OCCASIONS.map(([o, e]) => <button key={o} className={`pill ${occ === o ? 'active' : ''}`} onClick={() => setOcc(o)}>{e} {o}</button>)}
        </div>
      )}
      <Keypad onKey={onKey} />
      <button className="btn primary mt12" disabled={!m || m > state.milli} onClick={() => act('send', { milli: m, to: c.name, gift: gift ? occ : null })}>{m > state.milli ? 'موجودی میلی کافی نیست' : gift ? 'ارسال هدیه' : 'ارسال'}</button>
    </>
  );
}

/* ───────────── درخواست میلی ───────────── */
export function Request({ preset = '' }) {
  const { unit, act, go } = useApp();
  const [sel, setSel] = useState('reza');
  const [raw, , onKey] = useAmount(preset);
  const c = contacts.find((x) => x.id === sel);
  return (
    <>
      <NavBar title="درخواست میلی" end={<UnitFlip />} />
      <div className="hscroll" style={{ gap: 14 }}>
        {contacts.map((x) => (
          <button key={x.id} className="col gap8" style={{ alignItems: 'center', minWidth: 56, opacity: x.id === sel ? 1 : 0.45 }} onClick={() => setSel(x.id)}>
            <span style={{ borderRadius: '50%', boxShadow: x.id === sel ? '0 0 0 2px var(--bg), 0 0 0 4px var(--gold)' : 'none' }}><Avatar c={x} size={48} /></span>
            <span className="xs">{x.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>
      <div className="small muted mt16" style={{ textAlign: 'center' }}>از {c.name}</div>
      <AmountDisplay raw={raw} unit={unit} />
      <div className="segment"><button className="on">یک نفر</button><button onClick={() => go('split')}>تقسیم بین چند نفر</button></div>
      <Keypad onKey={onKey} />
      <div className="row mt12" style={{ gap: 10 }}>
        <button className="btn ghost" style={{ width: 64, flex: 'none' }}><Share2 size={20} /></button>
        <button className="btn primary" onClick={() => act('request', { to: c.name })}>ارسال درخواست</button>
      </div>
    </>
  );
}

// کد QR نمایشی (ثابت، فقط برای تصویر)
export function FakeQR({ seed: sd = 7, size = 178, inset = 36, abs = true }) {
  const n = 21;
  const cells = [];
  let seed = sd;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const finder = (x, y) => [[x, y], [x + 14, y], [x, y + 14]].some(([a, b]) => x >= a && x < a + 7 && y >= b && y < b + 7);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const inF = [[0, 0], [14, 0], [0, 14]].find(([a, b]) => x >= a && x < a + 7 && y >= b && y < b + 7);
    let on;
    if (inF) { const dx = x - inF[0], dy = y - inF[1]; on = dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4); }
    else on = rnd() > 0.52;
    if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
  }
  return (
    <svg viewBox="-2 -2 25 25" style={abs ? { position: 'absolute', inset, width: size, height: size, background: '#fff', borderRadius: 10, opacity: 0.92 } : { width: size, height: size, background: '#fff', borderRadius: 14, padding: 4 }}>
      <g fill="#000">{cells}</g>
    </svg>
  );
}

/* ───────────── تأیید پرداخت ───────────── */
export function Pay() {
  const { act, state } = useApp();
  const m = 45;
  const [src, setSrc] = useState(state.backing?.[0] || 'milli');
  const ok = sourceBalance(state, src) >= m * PRICE;
  return (
    <>
      <NavBar title="تأیید پرداخت" />
      <div className="col" style={{ alignItems: 'center', marginTop: 12 }}>
        <span className="badge-ic" style={{ width: 72, height: 72, borderRadius: 22 }}><Store size={30} /></span>
        <span className="h2 mt12">کافه لمیز</span>
        <span className="small muted mt8">خیابان ولیعصر · پذیرنده میلی</span>
      </div>
      <div className="amount-entry mt16"><div className="val num">{fa(m)}<small>میلی</small></div><div className="small muted mt8 num">≈ {fa(m * PRICE)} تومان</div></div>
      <div className="card mt16">
        <SourceRow value={src} onChange={setSrc} />
        <div className="divider" />
        <div className="between small"><span className="muted">پاداش این خرید</span><span className="gold">+۰٫۹ میلی (۲٪)</span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">کارمزد</span><span>رایگان</span></div>
      </div>
      <button className="btn primary" style={{ marginTop: 110 }} disabled={!ok} onClick={() => act('pay', { milli: m, reward: 0.9, to: 'کافه لمیز', source: src })}>{ok ? 'پرداخت' : 'موجودی این منبع کافی نیست'}</button>
    </>
  );
}

/* ───────────── موفقیت ───────────── */
export function Success({ title = 'پرداخت انجام شد', amount, toman, qty, qtyUnit, sub = '', reward = 0, hideAmount, done, split }) {
  const { go } = useApp();
  return (
    <div className="col" style={{ alignItems: 'center', paddingTop: 110, minHeight: '100%' }}>
      <span className="success-ring"><Check size={46} strokeWidth={3} /></span>
      <span className="h1 mt32">{title}</span>
      {!hideAmount && amount != null && <span className="big-num num mt16">{fa(amount, 1)}<small>میلی</small></span>}
      {!hideAmount && qty != null && <span className="big-num num mt16"><bdi>{qty}</bdi><small><bdi>{qtyUnit}</bdi></small></span>}
      {!hideAmount && qty == null && toman != null && <span className="big-num num mt16">{fa(toman)}<small>تومان</small></span>}
      <span className="small muted mt8">{sub}</span>
      {reward ? (
        <div className="card gold mt32 row" style={{ width: '100%' }}>
          <Gift size={22} className="gold" />
          <span className="grow h3">{fa(reward, 1)} میلی پاداش گرفتی</span>
        </div>
      ) : null}
      <div style={{ flex: 1 }} />
      {split && <button className="btn ghost mt32" onClick={() => go('split', split)}><Users size={18} />دنگ کردن این پرداخت</button>}
      <button className={`btn primary ${split ? 'mt12' : 'mt32'}`} onClick={() => (done ? done() : go('tab:home'))}>بازگشت به میلی</button>
    </div>
  );
}

/* ───────────── قبض و شارژ ───────────── */
const billIcon = { zap: Zap, flame: Flame, drop: Droplet, phone: Smartphone };
export function Bills() {
  const { act, go } = useApp();
  const [tab, setTab] = useState('bills');
  const [auto, setAuto] = useState(true);
  const total = bills.reduce((s, b) => s + b.toman, 0);
  const charge = [[100000, 'شارژ ۱۰۰ هزار تومانی'], [200000, 'شارژ ۲۰۰ هزار تومانی'], [500000, 'شارژ ۵۰۰ هزار تومانی']];
  const net = [[300000, 'بسته ۳۰ روزه · ۳۰ گیگ'], [550000, 'بسته ۳۰ روزه · ۶۰ گیگ'], [900000, 'بسته ۹۰ روزه · ۱۵۰ گیگ']];
  const opts = tab === 'charge' ? charge : net;
  return (
    <>
      <NavBar title="قبض و شارژ" />
      <div className="segment">
        {[['bills', 'قبض‌ها'], ['charge', 'شارژ'], ['net', 'اینترنت']].map(([id, l]) => <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{l}</button>)}
      </div>
      {tab === 'bills' ? (
        <>
          <div className="card mt16" style={{ padding: '4px 18px' }}>
            {bills.map((b) => {
              const Ic = billIcon[b.icon];
              return (
                <Row key={b.id} start={<span className="badge-ic"><Ic size={19} /></span>} title={b.name} sub={b.sub}
                  end={<M t={b.toman} />} endSub={<span className="xs muted">مهلت ۵ روز</span>} />
              );
            })}
          </div>
          <div className="between card soft mt16" style={{ padding: 14 }}>
            <span className="col gap4"><span className="h3">پرداخت خودکار قبض‌ها</span><span className="xs muted">هر ماه از میلی، روز سررسید</span></span>
            <Toggle on={auto} onClick={() => setAuto(!auto)} />
          </div>
          <div className="card mt16">
            <div className="between"><span className="muted small">جمع چهار قبض</span><span className="h2"><M t={total} /></span></div>
            <div className="between mt8 xs muted"><span>پرداخت از میلی</span><span className="gold">۱٪ پاداش</span></div>
          </div>
          <button className="btn primary mt24" onClick={() => act('bills', { milli: total / PRICE })}>پرداخت همه</button>
        </>
      ) : (
        <div className="card mt16" style={{ padding: '4px 18px' }}>
          {opts.map(([t, n]) => (
            <Row key={n} start={<span className="badge-ic"><Smartphone size={19} /></span>} title={n} sub="۰۹۱۲ ۳۴۵ ۶۷۸۹" end={<M t={t} />} chevron
              onClick={() => go('confirm', { title: n, sub: n, milli: t / PRICE, rate: 0.01, icon: 'bill', txSub: 'شارژ و اینترنت' })} />
          ))}
        </div>
      )}
    </>
  );
}

/* ───────────── تبدیل ───────────── */
// همه موارد قابل تبدیل: میلی، کیف پول ریالی و سایر دارایی‌ها
function convOptions(state) {
  return [
    { id: 'milli', name: 'میلی', color: '#FBB918', group: 'طلا' },
    { id: 'rial', name: 'کیف پول ریالی', color: '#9ca3af', group: 'تومان' },
    ...state.assets.map((a) => ({ id: a.id, name: a.name, color: a.color, group: a.group })),
  ];
}
// واحد خود هر مورد: میلی، تومان یا واحد دارایی (گرم، BTC، سهم و …)
function unitOf(id) {
  if (id === 'milli') return { u: 'میلی', price: PRICE, dec: 2 };
  const x = UNITS[id];
  if (!x) return { u: 'تومان', price: 1, dec: 0 };
  const a = initialState.assets.find((y) => y.id === id);
  return { u: x.u, price: a.value / x.qty, dec: x.dec };
}
const LATIN = /^[A-Z]+$/;
const P = '۰۱۲۳۴۵۶۷۸۹';
// نمایش ورودی خام صفحه‌کلید با جداکننده هزارگان
function fmtRaw(raw) {
  if (!raw) return '۰';
  const [i, f] = raw.split('.');
  return fa(Number(i || 0)) + (f != null ? '٫' + f.replace(/\d/g, (d) => P[d]) : '');
}
const qtyText = (q, dec) => fa(q, Math.abs(q) >= 1000 ? 0 : q && Math.abs(q) < 1 ? dec : Math.min(dec, 2));

function ConvSide({ label, id, other, onPick, value, unitLabel, sub, gold, red }) {
  const { state, hidden } = useApp();
  const [open, setOpen] = useState(false);
  const opts = convOptions(state);
  const cur = opts.find((o) => o.id === id);
  const bal = (x) => {
    if (hidden) return '••••';
    const { u, price, dec } = unitOf(x);
    return <bdi>{qtyText(sourceBalance(state, x) / price, dec)} {u}</bdi>;
  };
  return (
    <div className="card conv-side">
      <div className="between xs muted"><span>{label}</span><span className="num">موجودی {bal(id)}</span></div>
      <div className="between mt8">
        <button className="pill" style={{ height: 36 }} onClick={() => setOpen(!open)}>
          <Diamond color={cur.color} size={9} />{cur.name}<ChevronDown size={14} className="gold" />
        </button>
        <span className="col" style={{ alignItems: 'flex-end', gap: 2, minWidth: 0 }}>
          <span className={`conv-num num ${gold ? 'gold' : ''} ${red ? 'down' : ''}`}><bdi>{value}</bdi><small><bdi>{unitLabel}</bdi></small></span>
          <span className="xs muted num"><bdi>{sub}</bdi></span>
        </span>
      </div>
      {open && (
        <div className="source-list conv-menu">
          {opts.map((o) => {
            const off = o.id === other;
            return (
              <button key={o.id} disabled={off} className={`source-opt ${o.id === id ? 'on' : ''}`} style={off ? { opacity: 0.35 } : null}
                onClick={() => { onPick(o.id); setOpen(false); }}>
                <Diamond size={9} color={o.color} />
                <span className="grow col" style={{ textAlign: 'right', gap: 2 }}><span>{o.name}</span><span className="xs muted">{o.group}</span></span>
                <span className="muted num">{bal(o.id)}</span>
                {o.id === id && <Check size={15} className="gold" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// کارمزد یک تبدیل: یک کارمزد، از مبدا، به نرخ طرف غیرریالی؛ تبدیل به میلی صفر
export function convFee(from, to, n) {
  const pct = FEES[from === 'rial' ? to : from] ?? 0;
  let q = (n * pct) / 100;
  if (from === 'milli' && n) q = Math.min(n, Math.max(q, MILLI_MIN_FEE));
  const free = to === 'milli' || (from === 'milli' && to === 'millix'); // میلی و میلیکس یک دارایی‌اند
  return { pct, normal: q, qty: free ? 0 : q, free };
}

export function Convert({ from: fromInit, to: toInit }) {
  const { state, act, hidden } = useApp();
  const f0 = fromInit || 'btc';
  const [from, setFrom] = useState(f0);
  const [to, setTo] = useState(toInit || (f0 === 'milli' ? 'silver' : 'milli'));
  const [raw, setRaw, onKey] = useAmount('');
  const [spin, setSpin] = useState(0);
  const [feeInfo, setFeeInfo] = useState(false);
  const fu = unitOf(from), tu = unitOf(to);
  const n = Number(raw || 0);
  const toman = n * fu.price;
  const fee = convFee(from, to, n);
  const feeToman = fee.qty * fu.price;
  const net = toman - feeToman;
  const out = net / tu.price;
  const bal = sourceBalance(state, from);
  const short = toman > bal + 0.5;
  const names = Object.fromEntries(convOptions(state).map((o) => [o.id, o.name]));
  const fix = (v, dec) => String(Math.floor(v * 10 ** dec) / 10 ** dec);
  const setPct = (pc) => setRaw(fix((bal * pc) / fu.price, fu.dec));
  // با عوض شدن مبدا، ارزش مبلغ وارد شده ثابت می‌ماند
  const reUnit = (newFrom) => {
    if (!raw) return;
    const nu = unitOf(newFrom);
    setRaw(fix(toman / nu.price, nu.dec));
  };
  const pickFrom = (id) => { reUnit(id); setFrom(id); };
  const swap = () => { reUnit(to); setFrom(to); setTo(from); setSpin((x) => x + 180); };
  const eq = (t) => (to === 'milli' || from === 'milli' ? `≈ ${fa(Math.round(t))} تومان` : `≈ ${fa(t / PRICE, 1)} میلی`);
  const named = (u, id) => `${u}${LATIN.test(u) || id === 'milli' || id === 'rial' ? '' : ` ${names[id]}`}`;
  // نرخ: واحد بزرگ‌تر به واحد کوچک‌تر (مثلاً هر BTC به میلی)
  const [big, small] = fu.price >= tu.price ? [fu, tu] : [tu, fu];
  const perBig = (b) => (b.u === 'تومان' ? '۱ میلیون تومان' : `هر ${b.u}`);
  const bigBase = big.u === 'تومان' ? 1e6 : 1;
  const rate = <bdi>{perBig(big)} ≈ {qtyText((bigBase * big.price) / small.price, small.dec)} {small.u}</bdi>;
  const outText = qtyText(out, tu.dec);
  const pctText = `${fa(fee.pct, 1)}٪`;
  const feeQtyText = (q) => (hidden ? '••••' : <bdi>{qtyText(q, fu.dec)} {fu.u}</bdi>);
  return (
    <div className="conv">
      <NavBar title="تبدیل" />
      <ConvSide label="از" id={from} other={to} onPick={pickFrom}
        value={fmtRaw(raw)} unitLabel={fu.u} sub={eq(toman)} red={short} />
      <div style={{ display: 'grid', placeItems: 'center', margin: '-12px 0', position: 'relative', zIndex: 2 }}>
        <button className="icon-btn" aria-label="جابه‌جایی مبدا و مقصد" onClick={swap}
          style={{ background: 'var(--gold)', color: '#000', border: '4px solid var(--bg)', width: 42, height: 42, transform: `rotate(${spin}deg)`, transition: 'transform .3s' }}>
          <ArrowUpDown size={18} />
        </button>
      </div>
      <ConvSide label="به · دریافتی شما" id={to} other={from} onPick={setTo}
        value={outText} unitLabel={tu.u} sub={eq(net)} gold={to === 'milli'} />
      <div className="row mt8" style={{ gap: 8 }}>
        {[['۲۵٪', 0.25], ['۵۰٪', 0.5], ['همه', 1]].map(([x, v]) => (
          <button key={x} className="pill sm grow" style={{ justifyContent: 'center' }} onClick={() => setPct(v)}>{x}</button>
        ))}
      </div>
      <div className="conv-info mt8">
        <div className="between xs"><span className="muted">نرخ</span><span className="num">{rate}</span></div>
        <button className="between xs conv-fee" onClick={() => setFeeInfo(true)}>
          <span className="muted row" style={{ gap: 4 }}>کارمزد<Info size={12} /></span>
          {fee.free ? (
            <span className="row num" style={{ gap: 6 }}>
              {n > 0 && <s className="muted">{feeQtyText(fee.normal)}</s>}
              <span className="fee-free">کارمزد صفر</span>
            </span>
          ) : (
            <span className="num">{n > 0 ? <>{feeQtyText(fee.qty)}<span className="muted"> · {pctText}</span></> : pctText}</span>
          )}
        </button>
        {fee.free
          ? <div className="between xs"><span className="muted">زمان انجام</span><span>فوری</span></div>
          : <div className="xs up" style={{ textAlign: 'right' }}>تبدیل به میلی همیشه بدون کارمزد است</div>}
      </div>
      <Keypad onKey={onKey} />
      <button className="btn primary mt8" disabled={!n || short}
        onClick={() => act('convert', { from, to, toman: Math.round(toman), net: Math.round(net), milli: from === 'milli' ? n : undefined, outText, outUnit: named(tu.u, to),
          fee: fee.free ? 'کارمزد صفر' : `کارمزد ${qtyText(fee.qty, fu.dec)} ${fu.u}` })}>
        {short ? 'موجودی کافی نیست' : n ? `تبدیل به ${outText} ${named(tu.u, to)}` : 'تبدیل'}
      </button>
      {feeInfo && (
        <div className="conv-pop" onClick={() => setFeeInfo(false)}>
          <div className="card" onClick={(e) => e.stopPropagation()}>
            <div className="between"><span className="h3">کارمزد تبدیل</span><button className="icon-btn" aria-label="بستن" onClick={() => setFeeInfo(false)}><X size={16} /></button></div>
            <div className="between small mt12"><span className="muted">نرخ کارمزد</span><span className="num">{fee.free ? '۰٪' : pctText}</span></div>
            <div className="between small mt8"><span className="muted">مبلغ کارمزد</span><span className="num">{fee.free ? '۰' : feeQtyText(fee.qty)}</span></div>
            <div className="between small mt8"><span className="muted">معادل تومانی</span><span className="num">{hidden ? '••••' : `${fa(Math.round(feeToman))} تومان`}</span></div>
            {fee.free && n > 0 && <div className="between small mt8"><span className="muted">صرفه‌جویی تو</span><span className="num up">{feeQtyText(fee.normal)}</span></div>}
            <div className="card gold mt16 row" style={{ padding: 12, gap: 10 }}>
              <Gift size={18} className="gold" />
              <span className="xs grow">تبدیل هر دارایی به میلی همیشه بدون کارمزد است. بقیه تبدیل‌ها فقط یک کارمزد دارند که از مبدا کم می‌شود.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────── قلک تازه ───────────── */
export function NewJar() {
  const { act } = useApp();
  const [kind, setKind] = useState('solo');
  const [members, setMembers] = useState(['sara', 'reza']);
  const icons = ['🏠', '✈️', '🚗', '🎓', '💍', '🎁', '📱', '🌱'];
  const [ic, setIc] = useState('🚗');
  const [freq, setFreq] = useState('هفتگی');
  const [name, setName] = useState('ماشین تازه');
  const per = freq === 'روزانه' ? '۲۷۳' : freq === 'هفتگی' ? '۱٬۹۱۰' : '۸٬۲۸۰';
  return (
    <>
      <NavBar title="قلک تازه" />
      <div className="col" style={{ alignItems: 'center' }}>
        <span style={{ fontSize: 56, width: 104, height: 104, display: 'grid', placeItems: 'center', background: 'var(--surface)', borderRadius: 32 }}>{ic}</span>
      </div>
      <div className="row mt16" style={{ justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
        {icons.map((x) => <button key={x} onClick={() => setIc(x)} style={{ fontSize: 22, width: 40, height: 40, borderRadius: 12, background: x === ic ? 'var(--gold-soft)' : 'var(--surface)', border: x === ic ? '1px solid var(--gold)' : 0 }}>{x}</button>)}
      </div>
      <div className="segment mt16">{[['solo', 'شخصی'], ['group', 'گروهی']].map(([id, l]) => <button key={id} className={kind === id ? 'on' : ''} onClick={() => setKind(id)}>{l}</button>)}</div>
      {kind === 'group' && (
        <div className="hscroll mt16" style={{ gap: 14 }}>
          {contacts.map((x) => {
            const on = members.includes(x.id);
            return (
              <button key={x.id} className="col gap8" style={{ alignItems: 'center', minWidth: 52, opacity: on ? 1 : 0.4 }} onClick={() => setMembers((s) => (on ? s.filter((y) => y !== x.id) : [...s, x.id]))}>
                <span style={{ borderRadius: '50%', boxShadow: on ? '0 0 0 2px var(--bg), 0 0 0 4px var(--gold)' : 'none' }}><Avatar c={x} size={44} /></span>
                <span className="xs">{x.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="field mt16"><label>نام قلک</label><input className="v" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} /></div>
      <div className="field mt12"><label>هدف</label><div className="v num">۳۶٬۰۰۰ میلی <span className="small muted">≈ {fa(36000 * PRICE)} تومان</span></div></div>
      <div className="field mt12 row"><Calendar size={18} className="muted" /><div className="grow"><label>تا</label><div className="v">اسفند ۱۴۰۶</div></div></div>
      <div className="h3 mt24">واریز خودکار</div>
      <div className="segment mt8">{['روزانه', 'هفتگی', 'ماهانه'].map((x) => <button key={x} className={freq === x ? 'on' : ''} onClick={() => setFreq(x)}>{x}</button>)}</div>
      <div className="small muted mt12" style={{ textAlign: 'center' }}>هر {freq === 'روزانه' ? 'روز' : freq === 'هفتگی' ? 'هفته' : 'ماه'} <span className="gold num">{freq === 'روزانه' ? '۲۷۳' : freq === 'هفتگی' ? '۱٬۹۱۰' : '۸٬۲۸۰'} میلی</span> تا رسیدن به هدف</div>
      <button className="btn primary mt24" disabled={!name.trim()} onClick={() => act('jar', { name: name.trim(), icon: ic, freq, per, group: kind === 'group' ? members.length : 0 })}>{kind === 'group' ? 'ساخت قلک گروهی' : 'ساخت قلک'}</button>
    </>
  );
}

/* ───────────── افزایش اعتبار ───────────── */
export function CreditUp() {
  const { state, act } = useApp();
  const [v, setV] = useState(120);
  const [on, setOn] = useState({ milli: true, goldfund: true, income: true, silver: false, usdt: false });
  const tg = (k) => setOn((o) => ({ ...o, [k]: !o[k] }));
  return (
    <>
      <NavBar title="افزایش سقف اعتبار" />
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="small muted">سقف تازه</div>
        <div className="big-num num mt8">{fa(v)}<small>میلیون تومان</small></div>
        <div className="xs muted mt8 num">≈ {fa(Math.round((v * 1e6) / PRICE))} میلی</div>
        <input type="range" min={80} max={200} step={10} value={v} onChange={(e) => setV(+e.target.value)}
          style={{ width: '100%', marginTop: 20, accentColor: '#fbb918' }} />
        <div className="between xs muted"><span>۸۰ میلیون</span><span>۲۰۰ میلیون</span></div>
      </div>
      <div className="h3 mt24">پشتوانه اعتبار</div>
      <div className="card mt8" style={{ padding: '4px 18px' }}>
        <Row start={<AssetIcon color="#fbb918" />} title="میلی" sub={`${fa(state.milli)} میلی`} end={<Toggle on={on.milli} onClick={() => tg('milli')} />} />
        <Row start={<AssetIcon color="#2a49e8" />} title="صندوق طلای میلی" sub="۴۸٬۰۰۰ واحد" end={<Toggle on={on.goldfund} onClick={() => tg('goldfund')} />} />
        <Row start={<AssetIcon color="#5470ff" />} title="صندوق درآمد ثابت" sub="سود روزشمار" end={<Toggle on={on.income} onClick={() => tg('income')} />} />
        <Row start={<AssetIcon color="#c9ced6" />} title="نقره" sub="۴۱۰ گرم" end={<Toggle on={on.silver} onClick={() => tg('silver')} />} />
        <Row start={<AssetIcon color="#26a17b" />} title="تتر" sub="۱۲۶ USDT" end={<Toggle on={on.usdt} onClick={() => tg('usdt')} />} />
      </div>
      <div className="card soft mt16">
        <div className="between small"><span className="muted">رتبه اعتباری</span><span className="gold">A</span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">نرخ سالانه</span><span className="num">۲۳٪</span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">بازپرداخت</span><span>تا ۱۲ قسط</span></div>
      </div>
      <button className="btn primary mt24" onClick={() => act('creditUp', { limit: v * 1e6 })}>فعال‌سازی سقف تازه</button>
    </>
  );
}

/* ───────────── شروع حساب ───────────── */
export function Welcome() {
  const { go } = useApp();
  return (
    <div className="col" style={{ minHeight: '100%', paddingTop: 40 }}>
      <div style={{ position: 'relative', height: 330, display: 'grid', placeItems: 'center' }}>
        <span style={{ position: 'absolute', width: 210, height: 210, transform: 'rotate(45deg)', borderRadius: 36, background: 'var(--gold)', boxShadow: '0 0 120px rgba(251,185,24,.35)' }} />
        <span style={{ position: 'absolute', width: 84, height: 84, transform: 'translate(-104px,-104px) rotate(45deg)', borderRadius: 18, border: '2px solid var(--border)' }} />
        <span style={{ position: 'absolute', width: 56, height: 56, transform: 'translate(108px,104px) rotate(45deg)', borderRadius: 12, background: 'var(--surface-2)' }} />
        <span style={{ position: 'relative', fontWeight: 900, fontSize: 44, color: '#000' }}>میلی</span>
      </div>
      <span className="h1 mt24" style={{ fontSize: 32, lineHeight: 1.4 }}>پول تو، به طلا</span>
      <span className="muted mt12" style={{ lineHeight: 1.9 }}>با میلی پس‌انداز کن، خرج کن، بفرست و سرمایه‌گذاری کن. هر میلی یک میلی‌گرم طلای ۱۸ عیار است.</span>
      <div style={{ flex: 1 }} />
      <button className="btn primary mt32" onClick={() => go('onbPhone')}>شروع کن</button>
      <button className="btn mt8" style={{ color: 'var(--muted)' }} onClick={() => go('onbPhone')}>حساب دارم، ورود</button>
    </div>
  );
}

export function OnbPhone() {
  const { go } = useApp();
  return (
    <>
      <NavBar title="" />
      <span className="h1">شماره همراهت را وارد کن</span>
      <span className="muted small mt8" style={{ display: 'block' }}>کد تأیید برایت پیامک می‌شود</span>
      <div className="field mt24" style={{ direction: 'ltr', fontSize: 22, fontWeight: 800, letterSpacing: 1 }} >
        <span className="num">۰۹۱۲ ۳۴۵ ۶۷۸۹</span>
      </div>
      <div className="row mt24" style={{ justifyContent: 'center', gap: 10, direction: 'ltr' }}>
        {['۴', '۸', '۱', ''].map((d, i) => (
          <span key={i} style={{ width: 58, height: 64, borderRadius: 16, background: 'var(--surface)', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 800, border: i === 3 ? '1.5px solid var(--gold)' : 0 }}>{d}</span>
        ))}
      </div>
      <div className="small muted mt12" style={{ textAlign: 'center' }}>ارسال دوباره کد تا ۰:۴۲</div>
      <Keypad />
      <button className="btn primary mt12" onClick={() => go('onbGift')}>ادامه</button>
    </>
  );
}

export function OnbGift() {
  const { go } = useApp();
  return (
    <div className="col" style={{ alignItems: 'center', paddingTop: 80, minHeight: '100%' }}>
      <span style={{ fontSize: 70 }}>🎁</span>
      <span className="h1 mt24">۳۰ میلی هدیه گرفتی</span>
      <span className="muted mt12" style={{ textAlign: 'center', lineHeight: 1.9 }}>حسابت آماده است. اولین میلی‌هایت در کیف تو است؛ حالا می‌توانی بیشتر بخری یا به دوستت بفرستی.</span>
      <div className="card mt32" style={{ width: '100%' }}>
        <div className="between"><span className="muted small">موجودی میلی</span><span className="h2 num">۳۰ میلی</span></div>
        <div className="divider" />
        <div className="between"><span className="muted small">قیمت هر میلی</span><span className="h3 num">{fa(PRICE)} تومان</span></div>
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn primary mt32" onClick={() => go('buy')}>خرید اولین میلی</button>
      <button className="btn mt8" style={{ color: 'var(--muted)' }} onClick={() => go('tab:home')}>رفتن به خانه</button>
    </div>
  );
}
