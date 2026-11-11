import React, { useState } from 'react';
import {
  Plus, Minus, Send, QrCode, Wallet, ChevronLeft, Sparkles, ArrowLeftRight, HandCoins,
  ShoppingBag, Landmark, CalendarClock, Gauge, Receipt, ShieldCheck, Building2, Truck, MapPin,
  Gift, Users, Star, KeyRound, Hash, Snowflake, Settings, GripVertical, Briefcase, Bell, Lock,
  HelpCircle, Info, UserPlus, Store, Coins, Smartphone, User, Gem, Hammer, WalletCards,
} from 'lucide-react';
import {
  useApp, TopBar, ViewToggles, BigAmount, M, Alt, Change, Diamond, AssetIcon, TxIcon, SectionTitle,
  Row, Logo, Avatar, Toggle,
} from './ui.jsx';
import { PRICE, PRICE_CHANGE, contacts, merchants, backingLabels } from './data.js';
import { fa } from './format.js';

/* ───────────── تب میلی (خانه) ───────────── */
export function Home() {
  const { state, go } = useApp();
  return (
    <>
      <TopBar />
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
        <button className="action" onClick={() => go('scan')}><span className="ic"><QrCode size={22} /></span>پرداخت</button>
      </div>

      <button className="card mt16 row" style={{ width: '100%', textAlign: 'right' }} onClick={() => go('wallet')}>
        <span className="badge-ic"><Wallet size={20} /></span>
        <span className="grow col gap4">
          <span className="h3">کیف پول ریالی</span>
          <span className="xs muted">۲۰٪ حقوق ماهانه خودکار میلی می‌شود</span>
        </span>
        <span className="col" style={{ alignItems: 'flex-end' }}>
          <span className="h3 num"><Rial t={state.rial} /></span>
        </span>
        <ChevronLeft size={18} className="faint" />
      </button>

      <SectionTitle title="انتقال" link="درخواست میلی" onLink={() => go('request')} />
      <div className="hscroll">
        <button className="col gap8" style={{ alignItems: 'center', minWidth: 60 }} onClick={() => go('send')}>
          <span className="avatar" style={{ background: 'var(--surface)', color: '#fff' }}><Plus size={22} /></span>
          <span className="xs">جدید</span>
        </button>
        {contacts.map((c) => (
          <button key={c.id} className="col gap8" style={{ alignItems: 'center', minWidth: 60 }} onClick={() => go('send', { to: c.id })}>
            <Avatar c={c} />
            <span className="xs">{c.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <SectionTitle title="تراکنش‌های اخیر" link="همه" onLink={() => go('history')} />
      <div>
        {state.tx.map((t) => (
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
  const milliToman = state.milli * PRICE;
  const total = milliToman + state.assets.reduce((s, a) => s + a.value, 0);
  const parts = [{ name: 'میلی', value: milliToman, color: '#fbb918' }, ...state.assets];
  const shown = state.assets.filter((a) => g === 'همه' || a.group === g);
  return (
    <>
      <div className="between" style={{ padding: '6px 0 16px' }}>
        <span className="h1">دارایی‌ها</span>
        <ViewToggles />
      </div>
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
          <span className="small muted num">{hidden ? '••••' : `${fa(state.milli / 1000, 2)} گرم`}</span>
        </span>
        <span className="col gap4" style={{ alignItems: 'flex-end' }}>
          <span className="h3"><M t={milliToman} /></span>
          <Change v={3.1} />
        </span>
      </button>

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
    ['gallery', 'گالری طلا', Gem], ['goldsmith', 'طلاساز', Hammer], ['bills', 'قبض و شارژ', Receipt], ['insurance', 'بیمه', ShieldCheck],
    ['realestate', 'املاک', Building2], ['delivery', 'تحویل فیزیکی', Truck], ['giftcard', 'کارت هدیه', Gift],
    ['family', 'خانواده', Users], ['rewards', 'باشگاه پاداش', Star],
  ];
  return (
    <>
      <div className="between" style={{ padding: '6px 0 16px' }}>
        <span className="h1">خدمات</span>
        <ViewToggles />
      </div>
      <div className="grid4" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {tiles.map(([id, label, Ic]) => (
          <button key={id} className="tile" onClick={() => go(id)}>
            <span className="ic"><Ic size={23} strokeWidth={1.7} /></span>{label}
          </button>
        ))}
      </div>

      <SectionTitle title="قلک‌ها" link="قلک تازه" onLink={() => go('jar')} />
      <div className="hscroll">
        {state.jars.map((j) => (
          <div className="jar" key={j.id}>
            <div style={{ fontSize: 24 }}>{j.icon}</div>
            <div className="h3 mt8">{j.name}</div>
            <div className="small mt8"><M m={j.saved} /></div>
            <div className="bar mt8"><i style={{ width: `${Math.max(4, (j.saved / j.goal) * 100)}%` }} /></div>
            <div className="xs muted mt8">{j.auto}</div>
          </div>
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
  return (
    <>
      <div className="between" style={{ padding: '6px 0 16px' }}>
        <span className="h1">کارت و اعتبار</span>
        <ViewToggles />
      </div>
      <div className="bank-card">
        <div className="between">
          <Logo size={36} />
          <span className="pill active" style={{ height: 28, fontSize: 12 }}>اعتباری</span>
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

      <div className="card soft mt12 row">
        <span className="badge-ic" style={{ background: '#000' }}><CalendarClock size={20} /></span>
        <span className="grow col gap4">
          <span className="h3">قسط بعدی · ۲۵ آذر</span>
          <span className="small muted"><M t={4200000} /></span>
        </span>
        <button className="btn primary small" onClick={() => go('payInstallment')}>پرداخت</button>
      </div>

      <div className="grid4 mt16" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[['credit', 'خرید اعتباری', ShoppingBag], ['loan', 'وام', Landmark], ['installments', 'اقساط', CalendarClock], ['score', 'امتیاز اعتباری', Gauge]].map(([id, l, Ic]) => (
          <button key={id} className="tile" onClick={() => go(id)}><span className="ic"><Ic size={21} strokeWidth={1.7} /></span>{l}</button>
        ))}
      </div>

      <div className="grid4 mt24" style={{ gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
        {[['رمز دوم', KeyRound, 'cardAction'], ['شماره کارت', Hash, 'cardAction'], ['مسدود موقت', Snowflake, 'cardAction'], ['پشتوانه', WalletCards, 'backing'], ['تنظیمات', Settings, 'cardAction']].map(([l, Ic, to]) => (
          <button key={l} className="tile" style={{ padding: '12px 2px', fontSize: 11 }} onClick={() => go(to)}><span className="ic"><Ic size={21} strokeWidth={1.7} /></span>{l}</button>
        ))}
      </div>

      <SectionTitle title="خریدهای اخیر" />
      <Row start={<span className="badge-ic"><ShoppingBag size={19} /></span>} title="دیجی‌کالا" sub="امروز · از میلی" end={<span>−<M m={312} /></span>} endSub={<span className="gold xs">+۳ میلی پاداش</span>} />
      <Row start={<span className="badge-ic"><Store size={19} /></span>} title="افق کوروش" sub="دیروز · از میلی" end={<span>−<M m={88} /></span>} endSub={<span className="gold xs">+۱ میلی پاداش</span>} />
      <Row start={<span className="badge-ic"><Smartphone size={19} /></span>} title="اسنپ" sub="۱۸ آبان · از تتر" end={<span>−<M m={41} /></span>} />
    </>
  );
}

/* ───────────── تب پروفایل ───────────── */
export function Profile() {
  const { go, unit, setUnit } = useApp();
  return (
    <>
      <div className="col" style={{ alignItems: 'center', padding: '14px 0 6px' }}>
        <span className="avatar" style={{ width: 84, height: 84, fontSize: 30, background: 'var(--gold)' }}>ع</span>
        <span className="h2 mt12">علی رضایی</span>
        <span className="small muted mt8 num">۰۹۱۲ ۳۴۵ ۶۷۸۹ · احراز کامل</span>
      </div>

      <SectionTitle title="حساب‌ها" link="حساب تازه" onLink={() => go('newAccount')} />
      <div className="card" style={{ padding: '4px 18px' }}>
        <Row start={<span className="badge-ic"><User size={19} /></span>} title="حساب شخصی" sub="فعال" end={<span className="pill active" style={{ height: 24, fontSize: 11 }}>فعلی</span>} />
        <Row start={<span className="badge-ic"><Briefcase size={19} /></span>} title="کافه نارنج" sub="حساب بیزینس · امروز ۳۲ پرداخت" chevron onClick={() => go('business')} />
        <Row start={<span className="badge-ic"><Users size={19} /></span>} title="خانواده رضایی" sub="حساب خانواده · ۳ عضو" chevron onClick={() => go('family')} />
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
        <Row start={<span className="badge-ic"><Lock size={19} /></span>} title="امنیت و ورود" chevron />
        <Row start={<span className="badge-ic"><Bell size={19} /></span>} title="اعلان‌ها" chevron />
        <Row start={<span className="badge-ic"><UserPlus size={19} /></span>} title="دعوت از دوستان" sub="برای هر دعوت ۱۰۰ میلی هدیه" chevron />
        <Row start={<span className="badge-ic"><HelpCircle size={19} /></span>} title="پشتیبانی" sub="پاسخ‌گویی شبانه‌روزی" chevron />
        <Row start={<span className="badge-ic"><Info size={19} /></span>} title="درباره میلی" sub="هر میلی، یک میلی‌گرم طلای ۱۸ عیار" chevron />
      </div>
    </>
  );
}
