import React, { useState } from 'react';
import {
  Plus, Minus, Send, QrCode, Wallet, ChevronLeft, Sparkles, ArrowLeftRight, HandCoins,
  ShoppingBag, Landmark, CalendarClock, Gauge, Receipt, ShieldCheck, Building2, Truck, MapPin,
  Gift, Users, Star, KeyRound, PiggyBank, X, TrendingUp, Hash, Snowflake, Settings, GripVertical, Briefcase, Bell, Lock,
  HelpCircle, Info, UserPlus, Store, Coins, Smartphone, User, Gem, Hammer, WalletCards, LogOut, ChevronDown, Moon,
} from 'lucide-react';
import {
  useApp, TopBar, ViewToggles, BigAmount, M, T, Alt, Change, Diamond, AssetIcon, TxIcon, SectionTitle,
  Row, Logo, Avatar, Toggle, TabHead, AskBar, NavBar, assetSub, ownAssets,
} from './ui.jsx';
import { PnlLink } from './pnl.jsx';
import { PRICE, PRICE_CHANGE, contacts, merchants, backingLabels } from './data.js';
import { fa } from './format.js';
import { MONTHS } from './store.jsx';

/* ───────────── تب میلی (خانه) ───────────── */
export function Home() {
  const { state, go } = useApp();
  const [tip, setTip] = useState(true);
  const [txOpen, setTxOpen] = useState(false);
  const next = state.installments?.[0];
  const creditLeft = state.credit.limit - state.credit.used;
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
            <span className="xs muted">با یک لمس از میلی بپرداز · <T t={next.monthly} /></span>
          </button>
          <button onClick={() => setTip(false)} aria-label="بستن" className="faint"><X size={17} /></button>
        </div>
      )}

      <button className="card mt16 row" style={{ width: '100%', textAlign: 'right' }} onClick={() => go('wallet')}>
        <span className="badge-ic"><Wallet size={20} /></span>
        <span className="grow h3">کیف پول ریالی</span>
        <span className="h3 num"><T t={state.rial} /></span>
        <ChevronLeft size={18} className="faint" />
      </button>

      {/* اعتبار با عدد خود کاربر، به‌جای بنر تبلیغی وام و خرید قسطی */}
      <button className="card mt12 row" style={{ width: '100%', textAlign: 'right' }} onClick={() => go('tab:card')}>
        <span className="badge-ic"><HandCoins size={20} /></span>
        <span className="grow col gap4">
          <span className="h3">اعتبار در دسترس</span>
          <span className="xs muted"><T t={creditLeft} /> · وام یا خرید قسطی</span>
        </span>
        <ChevronLeft size={18} className="faint" />
      </button>
      <button className="card gold mt12 row" style={{ width: '100%', textAlign: 'right' }} onClick={() => go('goldyield')}>
        <TrendingUp size={22} className="gold" />
        <span className="grow col gap4">
          <span className="h3">سود طلایی</span>
          <span className="xs muted">ماهانه ۱٪ سود، به میلی</span>
        </span>
        <ChevronLeft size={18} className="faint" />
      </button>

      <div className="card tx-box mt12">
        <button className="between" style={{ width: '100%' }} onClick={() => setTxOpen(!txOpen)} aria-expanded={txOpen}>
          <span className="row gap8"><span className="badge-ic sm"><Receipt size={17} /></span><span className="h3">تراکنش‌های اخیر</span></span>
          <ChevronDown size={19} className="muted" style={{ transform: txOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </button>
        {txOpen && (
          <div className="tx-body">
            {state.tx.slice(0, 5).map((t) => (
              <Row key={t.id} start={<TxIcon kind={t.icon} />} title={t.title} sub={t.sub}
                end={<span className={t.milli > 0 ? 'up' : ''}>{t.milli > 0 ? '+' : '−'}<M m={Math.abs(t.milli)} /></span>} />
            ))}
            <button className="link tx-all" onClick={() => go('history')}>همه تراکنش‌ها</button>
          </div>
        )}
      </div>
    </>
  );
}

function Sparkline() {
  return (
    <svg width="44" height="18" viewBox="0 0 44 18">
      <polyline points="0,14 7,12 13,13 19,9 26,10 32,6 38,7 44,3" fill="none" stroke="#2bd36b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ───────────── تب دارایی‌ها ─────────────
   صفحه با دارایی کاربر بزرگ می‌شود: فقط میلی ← چند دارایی (تا سه) ← سبد پر (نوار ترکیب و فیلتر گروه) */
const GROUPS = ['فلزات', 'رمزارز', 'سهام', 'صندوق'];
const GROUP_LABEL = { صندوق: ['صندوق‌ها', '#2a49e8'], رمزارز: ['رمزارز', '#f7931a'], سهام: ['سهام', '#3b82f6'], فلزات: ['سکه و فلزات', '#c9ced6'] };

export function Assets() {
  const { state, go, hidden } = useApp();
  const [g, setG] = useState('همه');
  const locked = (state.locks || []).reduce((s, l) => s + l.milli, 0);
  const milliAll = state.milli + locked;
  const milliToman = milliAll * PRICE;
  const jarsToman = state.jars.reduce((s, j) => s + j.saved, 0) * PRICE; // قلک‌ها هم جزو مجموع دارایی است
  const own = ownAssets(state);
  const otherToman = own.reduce((s, a) => s + a.value, 0);
  const total = milliToman + jarsToman + otherToman;
  const mode = own.length === 0 ? 'gold' : own.length <= 3 ? 'few' : 'full';
  const groups = GROUPS.filter((x) => own.some((a) => a.group === x));
  const gsum = (gr) => own.filter((a) => a.group === gr).reduce((s, a) => s + a.value, 0);
  const shown = own.filter((a) => mode !== 'full' || g === 'همه' || a.group === g);
  const share = (v) => fa(Math.round((v / total) * 100));
  const legend = mode === 'full'
    ? [['میلی', '#fbb918', milliToman], ['قلک‌ها', '#e0a100', jarsToman], ...groups.map((x) => [GROUP_LABEL[x][0], GROUP_LABEL[x][1], gsum(x)])]
    : [['میلی و قلک‌ها', '#fbb918', milliToman + jarsToman], ['سایر دارایی‌ها', '#8c8cf0', otherToman]];
  const bar = mode === 'full'
    ? [['میلی', milliToman, '#fbb918'], ['قلک‌ها', jarsToman, '#e0a100'], ...own.map((a) => [a.id, a.value, a.color])]
    : legend.map(([n, c, v]) => [n, v, c]);
  return (
    <>
      <TabHead title="دارایی‌ها" />
      <div className="card">
        <span className="small muted">مجموع دارایی</span>
        <div className="mt8"><BigAmount toman={total} /></div>
        <div className="mt8"><span className="small muted"><Alt t={total} /></span></div>
        {mode !== 'gold' && (
          <>
            <div className="stack-bar mt16">
              {bar.map(([n, v, c]) => <i key={n} style={{ flex: v, background: c }} />)}
            </div>
            <div className="row mt12" style={{ flexWrap: 'wrap', gap: '6px 14px' }}>
              {legend.map(([n, c, v]) => (
                <span key={n} className="row xs" style={{ gap: 6 }}><Diamond color={c} size={8} />{n} {share(v)}٪</span>
              ))}
            </div>
          </>
        )}
        <div className="divider" />
        <PnlLink />
      </div>

      {mode !== 'gold' && (
        <div className="row mt16" style={{ gap: 10 }}>
          <button className="btn primary" style={{ height: 48 }} onClick={() => go('buyAsset')}><Plus size={19} />خرید</button>
          <button className="btn ghost" style={{ height: 48 }} onClick={() => go('convert', { from: 'milli' })}><ArrowLeftRight size={19} />تبدیل</button>
        </div>
      )}

      <SectionTitle title="میلی" />
      <button className="card soft row" style={{ width: '100%', textAlign: 'right' }} onClick={() => go('tab:home')}>
        <span className="badge-ic" style={{ background: 'var(--bg)' }}><Diamond /></span>
        <span className="grow col gap4">
          <span className="h3">میلی</span>
          <span className="small muted">طلای ۱۸ عیار</span>
        </span>
        <span className="col gap4" style={{ alignItems: 'flex-end' }}>
          <span className="h3 num">{hidden ? '••••••' : `${fa(milliAll)} میلی`}</span>
          <span className="small muted num">{hidden ? '' : `≈ ${fa(Math.round(milliToman))} تومان`}</span>
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
      {mode === 'gold' ? (
        <button className="card row" style={{ width: '100%', textAlign: 'right' }} onClick={() => go('buyAsset')}>
          <span className="badge-ic"><Coins size={20} /></span>
          <span className="grow col gap4">
            <span className="h3">سکه، دلار، بیت‌کوین و بیشتر</span>
            <span className="xs muted">هر وقت خواستی، با تومان یا میلی بخر</span>
          </span>
          <ChevronLeft size={18} className="faint" />
        </button>
      ) : (
        <>
          {mode === 'full' && (
            <div className="hscroll" style={{ gap: 8 }}>
              {['همه', ...groups].map((x) => <button key={x} className={`pill ${g === x ? 'active' : ''}`} onClick={() => setG(x)}>{x}</button>)}
            </div>
          )}
          <div className={mode === 'full' ? 'mt8' : ''}>
            {shown.map((a) => (
              <Row key={a.id} start={<AssetIcon color={a.color} />} title={a.name} sub={<bdi>{assetSub(a)}</bdi>}
                end={<M t={a.value} />} endSub={<Change v={a.change} />} onClick={() => go('asset', { id: a.id })} />
            ))}
          </div>
        </>
      )}
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
          <div className="xs muted mt8">از ۱۵۰ میلی، صاحب سهمی از ملک شو</div>
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

/* ───────────── تب کارت و اعتبار ─────────────
   صفحه اول فقط کارت، اعتبار در دسترس، دو کار اصلی و قسط بعدی؛ بقیه یک لایه عقب‌تر است */
export function Card() {
  const { state, go, hidden } = useApp();
  const left = state.credit.limit - state.credit.used;
  const next = state.installments[0];
  return (
    <>
      <TabHead title="کارت و اعتبار" />
      <button className="bank-card" style={{ width: '100%', display: 'block', textAlign: 'right' }} onClick={() => go('cardManage')} aria-label="مدیریت کارت">
        <div className="between">
          <Logo size={36} />
          <span className="pill active" style={{ height: 28, fontSize: 12 }}>{state.frozen ? 'مسدود موقت' : 'اعتباری'}</span>
        </div>
        <div className="num" style={{ direction: 'ltr', fontSize: 22, letterSpacing: 2, marginTop: 52, textAlign: 'left' }}>5022 •••• •••• 9203</div>
        <div className="between mt12">
          <span style={{ fontWeight: 600 }}>علی رضایی</span>
          <span className="small" style={{ direction: 'ltr', color: '#ddd' }}>08/29</span>
        </div>
      </button>

      <div className="card mt16">
        <span className="small muted">اعتبار در دسترس</span>
        <div className="big-num num mt8" style={{ fontSize: 34 }}>{hidden ? '••••••' : fa(left)}<small>تومان</small></div>
        <div className="bar mt12" style={{ height: 8 }}><i style={{ width: `${(left / state.credit.limit) * 100}%` }} /></div>
        <div className="xs muted mt8">به پشتوانه دارایی‌هایت · سقف <T t={state.credit.limit} /></div>
        <div className="row mt16" style={{ gap: 10 }}>
          <button className="btn primary" style={{ height: 48 }} onClick={() => go('credit')}><ShoppingBag size={19} />خرید قسطی</button>
          <button className="btn ghost" style={{ height: 48 }} onClick={() => go('loan')}><Landmark size={19} />وام</button>
        </div>
      </div>

      {next ? (
        <div className="card soft mt12 row">
          <span className="badge-ic" style={{ background: 'var(--bg)' }}><CalendarClock size={20} /></span>
          <span className="grow col gap4">
            <span className="h3">قسط بعدی · ۲۵ {MONTHS[next.k % 12]}</span>
            <span className="small muted"><T t={next.monthly} /></span>
          </span>
          <button className="btn primary small" onClick={() => go('payInstallment', { id: next.id })}>پرداخت</button>
        </div>
      ) : (
        <div className="card soft mt12 row"><CalendarClock size={20} className="gold" /><span className="grow small">قسط باز نداری</span></div>
      )}

      <div className="card mt12" style={{ padding: '4px 18px' }}>
        <Row start={<span className="badge-ic"><Settings size={19} /></span>} title="مدیریت کارت" sub="رمز، مسدودسازی، پشتوانه پرداخت" chevron onClick={() => go('cardManage')} />
        <Row start={<span className="badge-ic"><Gauge size={19} /></span>} title="اعتبار من" sub="اقساط، افزایش سقف، امتیاز" chevron onClick={() => go('creditMore')} />
        <Row start={<span className="badge-ic"><Gift size={19} /></span>} title="پاداش و خرده‌پول" end={<span className="gold small"><M m={state.rewardsMonth + state.roundup.saved} /></span>} chevron onClick={() => go('cardPerks')} />
      </div>
    </>
  );
}

/* ───────────── تب پروفایل ───────────── */
export function Profile() {
  const { go, unit, setUnit, state, theme, setTheme } = useApp();
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

      <button className="card gold mt16 row" style={{ width: '100%', textAlign: 'right' }} onClick={() => go('payhub', { mode: 'qr' })}>
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
        <div className="list-row">
          <span className="badge-ic"><Moon size={19} /></span>
          <span className="grow h3">ظاهر</span>
          <div className="unit-switch">
            <button className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')}>تیره</button>
            <button className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')}>روشن</button>
          </div>
        </div>
        <Row start={<span className="badge-ic"><Lock size={19} /></span>} title="امنیت و ورود" chevron onClick={() => go('settings', { kind: 'security' })} />
        <Row start={<span className="badge-ic"><Bell size={19} /></span>} title="اعلان‌ها" chevron onClick={() => go('settings', { kind: 'notif' })} />
        <Row start={<span className="badge-ic"><UserPlus size={19} /></span>} title="دعوت از دوستان" sub="برای هر دعوت ۳۰ میلی هدیه" chevron onClick={() => go('settings', { kind: 'invite' })} />
        <Row start={<span className="badge-ic"><HelpCircle size={19} /></span>} title="پشتیبانی" sub="پاسخ‌گویی شبانه‌روزی" chevron onClick={() => go('settings', { kind: 'support' })} />
        <Row start={<span className="badge-ic"><Info size={19} /></span>} title="درباره میلی" sub="هر میلی، یک میلی‌گرم طلای ۱۸ عیار" chevron onClick={() => go('settings', { kind: 'about' })} />
        <Row start={<span className="badge-ic"><LogOut size={19} /></span>} title="خروج از حساب" chevron onClick={() => go('welcome')} />
      </div>
    </>
  );
}
