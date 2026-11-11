import React, { useState } from 'react';
import {
  Wallet, Check, QrCode, Image, Flashlight, Search, Share2, Zap, Flame, Droplet, Smartphone,
  ArrowUpDown, Calendar, Repeat, X, Gift, ChevronLeft, Store,
} from 'lucide-react';
import { useApp, NavBar, Keypad, Avatar, Diamond, AssetIcon, Toggle, Row, Logo, M, Alt } from './ui.jsx';
import { PRICE, contacts, bills } from './data.js';
import { fa } from './format.js';

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
  const [raw, , onKey] = useAmount(preset);
  const [auto, setAuto] = useState(false);
  const m = toMilliAmount(raw, unit);
  return (
    <>
      <NavBar title="خرید میلی" end={<UnitFlip />} />
      <div className="field row">
        <Wallet size={20} className="gold" />
        <div className="grow"><label>پرداخت از کیف پول ریالی</label><div className="v num">موجودی {fa(state.rial)} تومان</div></div>
      </div>
      <AmountDisplay raw={raw} unit={unit} />
      <div className="chips">
        {(unit === 'milli' ? [100, 500, 1000, 5000] : [500000, 1000000, 5000000]).map((x) => (
          <span key={x} className="pill num">{fa(x)}</span>
        ))}
      </div>
      <div className="between card soft mt16" style={{ padding: 14 }}>
        <span className="col gap4"><span className="h3">هر هفته همین مقدار بخر</span><span className="xs muted">پس‌انداز خودکار، پنجشنبه‌ها</span></span>
        <Toggle on={auto} onClick={() => setAuto(!auto)} />
      </div>
      <Keypad onKey={onKey} />
      <button className="btn primary mt12" disabled={!m} onClick={() => act('buy', { milli: m, auto })}>خرید {m ? `${fa(m, 1)} میلی` : ''}</button>
    </>
  );
}

/* ───────────── ارسال میلی ───────────── */
export function Send({ to = 'sara', preset = '' }) {
  const { unit, act, go } = useApp();
  const [sel, setSel] = useState(to);
  const [raw, , onKey] = useAmount(preset);
  const c = contacts.find((x) => x.id === sel);
  const m = toMilliAmount(raw, unit);
  return (
    <>
      <NavBar title="ارسال میلی" end={<UnitFlip />} />
      <div className="hscroll" style={{ gap: 14 }}>
        <button className="col gap8" style={{ alignItems: 'center', minWidth: 56 }}>
          <span className="avatar" style={{ background: 'var(--surface)', color: '#fff', width: 48, height: 48 }}><Search size={20} /></span>
          <span className="xs">جستجو</span>
        </button>
        {contacts.map((x) => (
          <button key={x.id} className="col gap8" style={{ alignItems: 'center', minWidth: 56, opacity: x.id === sel ? 1 : 0.45 }} onClick={() => setSel(x.id)}>
            <span style={{ borderRadius: '50%', boxShadow: x.id === sel ? '0 0 0 2px #000, 0 0 0 4px var(--gold)' : 'none' }}><Avatar c={x} size={48} /></span>
            <span className="xs">{x.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>
      <div className="small muted mt16" style={{ textAlign: 'center' }}>به {c.name}</div>
      <AmountDisplay raw={raw} unit={unit} />
      <div className="field" style={{ padding: '10px 16px' }}><input placeholder="یادداشت (مثلاً سهم شام)" defaultValue={preset ? 'سهم شام دیشب' : ''} style={{ width: '100%' }} /></div>
      <Keypad onKey={onKey} />
      <button className="btn primary mt12" disabled={!m} onClick={() => act('send', { milli: m, to: c.name })}>ارسال</button>
    </>
  );
}

/* ───────────── درخواست میلی ───────────── */
export function Request({ preset = '' }) {
  const { unit, act } = useApp();
  const [sel, setSel] = useState('reza');
  const [raw, , onKey] = useAmount(preset);
  const c = contacts.find((x) => x.id === sel);
  return (
    <>
      <NavBar title="درخواست میلی" end={<UnitFlip />} />
      <div className="hscroll" style={{ gap: 14 }}>
        {contacts.map((x) => (
          <button key={x.id} className="col gap8" style={{ alignItems: 'center', minWidth: 56, opacity: x.id === sel ? 1 : 0.45 }} onClick={() => setSel(x.id)}>
            <span style={{ borderRadius: '50%', boxShadow: x.id === sel ? '0 0 0 2px #000, 0 0 0 4px var(--gold)' : 'none' }}><Avatar c={x} size={48} /></span>
            <span className="xs">{x.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>
      <div className="small muted mt16" style={{ textAlign: 'center' }}>از {c.name}</div>
      <AmountDisplay raw={raw} unit={unit} />
      <div className="segment"><button className="on">یک نفر</button><button>تقسیم بین چند نفر</button></div>
      <Keypad onKey={onKey} />
      <div className="row mt12" style={{ gap: 10 }}>
        <button className="btn ghost" style={{ width: 64, flex: 'none' }}><Share2 size={20} /></button>
        <button className="btn primary" onClick={() => act('request', { to: c.name })}>ارسال درخواست</button>
      </div>
    </>
  );
}

/* ───────────── اسکن QR ───────────── */
export function Scan() {
  const { back, go } = useApp();
  return (
    <div style={{ position: 'absolute', inset: '44px 0 0 0' }}>
      <div className="scanner" />
      <button className="viewfinder" onClick={() => go('pay')} aria-label="اسکن کد فروشگاه">
        <FakeQR />
        <i /><i /><i /><i /><span className="scanline" />
      </button>
      <div className="navbar" style={{ position: 'relative', padding: '8px 20px' }}>
        <button className="icon-btn" style={{ background: 'rgba(255,255,255,.12)' }} onClick={back}><X size={20} /></button>
        <span className="title">پرداخت با میلی</span>
        <button className="icon-btn" style={{ background: 'rgba(255,255,255,.12)' }}><Flashlight size={19} /></button>
      </div>
      <div style={{ position: 'absolute', top: 160, width: '100%', textAlign: 'center' }} className="h3">کد QR فروشگاه را اسکن کن</div>
      <div style={{ position: 'absolute', top: 520, width: '100%', textAlign: 'center' }} className="small muted">کافه لمیز · پذیرنده میلی</div>
      <div style={{ position: 'absolute', bottom: 34, left: 20, right: 20 }}>
        <div className="segment" style={{ background: 'rgba(30,30,30,.9)' }}>
          <button className="on"><span className="row gap8" style={{ justifyContent: 'center' }}><QrCode size={16} />اسکن</span></button>
          <button onClick={() => go('myqr')}>QR من</button>
          <button><span className="row gap8" style={{ justifyContent: 'center' }}><Image size={16} />گالری</span></button>
        </div>
      </div>
    </div>
  );
}

// کد QR نمایشی (ثابت، فقط برای تصویر)
function FakeQR() {
  const n = 21;
  const cells = [];
  let seed = 7;
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
    <svg viewBox="-2 -2 25 25" style={{ position: 'absolute', inset: 36, width: 178, height: 178, background: '#fff', borderRadius: 10, opacity: 0.92 }}>
      <g fill="#000">{cells}</g>
    </svg>
  );
}

/* ───────────── تأیید پرداخت ───────────── */
export function Pay() {
  const { act } = useApp();
  const m = 150;
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
        <div className="between small"><span className="muted">پرداخت از</span><span className="row gap8"><Diamond size={9} />میلی</span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">پاداش این خرید</span><span className="gold">+۳ میلی (۲٪)</span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">کارمزد</span><span>رایگان</span></div>
      </div>
      <button className="btn primary" style={{ marginTop: 150 }} onClick={() => act('pay', { milli: m, reward: 3, to: 'کافه لمیز' })}>پرداخت</button>
    </>
  );
}

/* ───────────── موفقیت ───────────── */
export function Success({ title = 'پرداخت انجام شد', amount = 150, sub = 'به کافه لمیز', reward = 3, done }) {
  const { go } = useApp();
  return (
    <div className="col" style={{ alignItems: 'center', paddingTop: 110, minHeight: '100%' }}>
      <span className="success-ring"><Check size={46} strokeWidth={3} /></span>
      <span className="h1 mt32">{title}</span>
      <span className="big-num num mt16">{fa(amount, 1)}<small>میلی</small></span>
      <span className="small muted mt8">{sub}</span>
      {reward ? (
        <div className="card gold mt32 row" style={{ width: '100%' }}>
          <Gift size={22} className="gold" />
          <span className="grow h3">{fa(reward, 1)} میلی پاداش گرفتی</span>
        </div>
      ) : null}
      <div style={{ flex: 1 }} />
      <button className="btn primary mt32" onClick={() => (done ? done() : go('tab:home'))}>بازگشت به میلی</button>
    </div>
  );
}

/* ───────────── قبض و شارژ ───────────── */
const billIcon = { zap: Zap, flame: Flame, drop: Droplet, phone: Smartphone };
export function Bills() {
  const { act } = useApp();
  const [paid, setPaid] = useState([]);
  const total = bills.filter((b) => !paid.includes(b.id)).reduce((s, b) => s + b.toman, 0);
  return (
    <>
      <NavBar title="قبض و شارژ" />
      <div className="segment"><button className="on">قبض‌ها</button><button>شارژ</button><button>اینترنت</button></div>
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
        <Toggle on />
      </div>
      <div className="card mt16">
        <div className="between"><span className="muted small">جمع چهار قبض</span><span className="h2"><M t={total} /></span></div>
        <div className="between mt8 xs muted"><span>پرداخت از میلی</span><span className="gold">۱٪ پاداش</span></div>
      </div>
      <button className="btn primary mt24" onClick={() => act('bills', { milli: total / PRICE })}>پرداخت همه</button>
    </>
  );
}

/* ───────────── تبدیل ───────────── */
export function Convert() {
  const { state, act } = useApp();
  const btc = state.assets.find((a) => a.id === 'btc');
  const fromT = 8000000;
  return (
    <>
      <NavBar title="تبدیل" />
      <div className="card">
        <div className="between small muted"><span>از</span><span>موجودی <M t={btc.value} /></span></div>
        <div className="between mt12">
          <span className="pill" style={{ height: 40 }}><Diamond color={btc.color} size={10} />بیت‌کوین</span>
          <span className="h1 num">{fa(fromT)}</span>
        </div>
        <div className="xs muted mt8" style={{ textAlign: 'left' }}>تومان</div>
      </div>
      <div style={{ display: 'grid', placeItems: 'center', margin: '-14px 0' , position: 'relative', zIndex: 2 }}>
        <span className="icon-btn" style={{ background: 'var(--gold)', color: '#000', border: '4px solid #000', width: 48, height: 48 }}><ArrowUpDown size={20} /></span>
      </div>
      <div className="card">
        <div className="between small muted"><span>به</span><span>موجودی {fa(state.milli)} میلی</span></div>
        <div className="between mt12">
          <span className="pill" style={{ height: 40 }}><Diamond size={10} />میلی</span>
          <span className="h1 num gold">{fa(Math.round(fromT / PRICE))}</span>
        </div>
        <div className="xs muted mt8" style={{ textAlign: 'left' }}>میلی</div>
      </div>
      <div className="row mt16" style={{ gap: 8 }}>
        {['۲۵٪', '۵۰٪', 'همه'].map((x) => <span key={x} className="pill grow" style={{ justifyContent: 'center' }}>{x}</span>)}
      </div>
      <div className="card soft mt16">
        <div className="between small"><span className="muted">نرخ</span><span className="num">هر میلی {fa(PRICE)} تومان</span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">زمان انجام</span><span>فوری</span></div>
      </div>
      <button className="btn primary" style={{ marginTop: 120 }} onClick={() => act('convert', { from: 'btc', toman: fromT })}>تبدیل</button>
    </>
  );
}

/* ───────────── قلک تازه ───────────── */
export function NewJar() {
  const { act } = useApp();
  const icons = ['🏠', '✈️', '🚗', '🎓', '💍', '🎁', '📱', '🌱'];
  const [ic, setIc] = useState('🚗');
  const [freq, setFreq] = useState('هفتگی');
  return (
    <>
      <NavBar title="قلک تازه" />
      <div className="col" style={{ alignItems: 'center' }}>
        <span style={{ fontSize: 56, width: 104, height: 104, display: 'grid', placeItems: 'center', background: 'var(--surface)', borderRadius: 32 }}>{ic}</span>
      </div>
      <div className="row mt16" style={{ justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
        {icons.map((x) => <button key={x} onClick={() => setIc(x)} style={{ fontSize: 22, width: 40, height: 40, borderRadius: 12, background: x === ic ? 'var(--gold-soft)' : 'var(--surface)', border: x === ic ? '1px solid var(--gold)' : 0 }}>{x}</button>)}
      </div>
      <div className="field mt24"><label>نام قلک</label><input className="v" defaultValue="ماشین تازه" style={{ width: '100%' }} /></div>
      <div className="field mt12"><label>هدف</label><div className="v num">۱۲۰٬۰۰۰ میلی <span className="small muted">≈ {fa(120000 * PRICE)} تومان</span></div></div>
      <div className="field mt12 row"><Calendar size={18} className="muted" /><div className="grow"><label>تا</label><div className="v">اسفند ۱۴۰۶</div></div></div>
      <div className="h3 mt24">واریز خودکار</div>
      <div className="segment mt8">{['روزانه', 'هفتگی', 'ماهانه'].map((x) => <button key={x} className={freq === x ? 'on' : ''} onClick={() => setFreq(x)}>{x}</button>)}</div>
      <div className="small muted mt12" style={{ textAlign: 'center' }}>هر {freq === 'روزانه' ? 'روز' : freq === 'هفتگی' ? 'هفته' : 'ماه'} <span className="gold num">{freq === 'روزانه' ? '۲۷۳' : freq === 'هفتگی' ? '۱٬۹۱۰' : '۸٬۲۸۰'} میلی</span> تا رسیدن به هدف</div>
      <button className="btn primary mt24" onClick={() => act('jar', { name: 'ماشین تازه', icon: ic, freq })}>ساخت قلک</button>
    </>
  );
}

/* ───────────── افزایش اعتبار ───────────── */
export function CreditUp() {
  const { state, act } = useApp();
  const [v, setV] = useState(120);
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
        <Row start={<AssetIcon color="#fbb918" />} title="میلی" sub={`${fa(state.milli)} میلی`} end={<Toggle on />} />
        <Row start={<AssetIcon color="#2a49e8" />} title="صندوق طلای میلی" sub="۴۸٬۰۰۰ واحد" end={<Toggle on />} />
        <Row start={<AssetIcon color="#5470ff" />} title="صندوق درآمد ثابت" sub="سود روزشمار" end={<Toggle on />} />
        <Row start={<AssetIcon color="#c9ced6" />} title="نقره" sub="۴۱۰ گرم" end={<Toggle on={false} />} />
        <Row start={<AssetIcon color="#26a17b" />} title="تتر" sub="۱۲۶ USDT" end={<Toggle on={false} />} />
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
        <span style={{ position: 'absolute', width: 84, height: 84, transform: 'translate(-104px,-104px) rotate(45deg)', borderRadius: 18, border: '2px solid #333' }} />
        <span style={{ position: 'absolute', width: 56, height: 56, transform: 'translate(108px,104px) rotate(45deg)', borderRadius: 12, background: '#1f1f1f' }} />
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
      <span className="h1 mt24">۱۰۰ میلی هدیه گرفتی</span>
      <span className="muted mt12" style={{ textAlign: 'center', lineHeight: 1.9 }}>حسابت آماده است. اولین میلی‌هایت در کیف تو است؛ حالا می‌توانی بیشتر بخری یا به دوستت بفرستی.</span>
      <div className="card mt32" style={{ width: '100%' }}>
        <div className="between"><span className="muted small">موجودی میلی</span><span className="h2 num">۱۰۰ میلی</span></div>
        <div className="divider" />
        <div className="between"><span className="muted small">قیمت هر میلی</span><span className="h3 num">{fa(PRICE)} تومان</span></div>
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn primary mt32" onClick={() => go('buy')}>خرید اولین میلی</button>
      <button className="btn mt8" style={{ color: 'var(--muted)' }} onClick={() => go('tab:home')}>رفتن به خانه</button>
    </div>
  );
}
