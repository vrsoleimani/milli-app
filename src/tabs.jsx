import React, { useState } from 'react';
import {
  Plus, Minus, Send, QrCode, Wallet, ChevronLeft, Sparkles, ArrowLeftRight, HandCoins,
  ShoppingBag, Landmark, CalendarClock, Gauge, Receipt, ShieldCheck, Building2, Truck, MapPin,
  Gift, Users, Star, KeyRound, PiggyBank, X, TrendingUp, Hash, Snowflake, Settings, GripVertical, Briefcase, Bell, Lock,
  HelpCircle, Info, UserPlus, Store, Coins, Smartphone, User, Gem, Hammer, WalletCards, LogOut,
} from 'lucide-react';
import {
  useApp, TopBar, ViewToggles, BigAmount, M, Alt, Change, Diamond, AssetIcon, TxIcon, SectionTitle,
  Row, Logo, Avatar, Toggle, TabHead, AskBar, NavBar,
} from './ui.jsx';
import { salaryLine } from './extra.jsx';
import { PRICE, PRICE_CHANGE, contacts, merchants, backingLabels } from './data.js';
import { fa } from './format.js';
import { MONTHS } from './store.jsx';

/* ───────────── تب میلی (خانه) ───────────── */
export function Home() {
  const { state, go } = useApp();
  const [tip, setTip] = useState(true);
  const next = state.installments?.[0];
  return (
    <>
      <TopBar />
      <AskBar />
      <div className="balance-card">
        <div className="between">
          <span className="muted small">موجودی میلی</span>
          <ViewToggles />
        </div>
        <div className="mt12"><BigAmount milli={state.milli} /></div>
        <div className="between mt8">
          <span className="small muted"><Alt m={state.milli} /></span>
        </div>
        <div className="divider" />
        <button className="between" style={{ width: '100%' }} onClick={() => go('price')}>
          <span className="row gap8"><Diamond size={11} /><span className="small">قیمت هر میلی</span></span>
          <span className="row gap8">
            <span className="h3 num">{fa(PRICE)} تومان</span>
            <Change v={PRICE_CHANGE} />
            <Sparkline />
          </span>
        </button>
      </div>

      <div className="actions">
        <button className="action main" onClick={() => go('buy')}><span className="ic"><Plus size={24} /></span>خرید</button>
        <button className="action" onClick={() => go('sell')}><span className="ic"><Minus size={22} /></span>فروش</button>
        <button className="action" onClick={() => go('send')}><span className="ic"><Send size={22} /></span>انتقال</button>
      </div>

      {tip && next && (
        <div className="card gold mt16 row" style={{ padding: 14 }}>
          <Sparkles size={20} className="gold" />
          <button className="grow col gap4" style={{ textAlign: 'right' }} onClick={() => go('payInstallment', { id: next.id })}>
            <span className="h3">قسط ۲۵ {MONTHS[next.k % 12]} نزدیک است</span>
            <span className="xs muted">با یک لمس از میلی بپرداز · <M t={next.monthly} /></span>
          </button>
          <button onClick={() => setTip(false)} aria-label="بستن" className="faint"><X size={17} /></button>
        </div>
      )}

      <button className="card mt16 row" style={{ width: '100%', textAlign: 'right' }} onClick={() => go('wallet')}>
        <span className="badge-ic"><Wallet size={20} /></span>
        <span className="grow col gap4">
          <span className="h3">کیف پول ریالی</span>
          <span className="xs muted">تقسیم حقوق: {salaryLine(state.salary)}</span>
        </span>
        <span className="col" style={{ alignItems: 'flex-end' }}>
          <span className="h3 num"><Rial t={state.rial} /></span>
        </span>
        <ChevronLeft size={18} className="faint" />
      </button>

      <SectionTitle title="برای تو" />
      <div className="hscroll">
        {[
          ['loan', Landmark, 'دریافت وام', 'با پشتوانه دارایی‌هایت، در چند دقیقه', {}],
          ['credit', Gem, 'خرید قسطی طلا', 'امروز بخر، تا ۱۲ قسط بپرداز', { merchant: 'میلی گالری' }],
          ['goldyield', TrendingUp, 'سود طلایی', 'ماهانه ۱٪ سود، به میلی', {}],
        ].map(([id, Ic, t, d, p]) => (
          <button key={id} className="jar promo" onClick={() => go(id, p)}>
            <Ic size={24} className="gold" />
            <div className="h3 mt8">{t}</div>
            <div className="xs muted mt8">{d}</div>
          </button>
        ))}
      </div>

      <SectionTitle title="تراکنش‌های اخیر" link="همه" onLink={() => go('history')} />
      <div>
        {state.tx.slice(0, 5).map((t) => (
          <Row key={t.id} start={<TxIcon kind={t.icon} />} title={t.title} sub={t.sub}
            end={<span className={t.milli > 0 ? 'up' : ''}>{t.milli > 0 ? '+' : '−'}<M m={Math.abs(t.milli)} /></span>} />
        ))}
      </div>
    </>
  );
}

// کیف پول ریالی همیشه به تومان نشان داده می‌شود
function Rial({ t }) {
  const { hidden } = useApp();
  return <>{hidden ? '••••••' : `${fa(t)} تومان`}</>;
}

function Sparkline() {
  return (
    <svg width="44" height="18" viewBox="0 0 44 18">
      <polyline points="0,14 7,12 13,13 19,9 26,10 32,6 38,7 44,3" fill="none" stroke="#2bd36b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ───────────── تب دارایی‌ها ───────────── */
const GROUPS = ['همه', 'فلزات', 'رمزارز', 'سهام', 'صندوق'];

export function Assets() {
  const { state, go, hidden } = useApp();
  const [g, setG] = useState('همه');
  const locked = (state.locks || []).reduce((s, l) => s + l.milli, 0);
  const milliToman = (state.milli + locked) * PRICE;
  const total = milliToman + state.assets.reduce((s, a) => s + a.value, 0);
  const parts = [{ name: 'میلی', value: milliToman, color: '#fbb918' }, ...state.assets];
  const shown = state.assets.filter((a) => g === 'همه' || a.group === g);
  return (
    <>
      <TabHead title="دارایی‌ها" />
      <div className="card">
        <span className="small muted">مجموع دارایی</span>
        <div className="mt8"><BigAmount toman={total} /></div>
        <div className="between mt8">
          <span className="small muted"><Alt t={total} /></span>
          <Change v={5.1} suffix="در یک ماه" />
        </div>
        <div className="stack-bar mt16">
          {parts.map((p) => <i key={p.name} style={{ flex: p.value, background: p.color }} />)}
        </div>
        <div className="row mt12" style={{ flexWrap: 'wrap', gap: '6px 14px' }}>
          {[['میلی', '#fbb918', milliToman], ['صندوق‌ها', '#2a49e8', 108500000], ['رمزارز', '#f7931a', 54200000], ['سهام', '#3b82f6', 8420000], ['سکه و فلزات', '#c9ced6', 29300000]].map(([n, c, v]) => (
            <span key={n} className="row xs" style={{ gap: 6 }}><Diamond color={c} size={8} />{n} {fa(Math.round((v / total) * 100))}٪</span>
          ))}
        </div>
      </div>

      <div className="row mt16" style={{ gap: 10 }}>
        <button className="btn primary" style={{ height: 48 }} onClick={() => go('buyAsset')}><Plus size={19} />خرید</button>
        <button className="btn ghost" style={{ height: 48 }} onClick={() => go('convert')}><ArrowLeftRight size={19} />تبدیل</button>
      </div>

      <SectionTitle title="میلی" />
      <button className="card soft row" style={{ width: '100%', textAlign: 'right' }} onClick={() => go('tab:home')}>
        <span className="badge-ic" style={{ background: '#000' }}><Diamond /></span>
        <span className="grow col gap4">
          <span className="h3">طلا</span>
          <span className="small muted num">{hidden ? '••••' : `${fa((state.milli + locked) / 1000, 2)} گرم`}</span>
        </span>
        <span className="col gap4" style={{ alignItems: 'flex-end' }}>
          <span className="h3"><M t={milliToman} /></span>
          <Change v={3.1} />
        </span>
      </button>
      {locked > 0 && (
        <button className="row mt8 card soft" style={{ padding: 14, width: '100%', textAlign: 'right' }} onClick={() => go('goldyield')}>
          <TrendingUp size={20} className="gold" />
          <span className="grow small">در سود طلایی · ماهانه ۱٪</span>
          <span className="small gold"><M m={locked} /></span>
          <ChevronLeft size={16} className="faint" />
        </button>
      )}

      <SectionTitle title="قلک‌ها" link="قلک تازه" onLink={() => go('jar')} />
      <div className="hscroll">
        {state.jars.map((j) => (
          <div className="jar" key={j.id}>
            {j.group && <Users size={16} className="grp" />}
            <div style={{ fontSize: 24 }}>{j.icon}</div>
            <div className="h3 mt8">{j.name}</div>
            <div className="small mt8"><M m={j.saved} /></div>
            <div className="bar mt8"><i style={{ width: `${Math.max(4, (j.saved / j.goal) * 100)}%` }} /></div>
            <div className="xs muted mt8">{j.auto}</div>
          </div>
        ))}
      </div>

      <SectionTitle title="سایر دارایی‌ها" />
      <div className="hscroll" style={{ gap: 8 }}>
        {GROUPS.map((x) => <button key={x} className={`pill ${g === x ? 'active' : ''}`} onClick={() => setG(x)}>{x}</button>)}
      </div>
      <div className="mt8">
        {shown.map((a) => (
          <Row key={a.id} start={<AssetIcon color={a.color} />} title={a.name} sub={a.sub}
            end={<M t={a.value} />} endSub={<Change v={a.change} />} onClick={() => go('asset', { id: a.id })} />
        ))}
      </div>

      <button className="card gold mt16 row" style={{ width: '100%', textAlign: 'right' }} onClick={() => go('advisor')}>
        <span className="badge-ic" style={{ background: 'rgba(251,185,24,.18)' }}><Sparkles size={20} className="gold" /></span>
        <span className="grow col gap4">
          <span className="h3">مشاور هوشمند میلی</span>
          <span className="xs muted">راهنمایی به سمت بهترین سرمایه‌گذاری‌ها</span>
        </span>
        <ChevronLeft size={18} className="faint" />
      </button>
    </>
  );
}

/* ───────────── تب خدمات ───────────── */
export function Services() {
  const { state, go } = useApp();
  const tiles = [
    ['gallery', 'میلی گالری', Gem], ['goldyield', 'سود طلایی', TrendingUp], ['bills', 'قبض و شارژ', Receipt], ['insurance', 'بیمه', ShieldCheck],
    ['realestate', 'املاک', Building2], ['delivery', 'تحویل فیزیکی', Truck], ['giftcard', 'کارت هدیه', Gift],
    ['family', 'خانواده', Users], ['rewards', 'باشگاه پاداش', Star],
  ];
  return (
    <>
      <TabHead title="خدمات" />
      <div className="grid4" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {tiles.map(([id, label, Ic]) => (
          <button key={id} className="tile" onClick={() => go(id)}>
            <span className="ic"><Ic size={23} strokeWidth={1.7} /></span>{label}
          </button>
        ))}
      </div>

      <SectionTitle title="پذیرنده‌ها" link="نقشه" onLink={() => go('merchants')} />
      <div>
        {merchants.map((m) => (
          <Row key={m.name} start={<span className="badge-ic"><Store size={19} /></span>} title={m.name} sub={m.sub}
            end={<span className="gold small">پاداش {m.reward}</span>} />
        ))}
      </div>

      <SectionTitle title="پیشنهاد برای شما" />
      <div className="hscroll">
        <button className="jar" style={{ minWidth: 220, textAlign: 'right' }} onClick={() => go('insurance')}>
          <ShieldCheck size={24} className="gold" />
          <div className="h3 mt8">بیمه بدنه با میلی</div>
          <div className="xs muted mt8">حق بیمه را قسطی و با میلی بپرداز</div>
        </button>
        <button className="jar" style={{ minWidth: 220, textAlign: 'right' }} onClick={() => go('realestate')}>
          <Building2 size={24} className="gold" />
          <div className="h3 mt8">املاک متری</div>
          <div className="xs muted mt8">از ۵۰۰ میلی، صاحب سهمی از ملک شو</div>
        </button>
        <button className="jar" style={{ minWidth: 220, textAlign: 'right' }} onClick={() => go('delivery')}>
          <Coins size={24} className="gold" />
          <div className="h3 mt8">سکه و شمش درب منزل</div>
          <div className="xs muted mt8">میلی‌ات را به طلای فیزیکی تبدیل کن</div>
        </button>
      </div>
    </>
  );
}

/* ───────────── تب کارت ───────────── */
export function Card() {
  const { state, go } = useApp();
  const left = state.credit.limit - state.credit.used;
  const next = state.installments[0];
  return (
    <>
      <TabHead title="کارت و اعتبار" />
      <div className="bank-card">
        <div className="between">
          <Logo size={36} />
          <span className="pill active" style={{ height: 28, fontSize: 12 }}>{state.frozen ? 'مسدود موقت' : 'اعتباری'}</span>
        </div>
        <div className="num" style={{ direction: 'ltr', fontSize: 22, letterSpacing: 2, marginTop: 52, textAlign: 'left' }}>5022 •••• •••• 9203</div>
        <div className="between mt12">
          <span style={{ fontWeight: 600 }}>علی رضایی</span>
          <span className="small" style={{ direction: 'ltr', color: '#ddd' }}>08/29</span>
        </div>
      </div>

      <div className="row mt16 card soft" style={{ padding: 14 }}>
        <Gift size={20} className="gold" />
        <span className="grow small">۱٪ هر خرید با کارت، میلی به حسابت برمی‌گردد</span>
        <span className="small gold"><M m={state.rewardsMonth} /></span>
      </div>

      <button className="row mt8 card soft" style={{ padding: 14, width: '100%', textAlign: 'right' }} onClick={() => go('roundup')}>
        <PiggyBank size={20} className="gold" />
        <span className="grow small">خرده‌پول هر خرید، میلی می‌شود{state.roundup.on ? '' : ' (خاموش)'}</span>
        <span className="small gold"><M m={state.roundup.saved} /></span>
        <ChevronLeft size={16} className="faint" />
      </button>

      <SectionTitle title="اعتبار شما" link="افزایش سقف" onLink={() => go('creditUp')} />
      <div className="card">
        <div className="between">
          <span className="small muted">اعتبار باقی‌مانده</span>
          <span className="pill" style={{ height: 26, fontSize: 12 }}>رتبه {state.credit.score}</span>
        </div>
        <div className="h1 mt8"><M t={left} /></div>
        <div className="bar mt12" style={{ height: 8 }}><i style={{ width: `${(left / state.credit.limit) * 100}%` }} /></div>
        <div className="between mt8 xs muted"><span>سقف <M t={state.credit.limit} /></span><span>پشتوانه: سبد دارایی شما</span></div>
      </div>

      {next ? (
        <div className="card soft mt12 row">
          <span className="badge-ic" style={{ background: '#000' }}><CalendarClock size={20} /></span>
          <span className="grow col gap4">
            <span className="h3">قسط بعدی · ۲۵ {MONTHS[next.k % 12]}</span>
            <span className="small muted"><M t={next.monthly} /></span>
          </span>
          <button className="btn primary small" onClick={() => go('payInstallment', { id: next.id })}>پرداخت</button>
        </div>
      ) : (
        <div className="card soft mt12 row"><CalendarClock size={20} className="gold" /><span className="grow small">قسط باز نداری</span></div>
      )}

      <div className="grid4 mt16" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[['credit', 'خرید اعتباری', ShoppingBag], ['loan', 'وام', Landmark], ['installments', 'اقساط', CalendarClock], ['score', 'امتیاز اعتباری', Gauge]].map(([id, l, Ic]) => (
          <button key={id} className="tile" onClick={() => go(id)}><span className="ic"><Ic size={21} strokeWidth={1.7} /></span>{l}</button>
        ))}
      </div>

      <div className="grid4 mt24" style={{ gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
        {[['رمز دوم', KeyRound, 'cardAction', 'pin'], ['شماره کارت', Hash, 'cardAction', 'number'], [state.frozen ? 'رفع مسدودی' : 'مسدود موقت', Snowflake, 'cardAction', 'freeze'], ['پشتوانه', WalletCards, 'backing'], ['تنظیمات', Settings, 'cardAction', 'settings']].map(([l, Ic, to, kind]) => (
          <button key={l} className="tile" style={{ padding: '12px 2px', fontSize: 11 }} onClick={() => go(to, { kind })}><span className="ic"><Ic size={21} strokeWidth={1.7} /></span>{l}</button>
        ))}
      </div>

      <SectionTitle title="خریدهای اخیر" />
      <Row start={<span className="badge-ic"><ShoppingBag size={19} /></span>} title="دیجی‌کالا" sub="امروز · از میلی" end={<span>−<M m={312} /></span>} endSub={<span className="gold xs">+۳ پاداش · +۱ خرده‌پول</span>} />
      <Row start={<span className="badge-ic"><Store size={19} /></span>} title="افق کوروش" sub="دیروز · از میلی" end={<span>−<M m={88} /></span>} endSub={<span className="gold xs">+۱ میلی پاداش</span>} />
      <Row start={<span className="badge-ic"><Smartphone size={19} /></span>} title="اسنپ" sub="۱۸ آبان · از تتر" end={<span>−<M m={41} /></span>} />
    </>
  );
}

/* ───────────── تب پروفایل ───────────── */
export function Profile() {
  const { go, unit, setUnit, state } = useApp();
  return (
    <>
      <NavBar title="پروفایل" />
      <div className="col" style={{ alignItems: 'center', padding: '0 0 6px' }}>
        <span className="avatar" style={{ width: 84, height: 84, fontSize: 30, background: 'var(--gold)' }}>ع</span>
        <span className="h2 mt12">علی رضایی</span>
        <span className="small muted mt8 num">۰۹۱۲ ۳۴۵ ۶۷۸۹ · احراز کامل</span>
      </div>

      <SectionTitle title="حساب‌ها" link="حساب تازه" onLink={() => go('newAccount')} />
      <div className="card" style={{ padding: '4px 18px' }}>
        {state.accounts.map((a) => (
          <Row key={a.id}
            start={<span className="badge-ic">{a.type === 'business' ? <Briefcase size={19} /> : a.type === 'family' ? <Users size={19} /> : <User size={19} />}</span>}
            title={a.label} sub={a.id === state.account ? 'حساب فعلی' : a.sub}
            end={a.id === state.account ? <span className="pill active" style={{ height: 24, fontSize: 11 }}>فعلی</span> : null}
            chevron={a.type !== 'personal' && a.id !== state.account}
            onClick={() => (a.type === 'business' ? go('business') : a.type === 'family' ? go('family') : go('accounts'))} />
        ))}
      </div>

      <button className="card gold mt16 row" style={{ width: '100%', textAlign: 'right' }} onClick={() => go('myqr')}>
        <span className="badge-ic" style={{ background: 'rgba(251,185,24,.18)' }}><QrCode size={22} className="gold" /></span>
        <span className="grow col gap4">
          <span className="h3">QR من</span>
          <span className="xs muted">دوستانت با اسکن آن به تو میلی می‌فرستند</span>
        </span>
        <ChevronLeft size={18} className="faint" />
      </button>

      <SectionTitle title="تنظیمات" />
      <div className="card" style={{ padding: '4px 18px' }}>
        <div className="list-row">
          <span className="badge-ic"><Coins size={19} /></span>
          <span className="grow h3">واحد نمایش</span>
          <div className="unit-switch">
            <button className={unit === 'milli' ? 'on' : ''} onClick={() => setUnit('milli')}>میلی</button>
            <button className={unit === 'toman' ? 'on' : ''} onClick={() => setUnit('toman')}>تومان</button>
          </div>
        </div>
        <Row start={<span className="badge-ic"><Lock size={19} /></span>} title="امنیت و ورود" chevron onClick={() => go('settings', { kind: 'security' })} />
        <Row start={<span className="badge-ic"><Bell size={19} /></span>} title="اعلان‌ها" chevron onClick={() => go('settings', { kind: 'notif' })} />
        <Row start={<span className="badge-ic"><UserPlus size={19} /></span>} title="دعوت از دوستان" sub="برای هر دعوت ۱۰۰ میلی هدیه" chevron onClick={() => go('settings', { kind: 'invite' })} />
        <Row start={<span className="badge-ic"><HelpCircle size={19} /></span>} title="پشتیبانی" sub="پاسخ‌گویی شبانه‌روزی" chevron onClick={() => go('settings', { kind: 'support' })} />
        <Row start={<span className="badge-ic"><Info size={19} /></span>} title="درباره میلی" sub="هر میلی، یک میلی‌گرم طلای ۱۸ عیار" chevron onClick={() => go('settings', { kind: 'about' })} />
        <Row start={<span className="badge-ic"><LogOut size={19} /></span>} title="خروج از حساب" chevron onClick={() => go('welcome')} />
      </div>
    </>
  );
}
