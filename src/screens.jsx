import React, { useState } from 'react';
import {
  Gem, Hammer, ShieldCheck, Building2, Truck, Gift, Users, Star, MapPin, ArrowUpRight, ArrowDownLeft, Copy, Share2,
  Plus, Minus, ChevronUp, ChevronDown, X, Check, Fingerprint, Bell, Lock, Headphones, Info, Link2, Car, HeartPulse,
  TrendingUp, Wallet, Store, Search, ScanFace, Timer, ChevronLeft, Briefcase, User, CalendarClock, ShoppingBag, Sparkles, Coins, Eye, EyeOff, Heart,
} from 'lucide-react';
import {
  useApp, NavBar, Diamond, AssetIcon, Toggle, Row, M, Alt, Change, SectionTitle, TxIcon, Keypad, Avatar, BigAmount, Logo,
} from './ui.jsx';
import { PRICE, PRICE_CHANGE, contacts, merchants, backingLabels } from './data.js';
import { fa, money, milliIn } from './format.js';
import { monthly, MONTHS } from './store.jsx';
import { FakeQR } from './flows.jsx';
import { SourceRow, sourceBalance, SpendCard, TX_CAT } from './extra.jsx';

/* ───────────── ابزارها ───────────── */
function series(n, seed, vol, base) {
  let s = seed, v = 0;
  const arr = [];
  for (let i = 0; i < n; i++) { s = (s * 9301 + 49297) % 233280; v += (s / 233280 - 0.46) * vol; arr.push(v); }
  const last = arr[n - 1];
  return arr.map((x) => base * (1 + (x - last) / 100));
}

function Chart({ data, height = 170, color = '#fbb918' }) {
  const W = 350;
  const lo = Math.min(...data), hi = Math.max(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, 10 + (1 - (v - lo) / (hi - lo || 1)) * (height - 24)]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const id = `g${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" height={height} style={{ direction: 'ltr', display: 'block' }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".28" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={`${d} L${W},${height} L0,${height} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4.5" fill={color} />
    </svg>
  );
}

const RANGES = [['۱ روز', 24, 0.6], ['۱ هفته', 28, 1.2], ['۱ ماه', 30, 2.2], ['۱ سال', 52, 5]];

function RangeChart({ base, seed, color }) {
  const [ri, setRi] = useState(2);
  const [, n, vol] = RANGES[ri];
  const data = series(n, seed, vol, base);
  const ch = ((data[n - 1] - data[0]) / data[0]) * 100;
  return (
    <>
      <div className="between mt8"><Change v={ch} suffix={`در ${RANGES[ri][0]}`} /></div>
      <div className="mt12"><Chart data={data} color={color} /></div>
      <div className="segment mt12">{RANGES.map(([l], i) => <button key={l} className={ri === i ? 'on' : ''} onClick={() => setRi(i)}>{l}</button>)}</div>
    </>
  );
}

function Stepper({ v, set, min = 1, max = 99, step = 1, label }) {
  return (
    <div className="between card soft" style={{ padding: 12 }}>
      <span className="h3">{label}</span>
      <span className="row gap8">
        <button className="icon-btn" onClick={() => set(Math.max(min, v - step))}><Minus size={18} /></button>
        <span className="h3 num" style={{ minWidth: 36, textAlign: 'center' }}>{fa(v)}</span>
        <button className="icon-btn" onClick={() => set(Math.min(max, v + step))}><Plus size={18} /></button>
      </span>
    </div>
  );
}

const Sub = ({ children }) => <div className="small muted mt8" style={{ lineHeight: 1.9 }}>{children}</div>;

/* ───────────── تأیید پرداخت عمومی ───────────── */
export function Confirm({ p }) {
  const { state, act, go } = useApp();
  const [src, setSrc] = useState('milli');
  const ok = sourceBalance(state, src) >= p.milli * PRICE;
  const reward = Math.round(p.milli * (p.rate ?? 0.01) * 10) / 10;
  return (
    <>
      <NavBar title="تأیید پرداخت" />
      <div className="col" style={{ alignItems: 'center', marginTop: 8 }}>
        <span className="badge-ic" style={{ width: 72, height: 72, borderRadius: 22 }}>{p.big || <ShoppingBag size={30} />}</span>
        <span className="h2 mt12">{p.title}</span>
        {p.sub && <span className="small muted mt8" style={{ textAlign: 'center' }}>{p.sub}</span>}
      </div>
      <div className="mt24" style={{ textAlign: 'center' }}>
        <BigAmount milli={p.milli} />
        <div className="small muted mt8"><Alt m={p.milli} /></div>
      </div>
      <div className="card mt24">
        <SourceRow value={src} onChange={setSrc} />
        <div className="divider" />
        {reward > 0 && (<><div className="between small"><span className="muted">پاداش این خرید</span><span className="gold">+{fa(reward, 1)} میلی</span></div>
        <div className="divider" /></>)}
        <div className="between small"><span className="muted">کارمزد</span><span>رایگان</span></div>
      </div>
      <button className="btn primary mt24" disabled={!ok} onClick={() => act('payItem', { ...p, source: src })}>{ok ? 'پرداخت' : 'موجودی این منبع کافی نیست'}</button>
      {!ok && src === 'milli' && <button className="btn mt8" style={{ color: 'var(--gold)' }} onClick={() => go('buy')}>خرید میلی</button>}
    </>
  );
}

/* ───────────── فروش میلی ───────────── */
export function Sell() {
  const { state, unit, act, setUnit } = useApp();
  const [raw, setRaw] = useState('');
  const onKey = (k) => {
    if (k === 'del') return setRaw((s) => s.slice(0, -1));
    if (k === '٫') return setRaw((s) => (s.includes('.') || !s ? s : s + '.'));
    const d = '۰۱۲۳۴۵۶۷۸۹'.indexOf(k);
    setRaw((s) => (s.length >= 12 ? s : (s === '0' ? '' : s) + d));
  };
  const n = Number(raw || 0);
  const m = unit === 'milli' ? n : n / PRICE;
  const over = m > state.milli;
  const shown = raw ? (raw.endsWith('.') ? fa(Math.floor(n)) + '٫' : fa(n, 2)) : '۰';
  return (
    <>
      <NavBar title="فروش میلی" end={<button className="pill" style={{ height: 30, padding: '0 10px' }} onClick={() => setUnit(unit === 'milli' ? 'toman' : 'milli')}>{unit === 'milli' ? 'تومان' : 'میلی'}</button>} />
      <div className="field row">
        <Wallet size={20} className="gold" />
        <div className="grow"><label>واریز به کیف پول ریالی</label><div className="v num">موجودی میلی {fa(state.milli)}</div></div>
      </div>
      <div className="amount-entry">
        <div className="val num">{shown}<small>{unit === 'milli' ? 'میلی' : 'تومان'}</small></div>
        <div className="small muted mt8 num">≈ {unit === 'milli' ? `${fa(Math.round(n * PRICE))} تومان` : `${fa(n / PRICE, 1)} میلی`}</div>
      </div>
      <div className="chips">
        {[['۲۵٪', 0.25], ['۵۰٪', 0.5], ['همه', 1]].map(([l, v]) => (
          <button key={l} className="pill" onClick={() => setRaw(String(unit === 'milli' ? Math.floor(state.milli * v) : Math.floor(state.milli * v * PRICE)))}>{l}</button>
        ))}
      </div>
      <Keypad onKey={onKey} />
      <button className="btn primary mt12" disabled={!m || over} onClick={() => act('sell', { milli: m })}>{over ? 'موجودی میلی کافی نیست' : `فروش ${m ? `${fa(m, 1)} میلی` : ''}`}</button>
    </>
  );
}

/* ───────────── کیف پول ریالی ───────────── */
export function WalletPage() {
  const { state, go, act, patch, toast } = useApp();
  return (
    <>
      <NavBar title="کیف پول ریالی" />
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="small muted">موجودی</div>
        <div className="big-num num mt8">{fa(state.rial)}<small>تومان</small></div>
      </div>
      <div className="row mt16" style={{ gap: 10 }}>
        <button className="btn primary" onClick={() => act('deposit', { toman: 5000000 })}><Plus size={18} />واریز ۵ میلیون</button>
        <button className="btn ghost" onClick={() => act('withdraw', { toman: 5000000 })}><Minus size={18} />برداشت ۵ میلیون</button>
      </div>
      <button className="btn ghost mt12" onClick={() => go('buy')}>خرید میلی از این کیف پول</button>
      <button className="between card soft mt16" style={{ padding: 14, width: '100%', textAlign: 'right' }} onClick={() => go('salary')}>
        <span className="col gap4"><span className="h3">تقسیم حقوق</span><span className="xs muted">{state.salary.on ? `${fa(state.salary.milli)}٪ میلی · ${fa(state.salary.jar)}٪ قلک · ${fa(state.salary.fund)}٪ صندوق` : 'خاموش'}</span></span>
        <ChevronLeft size={18} className="faint" />
      </button>
      <SectionTitle title="گردش اخیر" />
      <Row start={<span className="badge-ic"><ArrowDownLeft size={19} className="up" /></span>} title="واریز حقوق" sub="۱ آذر" end={<span className="up"><M t={32000000} /></span>} />
      <Row start={<span className="badge-ic"><Diamond /></span>} title="خرید خودکار میلی" sub="۱ آذر · ۲۰٪ حقوق" end={<span>−<M t={6400000} /></span>} />
      <Row start={<span className="badge-ic"><ArrowUpRight size={19} /></span>} title="برداشت به حساب بانکی" sub="۲۸ آبان" end={<span>−<M t={5000000} /></span>} />
    </>
  );
}

/* ───────────── باشگاه پاداش ───────────── */
export function Rewards() {
  const { state } = useApp();
  const goal = 300;
  const pct = Math.min(100, (state.rewardsMonth / goal) * 100);
  return (
    <>
      <NavBar title="باشگاه پاداش" />
      <div className="card gold" style={{ textAlign: 'center' }}>
        <Gift size={30} className="gold" />
        <div className="small muted mt8">پاداش این ماه</div>
        <div className="big-num num mt8">{fa(state.rewardsMonth, 1)}<small>میلی</small></div>
        <div className="bar mt16" style={{ height: 8 }}><i style={{ width: `${pct}%` }} /></div>
        <div className="xs muted mt8">{fa(Math.max(0, goal - state.rewardsMonth), 0)} میلی تا سطح طلایی</div>
      </div>
      <SectionTitle title="پاداش از کجا می‌آید؟" />
      <div className="card" style={{ padding: '4px 18px' }}>
        <Row start={<span className="badge-ic"><ShoppingBag size={19} /></span>} title="خرید با کارت" end={<span className="gold small">۱٪</span>} />
        <Row start={<span className="badge-ic"><Store size={19} /></span>} title="پرداخت QR در پذیرنده‌ها" end={<span className="gold small">تا ۳٪</span>} />
        <Row start={<span className="badge-ic"><Star size={19} /></span>} title="قبض و شارژ" end={<span className="gold small">۱٪</span>} />
        <Row start={<span className="badge-ic"><Users size={19} /></span>} title="دعوت از دوستان" end={<span className="gold small">۳۰ میلی</span>} />
      </div>
      <SectionTitle title="پاداش‌های اخیر" />
      {state.tx.filter((t) => t.icon === 'gift' || t.icon === 'qr').slice(0, 4).map((t) => (
        <Row key={t.id} start={<TxIcon kind={t.icon} />} title={t.title} sub={t.sub} end={<span className="gold">+<M m={Math.max(1, Math.round(Math.abs(t.milli) * 0.02 * 10) / 10)} d={1} /></span>} />
      ))}
    </>
  );
}

/* ───────────── تاریخچه ───────────── */
export function History() {
  const { state } = useApp();
  const [f, setF] = useState('all');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('همه');
  const cats = ['همه', 'خوراک و کافه', 'خرید', 'قبض و شارژ', 'انتقال'];
  const list = state.tx.filter((t) => (f === 'all' || (f === 'in' ? t.milli > 0 : t.milli < 0)) && (!q || t.title.includes(q) || t.sub.includes(q)) && (cat === 'همه' || TX_CAT[t.icon] === cat));
  return (
    <>
      <NavBar title="تراکنش‌ها و خرج" />
      <SpendCard />
      <div className="field row mt16" style={{ padding: '10px 14px' }}><Search size={18} className="muted" /><input className="grow" placeholder="جستجو در تراکنش‌ها" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="hscroll mt12" style={{ gap: 8 }}>{cats.map((x) => <button key={x} className={`pill ${cat === x ? 'active' : ''}`} onClick={() => setCat(x)}>{x}</button>)}</div>
      <div className="segment mt12">{[['all', 'همه'], ['in', 'دریافتی'], ['out', 'پرداختی']].map(([id, l]) => <button key={id} className={f === id ? 'on' : ''} onClick={() => setF(id)}>{l}</button>)}</div>
      <div className="mt12">
        {list.map((t) => (
          <Row key={t.id} start={<TxIcon kind={t.icon} />} title={t.title} sub={`${t.sub}${TX_CAT[t.icon] ? ` · ${TX_CAT[t.icon]}` : ''}`}
            end={<span className={t.milli > 0 ? 'up' : ''}>{t.milli > 0 ? '+' : '−'}<M m={Math.abs(t.milli)} /></span>}
            endSub={<span className="xs muted"><Alt m={Math.abs(t.milli)} /></span>} />
        ))}
        {!list.length && <div className="small muted" style={{ textAlign: 'center', padding: 24 }}>تراکنشی پیدا نشد</div>}
      </div>
    </>
  );
}

/* ───────────── قیمت میلی ───────────── */
export function Price() {
  const { go } = useApp();
  return (
    <>
      <NavBar title="قیمت میلی" />
      <div className="card">
        <div className="row gap8"><Diamond size={11} /><span className="small muted">قیمت هر میلی</span></div>
        <div className="big-num num mt8">{fa(PRICE)}<small>تومان</small></div>
        <RangeChart base={PRICE} seed={11} />
      </div>
      <div className="card soft mt16 small" style={{ lineHeight: 2 }}>هر میلی برابر یک میلی‌گرم طلای ۱۸ عیار است. قیمت به‌صورت زنده به‌روز می‌شود.</div>
      <div className="row mt16" style={{ gap: 10 }}>
        <button className="btn primary" onClick={() => go('buy')}>خرید</button>
        <button className="btn ghost" onClick={() => go('sell')}>فروش</button>
      </div>
    </>
  );
}

/* ───────────── حساب‌ها ───────────── */
export function Accounts() {
  const { state, patch, back, go } = useApp();
  return (
    <>
      <NavBar title="انتخاب حساب" />
      <div className="card" style={{ padding: '4px 18px' }}>
        {state.accounts.map((a) => (
          <Row key={a.id}
            start={<span className="badge-ic">{a.type === 'business' ? <Briefcase size={19} /> : a.type === 'family' ? <Users size={19} /> : <User size={19} />}</span>}
            title={a.label} sub={a.sub}
            end={a.id === state.account ? <Check size={20} className="gold" /> : null}
            onClick={() => { patch(() => ({ account: a.id })); back(); }} />
        ))}
      </div>
      <button className="btn ghost mt16" onClick={() => go('newAccount')}><Plus size={18} />حساب تازه</button>
    </>
  );
}

export function NewAccount() {
  const { act } = useApp();
  const [type, setType] = useState('business');
  const [name, setName] = useState('');
  return (
    <>
      <NavBar title="حساب تازه" />
      <div className="segment">{[['business', 'بیزینس'], ['family', 'خانواده']].map(([id, l]) => <button key={id} className={type === id ? 'on' : ''} onClick={() => setType(id)}>{l}</button>)}</div>
      <Sub>{type === 'business' ? 'پذیرنده میلی شو: دریافت پرداخت با QR، گزارش فروش و تسویه به کیف پول ریالی.' : 'میلی خانواده را مشترک نگه دار و برای هر عضو سهم ماهانه تعیین کن.'}</Sub>
      <div className="field mt24"><label>{type === 'business' ? 'نام کسب‌وکار' : 'نام خانواده'}</label>
        <input className="v" placeholder={type === 'business' ? 'مثلاً کافه نارنج' : 'مثلاً خانواده کریمی'} value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} /></div>
      <button className="btn primary mt24" disabled={!name.trim()} onClick={() => act('newAccount', { type, name: name.trim() })}>ساخت حساب</button>
    </>
  );
}

/* ───────────── اعلان‌ها ───────────── */
export function Notifications() {
  const { state } = useApp();
  const items = [
    ['gift', 'پاداش خرید به حسابت اضافه شد', `${fa(state.rewardsMonth, 0)} میلی پاداش این ماه`, 'امروز'],
    ['in', 'سارا ۳۰۰ میلی فرستاد', 'برای سهم شام', 'دیروز'],
    ['bill', 'قبض برق سررسید می‌شود', 'تا ۵ روز دیگر', 'دیروز'],
    ['price', 'قیمت هر میلی به ' + fa(PRICE) + ' تومان رسید', `رشد ${fa(PRICE_CHANGE, 1)}٪ نسبت به دیروز`, '۲ روز پیش'],
    ['inst', 'قسط بعدی ۲۵ آذر است', 'می‌توانی از هم‌اکنون پرداخت کنی', '۳ روز پیش'],
  ];
  const ic = { gift: <Gift size={19} className="gold" />, in: <ArrowDownLeft size={19} className="up" />, bill: <Bell size={19} />, price: <TrendingUp size={19} className="gold" />, inst: <CalendarClock size={19} /> };
  return (
    <>
      <NavBar title="اعلان‌ها" />
      {items.map(([k, t, s, d]) => <Row key={t} start={<span className="badge-ic">{ic[k]}</span>} title={t} sub={s} end={<span className="xs muted">{d}</span>} />)}
    </>
  );
}

/* ───────────── خرید و فروش دارایی ───────────── */
export function BuyAsset({ p }) {
  const { state, go, act } = useApp();
  const [sel, setSel] = useState(p.id || null);
  const [raw, setRaw] = useState('');
  const sell = p.mode === 'sell';
  const a = state.assets.find((x) => x.id === sel);
  const onKey = (k) => {
    if (k === 'del') return setRaw((s) => s.slice(0, -1));
    const d = '۰۱۲۳۴۵۶۷۸۹'.indexOf(k);
    if (d < 0) return;
    setRaw((s) => (s.length >= 11 ? s : (s === '0' ? '' : s) + d));
  };
  if (!a) {
    return (
      <>
        <NavBar title="خرید دارایی" />
        <Sub>دارایی مورد نظرت را انتخاب کن. خرید از کیف پول ریالی انجام می‌شود.</Sub>
        <div className="card mt16" style={{ padding: '4px 18px' }}>
          <Row start={<AssetIcon color="#fbb918" />} title="میلی" sub="طلای دیجیتال" chevron onClick={() => go('buy')} />
          {state.assets.map((x) => <Row key={x.id} start={<AssetIcon color={x.color} />} title={x.name} sub={x.sub} chevron onClick={() => setSel(x.id)} />)}
        </div>
      </>
    );
  }
  const t = Number(raw || 0);
  const lack = sell ? t > a.value : t > state.rial;
  return (
    <>
      <NavBar title={`${sell ? 'فروش' : 'خرید'} ${a.name}`} />
      <div className="field row"><AssetIcon color={a.color} /><div className="grow"><label>{sell ? 'دارایی شما' : 'پرداخت از کیف پول ریالی'}</label><div className="v num">{fa(sell ? a.value : state.rial)} تومان</div></div></div>
      <div className="amount-entry"><div className="val num">{raw ? fa(t) : '۰'}<small>تومان</small></div><div className="small muted mt8 num">≈ {fa(t / PRICE, 1)} میلی</div></div>
      <div className="chips">{[1000000, 5000000, 10000000].map((x) => <button key={x} className="pill num" onClick={() => setRaw(String(x))}>{fa(x)}</button>)}</div>
      <Keypad onKey={onKey} />
      <button className="btn primary mt12" disabled={!t || lack} onClick={() => act(sell ? 'sellAsset' : 'buyAsset', { id: a.id, toman: t })}>
        {lack ? (sell ? 'موجودی دارایی کافی نیست' : 'موجودی کیف پول کافی نیست') : sell ? 'فروش' : 'خرید'}
      </button>
    </>
  );
}

export function AssetPage({ p }) {
  const { state, go } = useApp();
  const a = state.assets.find((x) => x.id === p.id);
  const seed = a.peg ? 11 : a.id.length * 7 + a.id.charCodeAt(0); // میلیکس همان نمودار قیمت میلی
  return (
    <>
      <NavBar title={a.name} />
      <div className="card">
        <div className="row gap8"><Diamond color={a.color} size={11} /><span className="small muted">{a.sub}</span>{a.peg && <span className="pill sm gold" style={{ marginInlineStart: 'auto' }}>هر MLX = ۱ میلی</span>}</div>
        <div className="big-num num mt8"><M t={a.value} /></div>
        <RangeChart base={a.value} seed={seed} color={a.color} />
      </div>
      <div className="row mt16" style={{ gap: 10 }}>
        <button className="btn primary" onClick={() => go('buyAsset', { id: a.id })}>خرید</button>
        <button className="btn ghost" onClick={() => go('buyAsset', { id: a.id, mode: 'sell' })}>فروش</button>
      </div>
      <button className="btn ghost mt12" onClick={() => go('convert', { from: a.id, to: 'milli' })}>تبدیل به میلی{a.peg ? ' · یک‌به‌یک' : ''}</button>
    </>
  );
}

/* ───────────── مشاور هوشمند ───────────── */
export function Advisor() {
  const { go } = useApp();
  const tips = [
    ['رمزارز بخشی از سبد توست', 'با تبدیل بخشی از سود رمزارز به میلی، سبدت متعادل‌تر می‌شود.', 'تبدیل به میلی', () => go('convert', { from: 'btc', to: 'milli' })],
    ['پول کیف ریالی بیکار است', 'بخشی از آن را در صندوق درآمد ثابت بگذار تا هر روز سود بگیرد.', 'خرید صندوق', () => go('buyAsset', { id: 'income' })],
    ['قلک سفر نوروز عقب است', 'با ۳۰ میلی واریز بیشتر در هفته، به هدفت می‌رسی.', 'ساخت قلک تازه', () => go('jar')],
    ['سقف اعتبارت جا برای رشد دارد', 'با اضافه کردن نقره به پشتوانه، سقف بالاتری بگیر.', 'افزایش سقف', () => go('creditUp')],
  ];
  return (
    <>
      <NavBar title="مشاور هوشمند میلی" />
      <div className="card gold row"><Sparkles size={22} className="gold" /><span className="grow small" style={{ lineHeight: 1.9 }}>راهنمایی به سمت بهترین سرمایه‌گذاری‌ها، بر اساس سبد دارایی تو.</span></div>
      {tips.map(([t, s, b, fn]) => (
        <div className="card mt12" key={t}>
          <div className="h3">{t}</div>
          <Sub>{s}</Sub>
          <button className="btn ghost mt12" style={{ height: 44 }} onClick={fn}>{b}</button>
        </div>
      ))}
    </>
  );
}

/* ───────────── اعتبار ───────────── */
export function CreditBuy({ p = {} }) {
  const { state, act } = useApp();
  const left = state.credit.limit - state.credit.used;
  const [mi, setMi] = useState(Math.max(0, merchants.findIndex((x) => x.name === p.merchant)));
  const [amt, setAmt] = useState(10000000);
  const [months, setMonths] = useState(6);
  const m = monthly(amt, months);
  return (
    <>
      <NavBar title="خرید اعتباری" />
      <div className="card soft row"><ShoppingBag size={20} className="gold" /><span className="grow small">اعتبار باقی‌مانده: <b><M t={left} /></b></span></div>
      <div className="h3 mt16">پذیرنده</div>
      <div className="hscroll mt8">{merchants.map((x, i) => <button key={x.name} className={`pill ${mi === i ? 'active' : ''}`} onClick={() => setMi(i)}>{x.name}</button>)}</div>
      <div className="h3 mt16">مبلغ خرید</div>
      <div className="chips mt8">{[10000000, 20000000, 40000000].map((x) => <button key={x} className={`pill num ${amt === x ? 'active' : ''}`} onClick={() => setAmt(x)}>{fa(x / 1e6)} میلیون</button>)}</div>
      <div className="h3 mt16">تعداد قسط</div>
      <div className="segment mt8">{[3, 6, 12].map((x) => <button key={x} className={months === x ? 'on' : ''} onClick={() => setMonths(x)}>{fa(x)} ماهه</button>)}</div>
      <div className="card mt16">
        <div className="between small"><span className="muted">قسط ماهانه</span><span className="h3"><M t={m} /></span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">نرخ سالانه</span><span className="num">{fa(state.credit.rate)}٪</span></div>
      </div>
      <button className="btn primary mt24" disabled={amt > left} onClick={() => act('creditPurchase', { toman: amt, months, merchant: merchants[mi].name })}>{amt > left ? 'اعتبار کافی نیست' : 'ثبت خرید اعتباری'}</button>
    </>
  );
}

export function Loan() {
  const { state, act } = useApp();
  const left = state.credit.limit - state.credit.used;
  const maxM = Math.floor(left / 1e6);
  const [v, setV] = useState(Math.min(20, maxM));
  const [months, setMonths] = useState(12);
  return (
    <>
      <NavBar title="وام" />
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="small muted">مبلغ وام</div>
        <div className="big-num num mt8">{fa(v)}<small>میلیون تومان</small></div>
        <div className="xs muted mt8 num">≈ {fa(Math.round((v * 1e6) / PRICE))} میلی</div>
        <input type="range" min={1} max={maxM} value={v} onChange={(e) => setV(+e.target.value)} style={{ width: '100%', marginTop: 20, accentColor: '#fbb918' }} />
        <div className="between xs muted"><span>۱ میلیون</span><span>{fa(maxM)} میلیون</span></div>
      </div>
      <div className="segment mt16">{[6, 12, 24].map((x) => <button key={x} className={months === x ? 'on' : ''} onClick={() => setMonths(x)}>{fa(x)} ماهه</button>)}</div>
      <div className="card mt16">
        <div className="between small"><span className="muted">قسط ماهانه</span><span className="h3"><M t={monthly(v * 1e6, months)} /></span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">نرخ سالانه</span><span className="num">{fa(state.credit.rate)}٪</span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">واریز به</span><span>کیف پول ریالی</span></div>
      </div>
      <button className="btn primary mt24" onClick={() => act('loan', { toman: v * 1e6, months })}>دریافت وام</button>
    </>
  );
}

export function Installments() {
  const { state, go } = useApp();
  const total = state.installments.reduce((s, i) => s + i.left * i.monthly, 0);
  return (
    <>
      <NavBar title="اقساط" />
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="small muted">مجموع باقی‌مانده</div>
        <div className="big-num num mt8"><M t={total} /></div>
      </div>
      {state.installments.length === 0 && <Sub>قسط بازی نداری.</Sub>}
      {state.installments.map((i) => (
        <div className="card mt12" key={i.id}>
          <div className="between"><span className="h3">{i.title}</span><span className="small muted num">{fa(i.left)} قسط مانده</span></div>
          <div className="bar mt12" style={{ height: 8 }}><i style={{ width: `${((i.total - i.left) / i.total) * 100}%` }} /></div>
          <div className="between mt12">
            <span className="small muted">قسط {MONTHS[i.k % 12]} · <M t={i.monthly} /></span>
            <button className="btn primary small" onClick={() => go('payInstallment', { id: i.id })}>پرداخت</button>
          </div>
        </div>
      ))}
    </>
  );
}

export function PayInstallment({ p }) {
  const { state } = useApp();
  const i = state.installments.find((x) => x.id === p.id) || state.installments[0];
  if (!i) return <><NavBar title="پرداخت قسط" /><Sub>قسط بازی نداری.</Sub></>;
  return (
    <Confirm p={{ title: `قسط ${i.title}`, sub: `قسط ${MONTHS[i.k % 12]}`, milli: i.monthly / PRICE, rate: 0, kind: 'installment', instId: i.id, toman: i.monthly, icon: 'bill', txSub: 'پرداخت قسط', successTitle: 'قسط پرداخت شد', big: <CalendarClock size={30} /> }} />
  );
}

export function Score() {
  const arc = (pct) => {
    const r = 80, c = Math.PI * r;
    return { strokeDasharray: `${c * pct} ${c}` };
  };
  return (
    <>
      <NavBar title="امتیاز اعتباری" />
      <div className="card" style={{ textAlign: 'center' }}>
        <svg viewBox="0 0 200 110" width="240" style={{ display: 'block', margin: '0 auto' }}>
          <path d="M20 100 A80 80 0 0 1 180 100" fill="none" style={{ stroke: 'var(--track)' }} strokeWidth="14" strokeLinecap="round" />
          <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#fbb918" strokeWidth="14" strokeLinecap="round" style={arc(0.84)} />
        </svg>
        <div className="big-num num" style={{ marginTop: -50 }}>۸۴۰</div>
        <div className="h3 gold mt8">رتبه A · عالی</div>
        <div className="xs muted mt8">از ۱٬۰۰۰</div>
      </div>
      <SectionTitle title="چه چیزی روی امتیاز اثر دارد؟" />
      <div className="card" style={{ padding: '4px 18px' }}>
        <Row start={<span className="badge-ic"><Check size={19} className="up" /></span>} title="پرداخت به‌موقع اقساط" sub="۱۰۰٪ در ۱۲ ماه اخیر" />
        <Row start={<span className="badge-ic"><Check size={19} className="up" /></span>} title="سابقه حساب" sub="بیش از ۲ سال" />
        <Row start={<span className="badge-ic"><Coins size={19} /></span>} title="میزان استفاده از اعتبار" sub="۳۷٪ از سقف" />
        <Row start={<span className="badge-ic"><Diamond /></span>} title="تنوع دارایی‌ها" sub="میلی، صندوق، رمزارز و سهام" />
      </div>
    </>
  );
}

/* ───────────── خدمات ───────────── */
function Catalog({ title, intro, items, icon, mk }) {
  const { go } = useApp();
  return (
    <>
      <NavBar title={title} />
      {intro && <Sub>{intro}</Sub>}
      <div className="mt16">
        {items.map((it) => (
          <div className="card mt12" key={it.name}>
            <div className="row">
              <span className="badge-ic" style={{ width: 48, height: 48, borderRadius: 15 }}>{it.icon || icon}</span>
              <span className="grow col gap4"><span className="h3">{it.name}</span><span className="small muted">{it.sub}</span></span>
            </div>
            <div className="between mt12">
              <span className="h3"><M m={it.milli} />{it.per && <span className="xs muted"> {it.per}</span>}</span>
              <button className="btn primary small" onClick={() => go('confirm', mk(it))}>{it.cta || 'خرید'}</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function Insurance() {
  return (
    <Catalog title="بیمه" icon={<ShieldCheck size={22} />} intro="حق بیمه را با میلی بپرداز و پاداش بگیر."
      items={[
        { name: 'بیمه بدنه خودرو', sub: 'پوشش کامل · یک‌ساله', milli: 2900, icon: <Car size={22} /> },
        { name: 'بیمه شخص ثالث', sub: 'یک‌ساله', milli: 960, icon: <Car size={22} /> },
        { name: 'بیمه درمان تکمیلی', sub: 'فردی · یک‌ساله', milli: 2340, icon: <HeartPulse size={22} /> },
        { name: 'بیمه عمر و پس‌انداز', sub: 'پرداخت ماهانه', milli: 120, per: 'در ماه', icon: <Heart size={22} /> },
      ]}
      mk={(it) => ({ title: it.name, sub: it.sub, milli: it.milli, rate: 0.01, icon: 'shop', txSub: 'بیمه', big: <ShieldCheck size={30} />, successTitle: 'بیمه‌نامه صادر شد' })} />
  );
}

export function Gallery() {
  const { go } = useApp();
  const items = [
    ['انگشتر نگین‌دار', 3], ['گردنبند ظریف', 4], ['دستبند زنجیری', 6], ['گوشواره حلقه‌ای', 2], ['سکه هدیه', 2], ['آویز ستاره', 1.5],
  ].map(([name, g]) => ({ name, g, milli: Math.round(g * 1000 * 1.12) }));
  return (
    <>
      <NavBar title="میلی گالری" />
      <Sub>فروشگاه مصنوعات طلا (milli.gallery)؛ با قیمت لحظه‌ای طلا، پرداخت با میلی و ارسال درب منزل.</Sub>
      <div className="mt16" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {items.map((it) => (
          <div className="card" key={it.name} style={{ padding: 14 }}>
            <div style={{ height: 96, borderRadius: 14, background: 'linear-gradient(135deg,#3a2c08,#fbb918 140%)', display: 'grid', placeItems: 'center' }}><Gem size={34} color="#1a1200" /></div>
            <div className="h3 mt12">{it.name}</div>
            <div className="xs muted mt8 num">{fa(it.g)} گرم · ۱۸ عیار</div>
            <div className="h3 mt8"><M m={it.milli} /></div>
            <button className="btn primary mt12" style={{ height: 40, fontSize: 14 }} onClick={() => go('confirm', { title: it.name, sub: `${fa(it.g)} گرم · ۱۸ عیار`, milli: it.milli, rate: 0.02, icon: 'shop', txSub: 'میلی گالری', big: <Gem size={30} />, successTitle: 'خرید انجام شد' })}>خرید</button>
          </div>
        ))}
      </div>
    </>
  );
}

export function GoldYield() {
  const { state, act } = useApp();
  const [pc, setPc] = useState(0.5);
  const [months, setMonths] = useState(6);
  const m = Math.floor(state.milli * pc);
  const per = Math.round(m * 0.01 * 10) / 10;
  const locked = (state.locks || []).reduce((x, l) => x + l.milli, 0);
  return (
    <>
      <NavBar title="سود طلایی" />
      <div className="card gold" style={{ textAlign: 'center' }}>
        <TrendingUp size={30} className="gold" />
        <div className="big-num num mt8">۱٪<small>سود ماهانه</small></div>
        <Sub>طلایت را حداقل ۶ ماه نگه دار و هر ماه ۱٪ آن را به میلی سود بگیر.</Sub>
      </div>
      {locked > 0 && (
        <div className="card soft mt12 between" style={{ padding: 14 }}>
          <span className="col gap4"><span className="h3">طلای تو در سود طلایی</span><span className="xs muted">سود ماهانه {fa(Math.round(locked * 0.01 * 10) / 10, 1)} میلی</span></span>
          <span className="h3 gold"><M m={locked} /></span>
        </div>
      )}
      <div className="h3 mt24">چه مقدار از میلی‌هایت؟</div>
      <div className="segment mt8">{[['۲۵٪', 0.25], ['۵۰٪', 0.5], ['همه', 1]].map(([l, v]) => <button key={l} className={pc === v ? 'on' : ''} onClick={() => setPc(v)}>{l}</button>)}</div>
      <div className="amount-entry"><div className="val num">{fa(m)}<small>میلی</small></div><div className="small muted mt8 num">≈ {fa(m * PRICE)} تومان · از {fa(state.milli)} میلی</div></div>
      <div className="h3">مدت</div>
      <div className="segment mt8">{[6, 9, 12].map((x) => <button key={x} className={months === x ? 'on' : ''} onClick={() => setMonths(x)}>{fa(x)} ماه</button>)}</div>
      <div className="card mt16">
        <div className="between small"><span className="muted">سود هر ماه</span><span className="gold num">+{fa(per, 1)} میلی</span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">جمع سود در {fa(months)} ماه</span><span className="gold num">+{fa(per * months, 1)} میلی</span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">واریز سود</span><span>اول هر ماه، به موجودی میلی</span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">آزاد شدن طلا</span><span>پس از {fa(months)} ماه</span></div>
      </div>
      <button className="btn primary mt24" disabled={!m} onClick={() => act('lock', { milli: m, months })}>شروع سود طلایی</button>
    </>
  );
}

export function RealEstate() {
  const { go } = useApp();
  const [n, setN] = useState(2);
  const [pi, setPi] = useState(0);
  const props = [['آپارتمان ۸۰ متری · ولیعصر', 'سهم‌های مشاع · اجاره‌داده‌شده'], ['واحد تجاری · ستارخان', 'سهم‌های مشاع · اجاره‌داده‌شده']];
  return (
    <>
      <NavBar title="املاک متری" />
      <Sub>از ۱۵۰ میلی، صاحب سهمی از ملک شو. سهم اجاره هر ماه به کیف پولت می‌آید.</Sub>
      <div className="mt16">
        {props.map(([a, b], i) => (
          <button key={a} className="card row mt12" style={{ width: '100%', textAlign: 'right', border: pi === i ? '1.5px solid var(--gold)' : '1.5px solid transparent' }} onClick={() => setPi(i)}>
            <span className="badge-ic" style={{ width: 48, height: 48, borderRadius: 15 }}><Building2 size={22} /></span>
            <span className="grow col gap4"><span className="h3">{a}</span><span className="small muted">{b}</span></span>
            {pi === i && <Check size={20} className="gold" />}
          </button>
        ))}
      </div>
      <div className="mt16"><Stepper v={n} set={setN} min={1} max={40} label="تعداد سهم (هر سهم ۱۵۰ میلی)" /></div>
      <div className="card mt16"><div className="between"><span className="muted small">مبلغ</span><span className="h2"><M m={n * 500} /></span></div></div>
      <button className="btn primary mt24" onClick={() => go('confirm', { title: `${fa(n)} سهم ${props[pi][0]}`, sub: 'خرید سهم ملک', milli: n * 500, rate: 0.005, icon: 'shop', txSub: 'املاک متری', big: <Building2 size={30} />, successTitle: 'سهم‌ها به نامت ثبت شد' })}>ادامه</button>
    </>
  );
}

export function Delivery() {
  const { go } = useApp();
  const opts = [['شمش ۵ گرمی', 5], ['شمش ۱۰ گرمی', 10], ['شمش ۲۰ گرمی', 20]];
  const [i, setI] = useState(0);
  const fee = 200;
  const milli = opts[i][1] * 1000 + fee;
  return (
    <>
      <NavBar title="تحویل فیزیکی" />
      <Sub>میلی‌ات را به طلای فیزیکی تبدیل کن و درب منزل تحویل بگیر.</Sub>
      <div className="mt16">
        {opts.map(([n, g], k) => (
          <button key={n} className="card row mt12" style={{ width: '100%', textAlign: 'right', border: i === k ? '1.5px solid var(--gold)' : '1.5px solid transparent' }} onClick={() => setI(k)}>
            <span className="badge-ic" style={{ width: 48, height: 48, borderRadius: 15 }}><Coins size={22} /></span>
            <span className="grow col gap4"><span className="h3">{n}</span><span className="small muted">طلای ۱۸ عیار با گواهی</span></span>
            <span className="h3"><M m={g * 1000} /></span>
          </button>
        ))}
      </div>
      <div className="card mt16">
        <div className="row"><MapPin size={20} className="gold" /><span className="grow small">تهران، خیابان ولیعصر، پلاک ۱۲</span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">هزینه ارسال و بیمه</span><span><M m={fee} /></span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">زمان تحویل</span><span>۳ روز کاری</span></div>
      </div>
      <button className="btn primary mt24" onClick={() => go('confirm', { title: opts[i][0], sub: 'تحویل درب منزل', milli, rate: 0, icon: 'shop', txSub: 'تحویل فیزیکی', big: <Truck size={30} />, successTitle: 'سفارش تحویل ثبت شد' })}>ادامه</button>
    </>
  );
}

export function GiftCard() {
  const { go } = useApp();
  const [amt, setAmt] = useState(1000);
  const [to, setTo] = useState('sara');
  const [d, setD] = useState(0);
  const designs = ['linear-gradient(135deg,#fbb918,#7a5200)', 'linear-gradient(135deg,#3b82f6,#1f3be0)', 'linear-gradient(135deg,#ec4899,#7c1d4d)'];
  const c = contacts.find((x) => x.id === to);
  return (
    <>
      <NavBar title="کارت هدیه" />
      <div style={{ height: 170, borderRadius: 24, background: designs[d], padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Logo size={34} />
        <div><div className="h2 num" style={{ color: '#fff' }}>{fa(amt)} میلی</div><div className="small" style={{ color: 'rgba(255,255,255,.85)' }}>هدیه برای {c.name}</div></div>
      </div>
      <div className="row mt12" style={{ justifyContent: 'center', gap: 10 }}>
        {designs.map((g, i) => <button key={g} onClick={() => setD(i)} style={{ width: 34, height: 34, borderRadius: 11, background: g, outline: d === i ? '2px solid var(--text)' : 'none', outlineOffset: 2 }} aria-label="طرح" />)}
      </div>
      <div className="h3 mt16">مبلغ</div>
      <div className="chips mt8">{[500, 1000, 5000, 10000].map((x) => <button key={x} className={`pill num ${amt === x ? 'active' : ''}`} onClick={() => setAmt(x)}>{fa(x)}</button>)}</div>
      <div className="h3 mt16">برای چه کسی؟</div>
      <div className="hscroll mt8" style={{ gap: 14 }}>
        {contacts.map((x) => (
          <button key={x.id} className="col gap8" style={{ alignItems: 'center', minWidth: 56, opacity: x.id === to ? 1 : 0.45 }} onClick={() => setTo(x.id)}>
            <Avatar c={x} size={48} /><span className="xs">{x.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>
      <button className="btn primary mt24" onClick={() => go('confirm', { title: 'کارت هدیه', sub: `برای ${c.name}`, milli: amt, rate: 0.01, icon: 'gift', txSub: 'کارت هدیه', big: <Gift size={30} />, successTitle: 'کارت هدیه فرستاده شد' })}>ادامه</button>
    </>
  );
}

export function Family() {
  const { go, toast } = useApp();
  const members = [['علی رضایی (شما)', 'مدیر حساب', null], ['سارا رضایی', 'سهم ماهانه ۱۵۰ میلی', 'sara'], ['رضا رضایی', 'سهم ماهانه ۹۰ میلی', 'reza']];
  return (
    <>
      <NavBar title="خانواده رضایی" />
      <div className="card gold row"><Users size={22} className="gold" /><span className="grow small" style={{ lineHeight: 1.9 }}>میلی خانواده مشترک است. برای هر عضو سهم ماهانه تعیین کن و خرج‌ها را ببین.</span></div>
      <SectionTitle title="اعضا" link="افزودن عضو" onLink={() => toast('دعوت‌نامه فرستاده شد')} />
      <div className="card" style={{ padding: '4px 18px' }}>
        {members.map(([n, s, id]) => (
          <Row key={n} start={<span className="badge-ic"><User size={19} /></span>} title={n} sub={s}
            end={id ? <button className="btn primary small" onClick={() => go('send', { to: id })}>ارسال سهم</button> : null} />
        ))}
      </div>
      <SectionTitle title="خرج‌های این ماه" />
      <Row start={<span className="badge-ic"><ShoppingBag size={19} /></span>} title="خرید خانه" sub="همه اعضا" end={<span>−<M m={372} /></span>} />
      <Row start={<span className="badge-ic"><Store size={19} /></span>} title="سارا" sub="سهم ماهانه" end={<span>−<M m={96} /></span>} />
      <Row start={<span className="badge-ic"><Store size={19} /></span>} title="رضا" sub="سهم ماهانه" end={<span>−<M m={36} /></span>} />
    </>
  );
}

export function MyQR() {
  const { toast } = useApp();
  return (
    <>
      <NavBar title="QR من" />
      <div className="col" style={{ alignItems: 'center', marginTop: 8 }}>
        <div className="card" style={{ padding: 20 }}><FakeQR seed={23} size={230} abs={false} /></div>
        <span className="h2 mt16">علی رضایی</span>
        <span className="small muted mt8">دوستانت با اسکن این کد به تو میلی می‌فرستند</span>
      </div>
      <div className="row mt24" style={{ gap: 10 }}>
        <button className="btn primary" onClick={() => toast('پیوند دریافت میلی کپی شد')}><Copy size={18} />کپی پیوند</button>
        <button className="btn ghost" onClick={() => toast('کد برای اشتراک آماده شد')}><Share2 size={18} />اشتراک</button>
      </div>
    </>
  );
}

export function Business() {
  const { state, go, act } = useApp();
  const hours = [3, 5, 4, 8, 12, 9, 14, 11, 7];
  const mx = Math.max(...hours);
  const toman = Math.round(1440 * PRICE);
  return (
    <>
      <NavBar title="کافه نارنج" />
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="small muted">فروش امروز</div>
        <div className="big-num num mt8"><M m={1440} /></div>
        <div className="small muted mt8">۳۲ پرداخت</div>
        <div className="row mt16" style={{ alignItems: 'flex-end', height: 70, gap: 6, direction: 'ltr' }}>
          {hours.map((h, i) => <i key={i} style={{ flex: 1, height: `${(h / mx) * 100}%`, background: i === 6 ? 'var(--gold)' : 'var(--track)', borderRadius: 6 }} />)}
        </div>
      </div>
      <div className="row mt16" style={{ gap: 10 }}>
        <button className="btn primary" onClick={() => go('myqr')}>QR فروشگاه</button>
        <button className="btn ghost" disabled={state.settled} onClick={() => act('settle', { toman })}>{state.settled ? 'تسویه شد' : 'تسویه به کیف ریالی'}</button>
      </div>
      <SectionTitle title="پرداخت‌های اخیر" />
      <Row start={<TxIcon kind="in" />} title="رضا کریمی" sub="۱۱:۲۰" end={<span className="up">+<M m={17} /></span>} />
      <Row start={<TxIcon kind="in" />} title="مریم نوری" sub="۱۰:۴۵" end={<span className="up">+<M m={34} /></span>} />
      <Row start={<TxIcon kind="in" />} title="ندا رحیمی" sub="۱۰:۱۰" end={<span className="up">+<M m={25} /></span>} />
    </>
  );
}

/* ───────────── کارت ───────────── */
export function CardAction({ p }) {
  const { state, patch, act, toast } = useApp();
  const [pin, setPin] = useState('');
  const [show, setShow] = useState(false);
  const [sw, setSw] = useState({ net: true, tap: true, intl: false });
  const kind = p.kind;
  if (kind === 'pin') {
    const onKey = (k) => {
      if (k === 'del') return setPin((s) => s.slice(0, -1));
      const d = '۰۱۲۳۴۵۶۷۸۹'.indexOf(k);
      if (d >= 0) setPin((s) => (s.length >= 4 ? s : s + d));
    };
    return (
      <>
        <NavBar title="رمز دوم" />
        <Sub>رمز دوم پویا یا ثابت کارت را تعیین کن. ۴ رقم وارد کن.</Sub>
        <div className="row mt24" style={{ justifyContent: 'center', gap: 14 }}>
          {[0, 1, 2, 3].map((i) => <span key={i} style={{ width: 18, height: 18, borderRadius: 9, background: i < pin.length ? 'var(--gold)' : 'var(--track)' }} />)}
        </div>
        <Keypad onKey={onKey} />
        <button className="btn primary mt12" disabled={pin.length < 4} onClick={() => act('cardPin')}>ثبت رمز</button>
      </>
    );
  }
  if (kind === 'number') {
    return (
      <>
        <NavBar title="شماره کارت" />
        <div className="card">
          <div className="small muted">شماره کارت</div>
          <div className="h1 num mt8" style={{ direction: 'ltr', textAlign: 'left', letterSpacing: 1 }}>{show ? '۵۰۲۲ ۲۹۱۰ ۴۴۸۱ ۹۲۰۳' : '۵۰۲۲ •••• •••• ۹۲۰۳'}</div>
          <div className="divider" />
          <div className="between small"><span className="muted">CVV2</span><span className="num">{show ? '۷۴۱' : '•••'}</span></div>
          <div className="divider" />
          <div className="between small"><span className="muted">انقضا</span><span className="num">۰۸/۲۹</span></div>
        </div>
        <div className="row mt16" style={{ gap: 10 }}>
          <button className="btn ghost" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}{show ? 'پنهان کردن' : 'نمایش'}</button>
          <button className="btn primary" onClick={() => toast('شماره کارت کپی شد')}><Copy size={18} />کپی</button>
        </div>
      </>
    );
  }
  if (kind === 'freeze') {
    return (
      <>
        <NavBar title="مسدودسازی موقت" />
        <div className="card row"><Lock size={22} className="gold" /><span className="grow small" style={{ lineHeight: 1.9 }}>با مسدود کردن موقت، تا زمانی که رفع نکنی هیچ خریدی با کارت انجام نمی‌شود. پشتوانه‌ات سر جایش می‌ماند.</span></div>
        <div className="between card soft mt16" style={{ padding: 14 }}>
          <span className="h3">{state.frozen ? 'کارت مسدود است' : 'کارت فعال است'}</span>
          <Toggle on={state.frozen} onClick={() => { patch((s) => ({ frozen: !s.frozen })); toast(state.frozen ? 'مسدودی کارت رفع شد' : 'کارت موقتاً مسدود شد'); }} />
        </div>
      </>
    );
  }
  const rows = [['net', 'پرداخت اینترنتی'], ['tap', 'پرداخت بدون تماس'], ['intl', 'خرید خارجی']];
  return (
    <>
      <NavBar title="تنظیمات کارت" />
      <div className="card" style={{ padding: '4px 18px' }}>
        {rows.map(([k, l]) => <Row key={k} title={l} end={<Toggle on={sw[k]} onClick={() => setSw({ ...sw, [k]: !sw[k] })} />} />)}
        <Row title="سقف خرید روزانه" sub="۵۰ میلیون تومان" chevron onClick={() => toast('سقف روزانه تغییر کرد')} />
      </div>
    </>
  );
}

const ALL_BACKING = ['milli', 'millix', 'goldfund', 'income', 'silver', 'usdt', 'btc', 'eth', 'rial'];
const LABELS = { ...backingLabels, eth: { name: 'اتریوم', color: '#8c8cf0' } };
export function Backing() {
  const { state, patch } = useApp();
  const on = state.backing;
  const off = ALL_BACKING.filter((x) => !on.includes(x));
  const bal = (id) => (id === 'milli' ? <M m={state.milli} /> : id === 'rial' ? <span className="num">{money(state.rial, 'toman', false)}</span> : <M t={state.assets.find((a) => a.id === id)?.value || 0} />);
  const move = (i, d) => patch((s) => {
    const a = [...s.backing]; const j = i + d;
    if (j < 0 || j >= a.length) return {};
    [a[i], a[j]] = [a[j], a[i]];
    return { backing: a };
  });
  return (
    <>
      <NavBar title="پشتوانه پرداخت" />
      <Sub>هر خرید با کارت، به ترتیب از اولین پشتوانه‌ای که موجودی دارد کم می‌شود.</Sub>
      <SectionTitle title="ترتیب برداشت" />
      <div className="card" style={{ padding: '4px 18px' }}>
        {on.map((id, i) => (
          <Row key={id}
            start={<span className="badge-ic" style={{ width: 30, height: 30, borderRadius: 9, background: i === 0 ? 'var(--gold)' : 'var(--track)', color: i === 0 ? '#000' : 'var(--text)', fontWeight: 800, fontSize: 14 }}>{fa(i + 1)}</span>}
            title={LABELS[id].name} sub={bal(id)}
            end={
              <span className="row" style={{ gap: 4 }}>
                <button className="icon-btn" style={{ width: 34, height: 34 }} disabled={i === 0} onClick={() => move(i, -1)} aria-label="بالا"><ChevronUp size={18} /></button>
                <button className="icon-btn" style={{ width: 34, height: 34 }} disabled={i === on.length - 1} onClick={() => move(i, 1)} aria-label="پایین"><ChevronDown size={18} /></button>
                <button className="icon-btn" style={{ width: 34, height: 34 }} disabled={on.length === 1} onClick={() => patch((s) => ({ backing: s.backing.filter((x) => x !== id) }))} aria-label="حذف"><X size={17} /></button>
              </span>
            } />
        ))}
      </div>
      {off.length > 0 && (
        <>
          <SectionTitle title="افزودن پشتوانه" />
          <div className="card" style={{ padding: '4px 18px' }}>
            {off.map((id) => (
              <Row key={id} start={<AssetIcon color={LABELS[id].color} />} title={LABELS[id].name} sub={bal(id)}
                end={<button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => patch((s) => ({ backing: [...s.backing, id] }))} aria-label="افزودن"><Plus size={18} /></button>} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

/* ───────────── تنظیمات و پروفایل ───────────── */
export function Settings({ p }) {
  const { toast, state, patch } = useApp();
  const pr = state.protect;
  const tp = (k) => patch((s) => ({ protect: { ...s.protect, [k]: !s.protect[k] } }));
  const [sw, setSw] = useState({ fp: true, pin: true, two: true, a: true, b: true, c: false, d: true });
  const tg = (k) => setSw((s) => ({ ...s, [k]: !s[k] }));
  const R = (k, t, s) => <Row key={k} title={t} sub={s} end={<Toggle on={sw[k]} onClick={() => tg(k)} />} />;
  if (p.kind === 'security') {
    return (
      <>
        <NavBar title="امنیت و ورود" />
        <div className="card" style={{ padding: '4px 18px' }}>
          {R('fp', 'ورود با اثر انگشت')}
          {R('pin', 'قفل برنامه با رمز')}
          {R('two', 'تأیید دومرحله‌ای', 'کد پیامکی هنگام ورود')}
          <Row title="تغییر رمز" chevron onClick={() => toast('لینک تغییر رمز پیامک شد')} />
        </div>
        <SectionTitle title="محافظت از دارایی" />
        <div className="card gold row"><ShieldCheck size={22} className="gold" /><span className="grow small" style={{ lineHeight: 1.9 }}>انتقال‌های بزرگ فقط با تأیید خودت انجام می‌شود؛ حتی اگر گوشی دست کس دیگری باشد.</span></div>
        <div className="card mt12" style={{ padding: '4px 18px' }}>
          <Row start={<span className="badge-ic"><ScanFace size={19} /></span>} title="تأیید چهره برای انتقال بزرگ" sub={`بالاتر از ${fa(pr.limit)} میلی`} end={<Toggle on={pr.face} onClick={() => tp('face')} />} />
          <Row start={<span className="badge-ic"><Coins size={19} /></span>} title="سقف بدون تأیید چهره" sub="برای انتقال، فروش و برداشت" end={<span className="num">{fa(pr.limit)} میلی</span>} chevron
            onClick={() => patch((s) => ({ protect: { ...s.protect, limit: s.protect.limit === 5000 ? 10000 : s.protect.limit === 10000 ? 2000 : 5000 } }))} />
          <Row start={<span className="badge-ic"><MapPin size={19} /></span>} title="مکان‌های امن" sub="خانه و محل کار" end={<Toggle on={pr.places} onClick={() => tp('places')} />} />
          <Row start={<span className="badge-ic"><Timer size={19} /></span>} title="مکث یک‌ساعته بیرون از مکان‌های امن" sub="برای انتقال‌های بالاتر از سقف" end={<Toggle on={pr.delay} onClick={() => tp('delay')} />} />
        </div>
      </>
    );
  }
  if (p.kind === 'notif') {
    return (
      <>
        <NavBar title="اعلان‌ها" />
        <div className="card" style={{ padding: '4px 18px' }}>
          {R('a', 'تراکنش‌ها')}
          {R('b', 'قیمت میلی', 'تغییرهای مهم قیمت')}
          {R('c', 'پیشنهادهای ویژه')}
          {R('d', 'سررسید اقساط و قبض‌ها')}
        </div>
      </>
    );
  }
  if (p.kind === 'invite') {
    return (
      <>
        <NavBar title="دعوت از دوستان" />
        <div className="card gold" style={{ textAlign: 'center' }}>
          <Gift size={34} className="gold" />
          <div className="h2 mt12">برای هر دعوت ۳۰ میلی هدیه</div>
          <Sub>دوستت هم ۳۰ میلی هدیه می‌گیرد.</Sub>
        </div>
        <div className="field mt16 between"><span className="num h3" style={{ letterSpacing: 2 }}>ALI-MILLI</span><Link2 size={18} className="muted" /></div>
        <div className="row mt16" style={{ gap: 10 }}>
          <button className="btn primary" onClick={() => toast('کد دعوت کپی شد')}><Copy size={18} />کپی کد</button>
          <button className="btn ghost" onClick={() => toast('پیوند دعوت آماده شد')}><Share2 size={18} />اشتراک</button>
        </div>
      </>
    );
  }
  if (p.kind === 'support') {
    return (
      <>
        <NavBar title="پشتیبانی" />
        <div className="card gold row"><Headphones size={22} className="gold" /><span className="grow small">پاسخ‌گویی شبانه‌روزی</span></div>
        <button className="btn primary mt16" onClick={() => toast('گفتگو با پشتیبانی شروع شد')}>شروع گفتگو</button>
        <SectionTitle title="پرسش‌های پرتکرار" />
        <div className="card" style={{ padding: '4px 18px' }}>
          <Row title="هر میلی چقدر است؟" sub="یک میلی‌گرم طلای ۱۸ عیار" />
          <Row title="چطور میلی بفروشم؟" sub="از صفحه اول، دکمه فروش؛ پول به کیف ریالی می‌آید" />
          <Row title="پاداش چطور محاسبه می‌شود؟" sub="روی هر خرید با کارت و QR" />
        </div>
      </>
    );
  }
  return (
    <>
      <NavBar title="درباره میلی" />
      <div className="col" style={{ alignItems: 'center', marginTop: 12 }}>
        <Logo size={72} />
        <span className="h2 mt16">میلی</span>
        <span className="small muted mt8">نسخه ۱٫۰</span>
      </div>
      <div className="card mt24 small" style={{ lineHeight: 2 }}>هر میلی یک میلی‌گرم طلای ۱۸ عیار است. با میلی پس‌انداز کن، خرج کن، بفرست و سرمایه‌گذاری کن.</div>
    </>
  );
}

/* ───────────── پذیرنده‌ها ───────────── */
export function Merchants() {
  const { go } = useApp();
  const pins = [[70, 40], [200, 90], [120, 140], [280, 60], [250, 150]];
  return (
    <>
      <NavBar title="پذیرنده‌ها" />
      <div style={{ position: 'relative', height: 200, borderRadius: 22, overflow: 'hidden', background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
        <svg width="100%" height="100%" viewBox="0 0 350 200" style={{ position: 'absolute', inset: 0 }}>
          {[40, 90, 140, 190].map((y) => <line key={y} x1="0" y1={y} x2="350" y2={y - 24} style={{ stroke: 'var(--line)' }} strokeWidth="10" />)}
          {[60, 150, 240, 320].map((x) => <line key={x} x1={x} y1="0" x2={x + 30} y2="200" style={{ stroke: 'var(--line)' }} strokeWidth="8" />)}
        </svg>
        {pins.map(([x, y], i) => <span key={i} style={{ position: 'absolute', left: x, top: y, width: 26, height: 26, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: 'var(--gold)', display: 'grid', placeItems: 'center' }}><i style={{ width: 8, height: 8, borderRadius: 4, background: '#000' }} /></span>)}
      </div>
      <SectionTitle title="نزدیک تو" />
      {merchants.map((m) => (
        <Row key={m.name} start={<span className="badge-ic"><Store size={19} /></span>} title={m.name} sub={m.sub}
          end={<span className="gold small">پاداش {m.reward}</span>} chevron onClick={() => go('scan')} />
      ))}
    </>
  );
}
