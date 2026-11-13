import React, { createContext, useContext } from 'react';
import {
  Bell, ScanLine, Eye, EyeOff, ChevronDown, ChevronRight, ChevronLeft, PieChart,
  LayoutGrid, CreditCard, User, QrCode, Sparkles, ArrowDownLeft, Gift, Receipt, Plus, Delete, ArrowUpRight, Minus, ShoppingBag,
} from 'lucide-react';
import { fa, money, milliIn, pct, HIDDEN } from './format.js';
import { initialState } from './data.js';

export const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

// زمینه پیش‌فرض برای حالت نمایش (صفحه طرح‌ها)
export function staticCtx(over = {}) {
  return {
    state: {
      ...initialState, account: 'personal', frozen: false,
      accounts: [
        { id: 'personal', label: 'حساب شخصی', sub: 'فعال', type: 'personal' },
        { id: 'business', label: 'کافه نارنج', sub: 'حساب بیزینس', type: 'business' },
        { id: 'family', label: 'خانواده رضایی', sub: 'حساب خانواده', type: 'family' },
      ],
      installments: [{ id: 'i1', title: 'خرید اعتباری', monthly: 4200000, left: 7, k: 0, total: 12 }],
    },
    unit: 'milli', hidden: false, tab: 'home',
    setUnit() {}, toggleHidden() {}, go() {}, back() {}, setTab() {}, act() {}, toast() {}, patch() {},
    ...over,
  };
}

export function Logo({ size = 42 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 42 42" aria-label="میلی">
      <rect width="42" height="42" rx="13" fill="#fff" />
      <rect x="13" y="13" width="16" height="16" rx="3" fill="#000" transform="rotate(45 21 21)" />
      <circle cx="31.5" cy="9.5" r="4.5" fill="#fbb918" />
    </svg>
  );
}

export function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="dots">
        <svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="#fff"/><rect x="5" y="5" width="3" height="6" rx="1" fill="#fff"/><rect x="10" y="2.5" width="3" height="8.5" rx="1" fill="#fff"/><rect x="15" y="0" width="3" height="11" rx="1" fill="#fff"/></svg>
        <span className="bat"><i /></span>
      </span>
    </div>
  );
}

export function TabBar() {
  const { tab, setTab, go } = useApp();
  const tabs = [
    { id: 'home', label: 'میلی', icon: <MilliTabIcon /> },
    { id: 'assets', label: 'دارایی‌ها', icon: <PieChart size={23} strokeWidth={1.7} /> },
    { id: 'pay', label: 'پرداخت' },
    { id: 'card', label: 'کارت و اعتبار', icon: <CreditCard size={23} strokeWidth={1.7} /> },
    { id: 'services', label: 'خدمات', icon: <LayoutGrid size={23} strokeWidth={1.7} /> },
  ];
  return (
    <nav className="tabbar">
      {tabs.map((t) => (t.id === 'pay' ? (
        <button key="pay" className="tab pay" onClick={() => go('payhub')} aria-label="پرداخت و انتقال">
          <span className="fab"><QrCode size={25} strokeWidth={2} /></span>
          <span>{t.label}</span>
        </button>
      ) : (
        <button key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
          {t.icon}
          <span>{t.label}</span>
          <span className="dot" />
        </button>
      )))}
    </nav>
  );
}

function MilliTabIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="6" y="6" width="12" height="12" rx="2.5" transform="rotate(45 12 12)" />
    </svg>
  );
}

export function TopBar() {
  const { go, state } = useApp();
  const acct = state.accounts?.find((a) => a.id === state.account);
  return (
    <div className="topbar">
      <button className="avatar me" onClick={() => go('profile')} aria-label="پروفایل">ع</button>
      <div className="grow col">
        <span className="h3">علی رضایی</span>
        <span><button className="acct-chip" onClick={() => go('accounts')}>{acct ? acct.label : 'حساب شخصی'} <ChevronDown size={13} /></button></span>
      </div>
      <button className="icon-btn" onClick={() => go('notifications')} aria-label="اعلان‌ها"><Bell size={20} /></button>
    </div>
  );
}

// سربرگ تب‌ها: آواتار (پروفایل)، عنوان، کلیدهای نمایش
export function TabHead({ title }) {
  const { go } = useApp();
  return (
    <div className="between" style={{ padding: '6px 0 16px' }}>
      <span className="row" style={{ gap: 10 }}>
        <button className="avatar me sm" onClick={() => go('profile')} aria-label="پروفایل">ع</button>
        <span className="h1">{title}</span>
      </span>
      <ViewToggles />
    </div>
  );
}

// نوار دستیار میلی
export function AskBar() {
  const { go } = useApp();
  return (
    <button className="ask-bar" style={{ width: '100%', marginBottom: 14 }} onClick={() => go('assistant')}>
      <Sparkles size={18} className="gold" />
      <span className="grow muted" style={{ textAlign: 'right' }}>بپرس یا بگو چه کنم…</span>
    </button>
  );
}

export function NavBar({ title, end }) {
  const { back } = useApp();
  return (
    <div className="navbar">
      <button className="icon-btn" onClick={back} aria-label="بازگشت"><ChevronRight size={22} /></button>
      <span className="title">{title}</span>
      <span style={{ width: 42, display: 'grid', placeItems: 'center' }}>{end}</span>
    </div>
  );
}

// کلیدهای چشم و واحد
export function ViewToggles() {
  const { unit, setUnit, hidden, toggleHidden } = useApp();
  return (
    <div className="row gap8">
      <div className="unit-switch">
        <button className={unit === 'milli' ? 'on' : ''} onClick={() => setUnit('milli')}>میلی</button>
        <button className={unit === 'toman' ? 'on' : ''} onClick={() => setUnit('toman')}>تومان</button>
      </div>
      <button className="eye" onClick={toggleHidden} aria-label="نمایش یا پنهان کردن عددها">
        {hidden ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

// عدد بزرگ: مقدار و واحد جدا
export function BigAmount({ milli, toman }) {
  const { unit, hidden } = useApp();
  if (hidden) return <div className="big-num">{HIDDEN}</div>;
  const isMilli = unit === 'milli';
  const m = milli ?? toman / 7480;
  const t = toman ?? milli * 7480;
  return (
    <div className="big-num num">
      {isMilli ? fa(Math.round(m)) : fa(Math.round(t))}
      <small>{isMilli ? 'میلی' : 'تومان'}</small>
    </div>
  );
}

// مبلغ (ورودی تومان) طبق واحد فعلی
export function M({ t, m, d }) {
  const { unit, hidden } = useApp();
  if (m != null) return <span className="num">{milliIn(m, unit, hidden, d)}</span>;
  return <span className="num">{money(t, unit, hidden)}</span>;
}

// مبلغ ثانویه به واحد مقابل
export function Alt({ t, m }) {
  const { unit, hidden } = useApp();
  if (hidden) return <span>{HIDDEN}</span>;
  const other = unit === 'milli' ? 'toman' : 'milli';
  if (m != null) return <span className="num">≈ {milliIn(m, other, false)}</span>;
  return <span className="num">≈ {money(t, other, false)}</span>;
}

export function Change({ v, suffix }) {
  return <span className={`num ${v >= 0 ? 'up' : 'down'}`}>{v >= 0 ? '↑' : '↓'} {pct(Math.abs(v))}{suffix ? ` ${suffix}` : ''}</span>;
}

export function Diamond({ color = '#fbb918', size = 16 }) {
  return <span className="diamond" style={{ background: color, width: size, height: size }} />;
}

export function AssetIcon({ color }) {
  return <span className="badge-ic"><Diamond color={color} /></span>;
}

export function TxIcon({ kind }) {
  const map = {
    qr: <QrCode size={19} />, in: <ArrowDownLeft size={19} className="up" />, gift: <Gift size={19} className="gold" />,
    bill: <Receipt size={19} />, buy: <Plus size={19} className="gold" />, out: <ArrowUpRight size={19} />, sell: <Minus size={19} />, shop: <ShoppingBag size={19} />,
  };
  return <span className="badge-ic">{map[kind] || <Diamond />}</span>;
}

export function SectionTitle({ title, link, onLink }) {
  return (
    <div className="section-title">
      <span className="h2">{title}</span>
      {link && <button className="link" onClick={onLink}>{link}</button>}
    </div>
  );
}

export function Row({ start, title, sub, end, endSub, onClick, chevron }) {
  return (
    <div className="list-row" onClick={onClick} style={onClick ? { cursor: 'pointer' } : null}>
      {start}
      <div className="grow col gap4">
        <span className="h3">{title}</span>
        {sub && <span className="small muted">{sub}</span>}
      </div>
      {(end || endSub) && (
        <div className="end col gap4" style={{ alignItems: 'flex-end' }}>
          {end && <span className="h3">{end}</span>}
          {endSub && <span className="small">{endSub}</span>}
        </div>
      )}
      {chevron && <ChevronLeft size={18} className="faint" />}
    </div>
  );
}

export function Toggle({ on, onClick }) {
  return <button className={`toggle ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on} />;
}

export function Keypad({ onKey }) {
  const keys = ['۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '٫', '۰', 'del'];
  return (
    <div className="keypad">
      {keys.map((k) => (
        <button key={k} onClick={() => onKey && onKey(k)} aria-label={k === 'del' ? 'پاک کردن' : k}>
          {k === 'del' ? <Delete size={24} style={{ margin: '0 auto' }} /> : k}
        </button>
      ))}
    </div>
  );
}

export function Avatar({ c, size = 52 }) {
  return <span className="avatar" style={{ background: c.color, width: size, height: size, fontSize: size * 0.37 }}>{c.initial}</span>;
}
