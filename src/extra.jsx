import React, { useState } from 'react';
import {
  Send as SendIcon, Users, ChevronDown, Sparkles, ArrowUp, Check, Wallet, CalendarClock, PiggyBank, Coins, Snowflake,
  PieChart,
} from 'lucide-react';
import {
  useApp, NavBar, Keypad, Avatar, Diamond, AssetIcon, Toggle, M,
} from './ui.jsx';
import { PRICE, contacts, backingLabels } from './data.js';
import { fa } from './format.js';

/* ───────────── منبع پرداخت (قابل تعویض در لحظه خرید) ───────────── */
export function sourceBalance(state, id) {
  if (id === 'milli') return state.milli * PRICE;
  if (id === 'rial') return state.rial;
  return state.assets.find((a) => a.id === id)?.value ?? 0;
}

export function SourceRow({ value, onChange }) {
  const { state, hidden } = useApp();
  const [open, setOpen] = useState(false);
  const cur = backingLabels[value];
  const bal = (id) => (hidden ? '••••' : id === 'milli' ? `${fa(state.milli)} میلی` : `${fa(Math.round(sourceBalance(state, id)))} تومان`);
  return (
    <>
      <button className="between small" style={{ width: '100%' }} onClick={() => setOpen(!open)}>
        <span className="muted">پرداخت از</span>
        <span className="row gap8"><Diamond size={9} color={cur.color} />{cur.name} · <span className="num">{bal(value)}</span><ChevronDown size={15} className="gold" /></span>
      </button>
      {open && (
        <div className="source-list">
          {state.backing.map((id) => (
            <button key={id} className={`source-opt ${id === value ? 'on' : ''}`} onClick={() => { onChange(id); setOpen(false); }}>
              <Diamond size={9} color={backingLabels[id].color} />
              <span className="grow" style={{ textAlign: 'right' }}>{backingLabels[id].name}</span>
              <span className="muted num">{bal(id)}</span>
              {id === value && <Check size={15} className="gold" />}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ───────────── دنگ ───────────── */
export function Split({ title: title0, total: total0 }) {
  const { act, unit, state } = useApp();
  const open = state.splits || [];
  const [raw, setRaw] = useState(total0 ? String(Math.round(unit === 'milli' ? total0 : total0 * PRICE)) : '1200');
  const [title, setTitle] = useState(title0 || 'شام پنجشنبه');
  const [sel, setSel] = useState(['sara', 'reza', 'maryam']);
  const onKey = (k) => {
    if (k === 'del') return setRaw((s) => s.slice(0, -1));
    if (k === '٫') return;
    const d = '۰۱۲۳۴۵۶۷۸۹'.indexOf(k);
    setRaw((s) => (s.length >= 9 ? s : (s === '0' ? '' : s) + d));
  };
  const total = unit === 'milli' ? Number(raw || 0) : Number(raw || 0) / PRICE;
  const share = sel.length ? total / (sel.length + 1) : 0;
  const tg = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <div className="split-pg">
      <NavBar title="دنگ" />
      {open.length > 0 && (
        <div className="split-open">
          <span className="badge-ic"><Users size={17} className="gold" /></span>
          <span className="grow col gap4">
            <span className="h3">دنگ باز · {open[0].title}</span>
            <span className="xs muted">
              {fa(open[0].paid)} از {fa(open[0].people)} نفر پرداخت کرده‌اند{open.length > 1 ? ` · و ${fa(open.length - 1)} دنگ دیگر` : ''}
            </span>
          </span>
          <span className="h3"><M m={open[0].total} /></span>
        </div>
      )}
      <div className="field"><label>بابت</label><input className="v" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%' }} /></div>
      <div className="amount-entry">
        <div className="val num">{fa(Number(raw || 0))}<small>{unit === 'milli' ? 'میلی' : 'تومان'}</small></div>
        <div className="small muted mt8">مبلغ کل · تو پرداخت کرده‌ای</div>
      </div>
      <div className="hscroll" style={{ gap: 14 }}>
        {contacts.map((x) => {
          const on = sel.includes(x.id);
          return (
            <button key={x.id} className="col gap8" style={{ alignItems: 'center', minWidth: 56, opacity: on ? 1 : 0.4 }} onClick={() => tg(x.id)}>
              <span style={{ borderRadius: '50%', boxShadow: on ? '0 0 0 2px var(--bg), 0 0 0 4px var(--gold)' : 'none' }}><Avatar c={x} size={48} /></span>
              <span className="xs">{x.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
      <div className="card soft mt16 between" style={{ padding: 14 }}>
        <span className="col gap4"><span className="h3">سهم هر نفر</span><span className="xs muted">تقسیم مساوی بین {fa(sel.length + 1)} نفر (با خودت)</span></span>
        <span className="h2 gold num">{fa(share, 1)} میلی</span>
      </div>
      <Keypad onKey={onKey} />
      <button className="btn primary mt12" disabled={!total || !sel.length || !title.trim()}
        onClick={() => act('split', { title: title.trim(), total: Math.round(total), people: sel.length })}>
        ارسال درخواست به {fa(sel.length)} نفر
      </button>
    </div>
  );
}

/* ───────────── دستیار میلی ───────────── */
const INTENTS = [
  {
    q: 'این ماه چقدر خرج کردم؟', keys: ['خرج', 'هزینه'],
    a: 'این ماه ۱٬۴۶۰ میلی خرج کرده‌ای؛ ۱۲٪ کمتر از ماه قبل. بیشترین سهم با «خوراک و کافه» بوده است.',
    cta: ['دیدن تحلیل خرج', (go) => go('history')], icon: PieChart,
  },
  {
    q: '۱۵۰ میلی برای سارا بفرست', keys: ['بفرست', 'ارسال', 'سارا'],
    a: 'آماده است: ۱۵۰ میلی برای سارا احمدی. برای انجام، خودت تأیید کن.',
    cta: ['بررسی و تأیید ارسال', (go) => go('send', { to: 'sara', preset: '150' })], icon: SendIcon,
  },
  {
    q: 'قسط بعدی‌ام کی است؟', keys: ['قسط'],
    a: 'قسط بعدی ۲۵ آذر است: ۴٬۲۰۰٬۰۰۰ تومان بابت خرید اعتباری. می‌توانی همین حالا با میلی بپردازی.',
    cta: ['پرداخت قسط', (go, st) => go('payInstallment', { id: st.installments[0]?.id })], icon: CalendarClock,
  },
  {
    q: 'کارتم را موقت مسدود کن', keys: ['مسدود', 'کارت'],
    a: 'کارت میلی را موقت مسدود می‌کنم. هر وقت خواستی با یک لمس باز می‌شود.',
    cta: ['تأیید مسدودسازی', (go) => go('cardAction', { kind: 'freeze' })], icon: Snowflake,
  },
];

export function Assistant() {
  const { go, state } = useApp();
  const [msgs, setMsgs] = useState([{ me: false, text: 'سلام علی. بپرس یا بگو چه کاری انجام دهم؛ هر کاری را قبل از انجام خودت تأیید می‌کنی.' }]);
  const [text, setText] = useState('');
  const ask = (q) => {
    if (!q.trim()) return;
    const it = INTENTS.find((i) => i.q === q) || INTENTS.find((i) => i.keys.some((k) => q.includes(k)));
    setMsgs((m) => [...m, { me: true, text: q }, it ? { me: false, text: it.a, it } : { me: false, text: 'در خرج‌ها، انتقال، کارت، اقساط و قلک‌ها کنارت هستم. یکی از پیشنهادهای پایین را امتحان کن.' }]);
    setText('');
  };
  return (
    <div className="col" style={{ minHeight: '100%' }}>
      <NavBar title="دستیار میلی" end={<Sparkles size={20} className="gold" />} />
      <div className="col grow" style={{ gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.me ? 'me' : ''}`}>
            {m.text}
            {m.it && (
              <button className="btn primary small mt12" style={{ width: '100%' }} onClick={() => m.it.cta[1](go, state)}>
                <m.it.icon size={16} />{m.it.cta[0]}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="hscroll mt16" style={{ gap: 8 }}>
        {INTENTS.map((i) => <button key={i.q} className="pill" onClick={() => ask(i.q)}>{i.q}</button>)}
      </div>
      <form className="ask-bar mt12" onSubmit={(e) => { e.preventDefault(); ask(text); }}>
        <input className="grow" placeholder="بپرس یا بگو چه کنم…" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="icon-btn" style={{ background: 'var(--gold)', color: 'var(--gold-ink)', width: 38, height: 38 }} aria-label="ارسال"><ArrowUp size={19} /></button>
      </form>
    </div>
  );
}

/* ───────────── تقسیم حقوق ───────────── */
export function SalarySplit() {
  const { state, patch, toast, back } = useApp();
  const SALARY = 32000000;
  const [v, setV] = useState(state.salary);
  const set = (k, d) => setV((s) => {
    const n = Math.max(0, Math.min(100, s[k] + d));
    return n + ['milli', 'jar', 'fund'].filter((x) => x !== k).reduce((a, x) => a + s[x], 0) > 100 ? s : { ...s, [k]: n };
  });
  const rows = [
    ['milli', 'میلی', 'خرید خودکار در روز واریز', '#fbb918'],
    ['jar', 'قلک خرید خانه', 'واریز خودکار به قلک', '#2bd36b'],
    ['fund', 'صندوق درآمد ثابت', 'سود روزشمار', '#5470ff'],
  ];
  const rest = 100 - v.milli - v.jar - v.fund;
  return (
    <>
      <NavBar title="تقسیم حقوق" />
      <div className="card">
        <div className="between"><span className="small muted">حقوق ماهانه</span><span className="h3 num">{fa(SALARY)} تومان</span></div>
        <div className="stack-bar mt16">
          {rows.map(([k, , , c]) => <i key={k} style={{ flex: v[k], background: c }} />)}
          <i style={{ flex: rest, background: 'var(--faint)' }} />
        </div>
        <div className="xs muted mt12">هر ماه، همان لحظه که حقوق می‌رسد، خودکار تقسیم می‌شود.</div>
      </div>
      <div className="card mt16" style={{ padding: '4px 18px' }}>
        {rows.map(([k, name, sub, c]) => (
          <div className="list-row" key={k}>
            <AssetIcon color={c} />
            <div className="grow col gap4"><span className="h3">{name}</span><span className="xs muted num">{fa(Math.round((SALARY * v[k]) / 100))} تومان · {sub}</span></div>
            <span className="row" style={{ gap: 6 }}>
              <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => set(k, -5)}>−</button>
              <span className="h3 num" style={{ minWidth: 38, textAlign: 'center' }}>{fa(v[k])}٪</span>
              <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => set(k, 5)}>+</button>
            </span>
          </div>
        ))}
        <div className="list-row">
          <span className="badge-ic"><Wallet size={19} /></span>
          <div className="grow col gap4"><span className="h3">می‌ماند در کیف پول ریالی</span><span className="xs muted num">{fa(Math.round((SALARY * rest) / 100))} تومان</span></div>
          <span className="h3 num">{fa(rest)}٪</span>
        </div>
      </div>
      <div className="between card soft mt16" style={{ padding: 14 }}>
        <span className="col gap4"><span className="h3">تقسیم خودکار هر ماه</span><span className="xs muted">واریزهای بالای ۱۰ میلیون تومان</span></span>
        <Toggle on={v.on} onClick={() => setV((s) => ({ ...s, on: !s.on }))} />
      </div>
      <button className="btn primary mt24" onClick={() => { patch(() => ({ salary: v })); toast('تقسیم حقوق ذخیره شد'); back(); }}>ذخیره</button>
    </>
  );
}

export const salaryLine = (s) => (s.on
  ? [`${fa(s.milli)}٪ میلی`, s.jar ? `${fa(s.jar)}٪ قلک` : null, s.fund ? `${fa(s.fund)}٪ صندوق` : null].filter(Boolean).join(' · ')
  : 'خاموش');

/* ───────────── خرده‌پول به میلی ───────────── */
export function RoundUp() {
  const { state, patch } = useApp();
  const r = state.roundup;
  const set = (o) => patch((s) => ({ roundup: { ...s.roundup, ...o } }));
  const price = 187000, to = Math.ceil(price / r.step) * r.step;
  const spare = (to - price) * r.mult;
  return (
    <>
      <NavBar title="خرده‌پول به میلی" />
      <div className="card gold" style={{ textAlign: 'center' }}>
        <PiggyBank size={30} className="gold" />
        <div className="small muted mt8">این ماه از خرده‌پول‌ها</div>
        <div className="big-num num mt8">{fa(r.saved)}<small>میلی</small></div>
        <div className="xs muted mt8 num">≈ {fa(r.saved * PRICE)} تومان · از ۲۳ خرید</div>
      </div>
      <div className="between card soft mt16" style={{ padding: 14 }}>
        <span className="col gap4"><span className="h3">گرد کردن خریدهای کارت</span><span className="xs muted">باقی‌مانده هر خرید، میلی می‌شود</span></span>
        <Toggle on={r.on} onClick={() => set({ on: !r.on })} />
      </div>
      <div className="h3 mt24">گرد شود به نزدیک‌ترین</div>
      <div className="segment mt8">
        {[[10000, '۱۰ هزار'], [50000, '۵۰ هزار'], [100000, '۱۰۰ هزار']].map(([x, l]) => <button key={x} className={r.step === x ? 'on' : ''} onClick={() => set({ step: x })}>{l} تومان</button>)}
      </div>
      <div className="h3 mt24">ضریب پس‌انداز</div>
      <div className="segment mt8">
        {[1, 2, 5].map((x) => <button key={x} className={r.mult === x ? 'on' : ''} onClick={() => set({ mult: x })}>{fa(x)} برابر</button>)}
      </div>
      <div className="card mt16">
        <div className="between small"><span className="muted">نمونه: خرید از افق کوروش</span><span className="num">{fa(price)} تومان</span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">از کارت برداشت می‌شود</span><span className="num">{fa(price + spare)} تومان</span></div>
        <div className="divider" />
        <div className="between small"><span className="muted">به میلی تو اضافه می‌شود</span><span className="gold num">+{fa(spare / PRICE, 1)} میلی</span></div>
      </div>
      <div className="h3 mt24">خرده‌پول کجا برود؟</div>
      <div className="segment mt8">
        {[['milli', 'موجودی میلی'], ['jar', 'قلک سفر نوروز']].map(([id, l]) => <button key={id} className={r.dest === id ? 'on' : ''} onClick={() => set({ dest: id })}>{l}</button>)}
      </div>
    </>
  );
}

/* ───────────── تحلیل خرج ───────────── */
export const SPEND = [
  ['خوراک و کافه', 1620, '#fbb918'], ['خرید', 1480, '#3b82f6'], ['قبض و شارژ', 890, '#2bd36b'], ['حمل‌ونقل', 520, '#a855f7'], ['سایر', 350, '#8f8f8f'],
];
const MONTHLY = [['تیر', 5200], ['مرداد', 4700], ['شهریور', 6100], ['مهر', 5500], ['آبان', 4860]];

export function SpendCard() {
  const total = SPEND.reduce((s, x) => s + x[1], 0);
  const max = Math.max(...MONTHLY.map((x) => x[1]));
  return (
    <div className="card">
      <div className="between">
        <span className="col gap4"><span className="small muted">خرج این ماه</span><span className="h1"><M m={total} /></span></span>
        <span className="small up num">↓ ۱۲٪ از ماه قبل</span>
      </div>
      <div className="row mt16" style={{ alignItems: 'flex-end', gap: 10, height: 70 }}>
        {MONTHLY.map(([m, v], i) => (
          <span key={m} className="col grow" style={{ alignItems: 'center', gap: 6 }}>
            <i style={{ width: '100%', height: Math.round((v / max) * 48), borderRadius: 8, background: i === MONTHLY.length - 1 ? 'var(--gold)' : 'var(--track)', display: 'block' }} />
            <span className="xs muted">{m}</span>
          </span>
        ))}
      </div>
      <div className="stack-bar mt16">{SPEND.map(([n, v, c]) => <i key={n} style={{ flex: v, background: c }} />)}</div>
      <div className="mt12">
        {SPEND.map(([n, v, c]) => (
          <div key={n} className="between small" style={{ padding: '6px 0' }}>
            <span className="row gap8"><Diamond color={c} size={8} />{n}</span>
            <span className="row gap8"><span className="muted num">{fa(Math.round((v / total) * 100))}٪</span><M m={v} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const TX_CAT = { qr: 'خوراک و کافه', shop: 'خرید', bill: 'قبض و شارژ', out: 'انتقال', in: 'انتقال', gift: 'پاداش', buy: 'خرید و فروش میلی', sell: 'خرید و فروش میلی' };
export { Coins };
