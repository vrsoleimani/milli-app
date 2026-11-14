import React from 'react';
import {
  KeyRound, Hash, Snowflake, WalletCards, Settings, ShoppingBag, Store, Smartphone, CalendarClock, Gauge, TrendingUp, Gift, PiggyBank,
} from 'lucide-react';
import { useApp, NavBar, Row, M, T, SectionTitle, Change, AssetIcon } from './ui.jsx';
import { fa } from './format.js';

/* ───────────── لایه دوم تب کارت و اعتبار ───────────── */
export function CardManage() {
  const { state, go } = useApp();
  const ic = (I) => <span className="badge-ic"><I size={19} /></span>;
  return (
    <>
      <NavBar title="مدیریت کارت" />
      <div className="card" style={{ padding: '4px 18px' }}>
        <Row start={ic(Snowflake)} title={state.frozen ? 'رفع مسدودی کارت' : 'مسدود موقت کارت'} chevron onClick={() => go('cardAction', { kind: 'freeze' })} />
        <Row start={ic(KeyRound)} title="رمز دوم" chevron onClick={() => go('cardAction', { kind: 'pin' })} />
        <Row start={ic(Hash)} title="شماره کارت" chevron onClick={() => go('cardAction', { kind: 'number' })} />
        <Row start={ic(WalletCards)} title="پشتوانه پرداخت" sub="خرید با کارت از کجا کم شود" chevron onClick={() => go('backing')} />
        <Row start={ic(Settings)} title="تنظیمات کارت" chevron onClick={() => go('cardAction', { kind: 'settings' })} />
      </div>
      <SectionTitle title="خریدهای اخیر" />
      <Row start={ic(ShoppingBag)} title="دیجی‌کالا" sub="امروز · از میلی" end={<span>−<M m={94} /></span>} endSub={<span className="gold xs">+۰٫۹ پاداش · +۰٫۳ خرده‌پول</span>} />
      <Row start={ic(Store)} title="افق کوروش" sub="دیروز · از میلی" end={<span>−<M m={26} /></span>} endSub={<span className="gold xs">+۰٫۳ میلی پاداش</span>} />
      <Row start={ic(Smartphone)} title="اسنپ" sub="۱۸ آبان · از تتر" end={<span>−<M m={12} /></span>} />
    </>
  );
}

export function CreditMore() {
  const { state, go } = useApp();
  const ic = (I) => <span className="badge-ic"><I size={19} /></span>;
  const n = state.installments.reduce((s, i) => s + i.left, 0);
  return (
    <>
      <NavBar title="اعتبار من" />
      <div className="card" style={{ padding: '4px 18px' }}>
        <Row start={ic(CalendarClock)} title="اقساط" sub={n ? `${fa(n)} قسط مانده` : 'قسط باز نداری'} chevron onClick={() => go('installments')} />
        <Row start={ic(TrendingUp)} title="افزایش سقف" sub={<>سقف فعلی <T t={state.credit.limit} /></>} chevron onClick={() => go('creditUp')} />
        <Row start={ic(Gauge)} title="امتیاز اعتباری" end={<span className="gold small">رتبه {state.credit.score}</span>} chevron onClick={() => go('score')} />
      </div>
    </>
  );
}

export function CardPerks() {
  const { state, go } = useApp();
  const ic = (I) => <span className="badge-ic"><I size={19} className="gold" /></span>;
  return (
    <>
      <NavBar title="پاداش و خرده‌پول" />
      <div className="card" style={{ padding: '4px 18px' }}>
        <Row start={ic(Gift)} title="پاداش خرید" sub="۱٪ هر خرید با کارت، میلی برمی‌گردد" end={<span className="gold small"><M m={state.rewardsMonth} /></span>} chevron onClick={() => go('rewards')} />
        <Row start={ic(PiggyBank)} title="خرده‌پول به میلی" sub={state.roundup.on ? 'روشن' : 'خاموش'} end={<span className="gold small"><M m={state.roundup.saved} /></span>} chevron onClick={() => go('roundup')} />
      </div>
    </>
  );
}

/* ───────────── بازار امروز: دارایی‌های پرتقاضای روز، بالای فهرست خرید ───────────── */
export function MarketToday({ assets, onPick }) {
  const top = assets.filter((a) => !a.peg).sort((a, b) => b.change - a.change).slice(0, 3);
  return (
    <>
      <div className="between mt16"><span className="h3">بازار امروز</span><span className="xs muted">پرتقاضاترین‌ها</span></div>
      <div className="hscroll mt8">
        {top.map((a) => (
          <button key={a.id} className="jar" style={{ minWidth: 132, textAlign: 'right' }} onClick={() => onPick(a.id)}>
            <AssetIcon color={a.color} />
            <div className="h3 mt8">{a.name}</div>
            <div className="small mt8"><Change v={a.change} /></div>
          </button>
        ))}
      </div>
    </>
  );
}
