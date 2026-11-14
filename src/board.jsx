import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { Ctx, staticCtx, StatusBar, TabBar } from './ui.jsx';
import { Home, Assets, Services, Card, Profile } from './tabs.jsx';
import * as S from './screens.jsx';
import { Split, Assistant, SalarySplit, RoundUp } from './extra.jsx';
import { PayHub } from './pay.jsx';
import { Pnl } from './pnl.jsx';
import {
  Buy, Send, Request, Pay, Success, Bills, Convert, NewJar, CreditUp, Welcome, OnbPhone, OnbGift,
} from './flows.jsx';

function Phone({ children, tall, tab, over, label, note, bare }) {
  const ctx = staticCtx({ tab, ...over });
  return (
    <figure className="frame">
      <Ctx.Provider value={ctx}>
        <div className={`phone ${tall ? 'tall' : ''}`}>
          <StatusBar />
          {bare ? children : <div className="screen">{children}</div>}
          {tab && <TabBar />}
        </div>
      </Ctx.Provider>
      <figcaption><b>{label}</b>{note && <span>{note}</span>}</figcaption>
    </figure>
  );
}

function Board() {
  return (
    <main className="board">
      <header>
        <h1>اپلیکیشن جامع میلی</h1>
        <p>طرح صفحه‌ها · تصویر آینده اپ با همه خدمات فعال · داده‌ها نمونه‌اند</p>
      </header>

      <h2>چهار تب، دکمه پرداخت در وسط، پروفایل در آواتار</h2>
      <section>
        <Phone tall tab="home" label="میلی (خانه)" note="نوار دستیار، موجودی میلی، خرید، فروش، انتقال، یادآور هوشمند، کیف پول ریالی با تقسیم حقوق، بنرهای وام، خرید قسطی طلا و سود طلایی" ><Home /></Phone>
        <Phone tall tab="assets" label="دارایی‌ها" note="مجموع دارایی، باکس میلی (طلا به گرم)، قلک‌ها (شخصی و گروهی)، سایر دارایی‌ها، تبدیل، مشاور هوشمند میلی"><Assets /></Phone>
        <Phone tall tab="card" label="کارت و اعتبار" note="کارت، پاداش خرید، خرده‌پول به میلی، اعتبار، اقساط، وام، پشتوانه پرداخت"><Card /></Phone>
        <Phone tall tab="services" label="خدمات" note="میلی گالری، سود طلایی، قبض، بیمه، املاک، تحویل فیزیکی، پذیرنده‌ها"><Services /></Phone>
        <Phone tall label="پروفایل" note="از آواتار بالای هر تب باز می‌شود"><Profile /></Phone>
      </section>

      <h2>سود و زیان (تازه)</h2>
      <section>
        <Phone tall tab="assets" label="ورودی" note="ردیف «سود و زیان ماه» در باکس مجموع دارایی؛ قلک‌ها هم در مجموع دارایی حساب می‌شود"><Assets /></Phone>
        <Phone tall label="آبشاری · بر اساس دارایی" note="ابتدای دوره، واریز و برداشت خالص، سهم هر گروه دارایی، پایان دوره"><Pnl p={{ open: 'btc' }} /></Phone>
        <Phone tall over={{ unit: 'toman' }} label="آبشاری · بر اساس منبع · تومان" note="تغییر قیمت، سود طلایی و صندوق، پاداش و خرده‌پول، کارمزد"><Pnl p={{ by: 'source', range: 'q', help: true }} /></Phone>
        <Phone tall over={{ unit: 'toman' }} label="روند · تومان" note="سود و زیان تجمعی در برابر «اگر همه دارایی میلی بود»"><Pnl p={{ view: 'trend', range: 'y' }} /></Phone>
        <Phone tall label="روند · میلی" note="خط صفر یعنی نگه‌داشتن میلی"><Pnl p={{ view: 'trend', range: 'c' }} /></Phone>
      </section>

      <h2>پرداخت (تازه)</h2>
      <section>
        <Phone bare label="۱ · پرداخت · اسکن" note="دکمه وسط نوار مستقیم اسکنر را باز می‌کند؛ فقط مخاطب‌ها، انتقال و درخواست در برگه پایین، بدون اسکرول"><PayHub /></Phone>
        <Phone bare label="۲ · پرداخت · QR من" note="روی دوم همان صفحه: کارت طلایی برای دریافت میلی"><PayHub mode="qr" /></Phone>
        <Phone label="۳ · پیشنهاد دنگ بعد از پرداخت" note="دنگ از این صفحه و از «درخواست» باز می‌شود، نه از صفحه پرداخت"><Success amount={45} sub="به کافه لمیز" reward={0.9} split={{ title: 'کافه لمیز', total: 45 }} /></Phone>
      </section>

      <h2>تغییرهای تازه (در انتظار تأیید)</h2>
      <section>
        <Phone tall label="۵ · دستیار میلی" note="پرسش و انجام کار با گفتگو؛ هر کار با تأیید کاربر"><Assistant /></Phone>
        <Phone tall label="۴ · تقسیم حقوق" note="درصد میلی، قلک و صندوق در روز واریز"><SalarySplit /></Phone>
        <Phone tall label="۳ · خرده‌پول به میلی" note="گرد کردن خریدهای کارت، با ضریب"><RoundUp /></Phone>
        <Phone tall label="۹ · دنگ" note="تقسیم مساوی و درخواست از چند نفر؛ دنگ‌های باز در ردیف بالای صفحه"><Split /></Phone>
      </section>
      <section>
        <Phone tall label="۸ · تراکنش‌ها و خرج" note="نمودار ماهانه، دسته‌بندی، جستجو، معادل تومانی"><S.History /></Phone>
        <Phone tall label="۱۰ · هدیه میلی" note="کارت تبریک و مناسبت در همان جریان ارسال"><Send preset="300" gift /></Phone>
        <Phone tall label="۱۱ · محافظت از دارایی" note="در امنیت و ورود"><S.Settings p={{ kind: 'security' }} /></Phone>
        <Phone tall label="۱۲ · منبع پرداخت" note="تعویض فوری منبع در صفحه تأیید"><Pay /></Phone>
        <Phone tall label="سود طلایی" note="ماهانه ۱٪ سود به میلی، حداقل ۶ ماه"><S.GoldYield /></Phone>
        <Phone tall label="۷ · قلک گروهی" note="قلک‌ها به تب دارایی‌ها رفت؛ نوع گروهی اضافه شد"><NewJar /></Phone>
      </section>

      <h2>کلید واحد و چشم</h2>
      <section>
        <Phone tab="home" label="واحد میلی" note="پیش‌فرض: همه مبلغ‌ها به میلی"><Home /></Phone>
        <Phone tab="home" over={{ unit: 'toman' }} label="واحد تومان" note="با یک لمس، همه اپ تومانی می‌شود"><Home /></Phone>
        <Phone tab="home" over={{ hidden: true }} label="عددها پنهان" note="چشم، همه عددهای اپ را پنهان می‌کند"><Home /></Phone>
      </section>

      <h2>پرداخت و انتقال</h2>
      <section>
        <Phone label="۲ · تأیید پرداخت" note="پرداخت از میلی، پاداش ۲٪"><Pay /></Phone>
        <Phone label="۳ · پرداخت انجام شد"><Success /></Phone>
        <Phone label="ارسال میلی به دوست"><Send preset="300" /></Phone>
        <Phone label="درخواست میلی"><Request preset="240" /></Phone>
      </section>

      <h2>خرید، تبدیل و پس‌انداز</h2>
      <section>
        <Phone label="خرید میلی" note="از کیف پول ریالی، با گزینه خرید هفتگی"><Buy preset="600" /></Phone>
        <Phone label="تبدیل" note="بین هر دو دارایی، فوری؛ کارمزد شفاف و تبدیل به میلی بدون کارمزد"><Convert /></Phone>
        <Phone label="قلک تازه" note="هدف به میلی، واریز خودکار"><NewJar /></Phone>
        <Phone label="قبض و شارژ" note="پرداخت همه با میلی"><Bills /></Phone>
        <Phone tall label="افزایش سقف اعتبار" note="پشتوانه: میلی، صندوق‌ها، نقره، تتر و ..."><CreditUp /></Phone>
      </section>

      <h2>شروع حساب تازه</h2>
      <section>
        <Phone label="۱ · خوش‌آمد"><Welcome /></Phone>
        <Phone label="۲ · شماره و کد"><OnbPhone /></Phone>
        <Phone label="۳ · هدیه ۳۰ میلی"><OnbGift /></Phone>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<Board />);
