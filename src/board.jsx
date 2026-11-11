import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { Ctx, staticCtx, StatusBar, TabBar } from './ui.jsx';
import { Home, Assets, Services, Card, Profile } from './tabs.jsx';
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

      <h2>پنج تب اصلی</h2>
      <section>
        <Phone tall tab="home" label="میلی (خانه)" note="موجودی میلی، قیمت میلی، خرید، فروش، ارسال، پرداخت، کیف پول ریالی، پاداش، قلک‌ها" ><Home /></Phone>
        <Phone tall tab="assets" label="دارایی‌ها" note="مجموع دارایی، میلی در صدر، سایر دارایی‌ها، تبدیل، مشاور میلی"><Assets /></Phone>
        <Phone tall tab="services" label="خدمات" note="اعتبار، اقساط، قبض، بیمه، املاک، تحویل فیزیکی، پذیرنده‌ها"><Services /></Phone>
        <Phone tall tab="card" label="کارت" note="پشتوانه پرداخت به انتخاب کاربر، پاداش هر خرید"><Card /></Phone>
        <Phone tall tab="profile" label="پروفایل" note="حساب شخصی، بیزینس و خانواده، QR من، واحد نمایش"><Profile /></Phone>
      </section>

      <h2>کلید واحد و چشم</h2>
      <section>
        <Phone tab="home" label="واحد میلی" note="پیش‌فرض: همه مبلغ‌ها به میلی"><Home /></Phone>
        <Phone tab="home" over={{ unit: 'toman' }} label="واحد تومان" note="با یک لمس، همه اپ تومانی می‌شود"><Home /></Phone>
        <Phone tab="home" over={{ hidden: true }} label="عددها پنهان" note="چشم، همه عددهای اپ را پنهان می‌کند"><Home /></Phone>
      </section>

      <h2>پرداخت و انتقال</h2>
      <section>
        <Phone bare label="۱ · اسکن QR" note="از دکمه پرداخت یا آیکون اسکن"><Scan /></Phone>
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
        <Phone label="افزایش سقف اعتبار" note="با پشتوانه میلی و سایر دارایی‌ها"><CreditUp /></Phone>
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
