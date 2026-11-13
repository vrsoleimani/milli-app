import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { Ctx, staticCtx, StatusBar, TabBar } from './ui.jsx';
import { Home, Assets, Services, Card, Profile } from './tabs.jsx';
import * as S from './screens.jsx';
import { PayHub, Split, Assistant, SalarySplit, RoundUp } from './extra.jsx';
import {
  Buy, Send, Request, Scan, Pay, Success, Bills, Convert, NewJar, CreditUp, Welcome, OnbPhone, OnbGift,
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

      <h2>تغییرهای تازه (در انتظار تأیید)</h2>
      <section>
        <Phone tall label="۱ · پرداخت و انتقال" note="دکمه وسط نوار: اسکن، ارسال، درخواست، دنگ، هدیه، QR من، قبض"><PayHub /></Phone>
        <Phone tall label="۵ · دستیار میلی" note="پرسش و انجام کار با گفتگو؛ هر کار با تأیید کاربر"><Assistant /></Phone>
        <Phone tall label="۴ · تقسیم حقوق" note="درصد میلی، قلک و صندوق در روز واریز"><SalarySplit /></Phone>
        <Phone tall label="۳ · خرده‌پول به میلی" note="گرد کردن خریدهای کارت، با ضریب"><RoundUp /></Phone>
        <Phone tall label="۹ · دنگ" note="تقسیم مساوی و درخواست از چند نفر"><Split /></Phone>
      </section>
      <section>
        <Phone tall label="۸ · تراکنش‌ها و خرج" note="نمودار ماهانه، دسته‌بندی، جستجو، معادل تومانی"><S.History /></Phone>
        <Phone tall label="۱۰ · هدیه میلی" note="کارت تبریک و مناسبت در همان جریان ارسال"><Send preset="1000" gift /></Phone>
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
        <Phone bare label="۱ · اسکن QR" note="از دکمه پرداخت وسط نوار"><Scan /></Phone>
        <Phone label="۲ · تأیید پرداخت" note="پرداخت از میلی، پاداش ۲٪"><Pay /></Phone>
        <Phone label="۳ · پرداخت انجام شد"><Success /></Phone>
        <Phone label="ارسال میلی به دوست"><Send preset="1000" /></Phone>
        <Phone label="درخواست میلی"><Request preset="800" /></Phone>
      </section>

      <h2>خرید، تبدیل و پس‌انداز</h2>
      <section>
        <Phone label="خرید میلی" note="از کیف پول ریالی، با گزینه خرید هفتگی"><Buy preset="2000" /></Phone>
        <Phone label="تبدیل" note="بین هر دو دارایی، فوری"><Convert /></Phone>
        <Phone label="قلک تازه" note="هدف به میلی، واریز خودکار"><NewJar /></Phone>
        <Phone label="قبض و شارژ" note="پرداخت همه با میلی"><Bills /></Phone>
        <Phone tall label="افزایش سقف اعتبار" note="پشتوانه: میلی، صندوق‌ها، نقره، تتر و ..."><CreditUp /></Phone>
      </section>

      <h2>شروع حساب تازه</h2>
      <section>
        <Phone label="۱ · خوش‌آمد"><Welcome /></Phone>
        <Phone label="۲ · شماره و کد"><OnbPhone /></Phone>
        <Phone label="۳ · هدیه ۱۰۰ میلی"><OnbGift /></Phone>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<Board />);
