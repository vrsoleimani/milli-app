import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { Ctx, staticCtx, StatusBar, TabBar } from './ui.jsx';
import { Home, Assets, Services, Card, Profile } from './tabs.jsx';
import * as S from './screens.jsx';
import { Split, Assistant, SalarySplit, RoundUp } from './extra.jsx';
import { PayHub } from './pay.jsx';
import { Pnl } from './pnl.jsx';
import { CardManage, CreditMore, CardPerks } from './simple.jsx';
import { fullAssets } from './data.js';

// سبد پر (ده دارایی) برای صفحه‌هایی که حالت کامل را نشان می‌دهند
const FULL = { assets: fullAssets, backing: ['milli', 'usdt', 'rial', 'btc'] };
const ONLY_MILLI = { assets: fullAssets.map((a) => ({ ...a, value: 0 })), backing: ['milli', 'rial'] };
import {
  Buy, Send, Request, Pay, Success, Bills, Convert, NewJar, CreditUp, Welcome, OnbPhone, OnbGift,
} from './flows.jsx';

function Phone({ children, tall, tab, over, label, note, bare, theme, full, st }) {
  const ctx = staticCtx({ tab, theme: theme || 'dark', ...over, st: { ...(full ? FULL : null), ...st } });
  return (
    <figure className="frame">
      <Ctx.Provider value={ctx}>
        <div className={`phone ${tall ? 'tall' : ''}`} data-theme={theme}>
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

      <h2>ساده‌سازی: واحدها، سه حالت دارایی‌ها، اعتبار و سود و زیان (تازه)</h2>
      <section>
        <Phone tall tab="home" label="خانه" note="یک خط «اعتبار در دسترس» و بنر سود طلایی به‌جای سه بنر؛ تغییر حساب در پروفایل است"><Home /></Phone>
      </section>
      <section>
        <Phone tall tab="assets" st={ONLY_MILLI} label="دارایی‌ها · فقط میلی" note="حالت بیشتر کاربران: بدون نوار ترکیب، راهنما و فیلتر"><Assets /></Phone>
        <Phone tall tab="assets" label="دارایی‌ها · چند دارایی" note="تا سه دارایی: فهرست ساده و نوار دوتکه؛ کاربر نمونه با همین حالت شروع می‌کند"><Assets /></Phone>
        <Phone tall tab="assets" full label="دارایی‌ها · سبد پر" note="بیش از سه دارایی: نوار ترکیب و فیلتر گروه ظاهر می‌شود"><Assets /></Phone>
        <Phone tall label="خرید دارایی" note="ردیف «بازار امروز» بالای فهرست؛ زیر هر دارایی مقدار کاربر یا قیمت هر واحد"><S.BuyAsset p={{}} /></Phone>
      </section>
      <section>
        <Phone tall tab="card" label="کارت و اعتبار" note="کارت، اعتبار در دسترس به تومان، خرید قسطی، وام و قسط بعدی؛ بقیه در سه ردیف"><Card /></Phone>
        <Phone tall label="مدیریت کارت" note="لایه دوم: مسدودسازی، رمز، پشتوانه، تنظیمات و خریدهای اخیر"><CardManage /></Phone>
        <Phone label="اعتبار من" note="لایه دوم: اقساط، افزایش سقف و امتیاز"><CreditMore /></Phone>
        <Phone label="پاداش و خرده‌پول" note="لایه دوم"><CardPerks /></Phone>
        <Phone label="پرداخت قسط" note="قسط به تومان؛ میلی فقط مقدار برداشت است"><S.PayInstallment p={{ id: 'i1' }} /></Phone>
      </section>
      <section>
        <Phone tall label="سود و زیان · ساده" note="یک عدد، بازه و فهرست دارایی‌ها"><Pnl p={{ open: 'usdt' }} /></Phone>
        <Phone tall st={ONLY_MILLI} over={{ unit: 'toman' }} label="سود و زیان · فقط میلی · تومان" note="برای کاربری که فقط میلی دارد"><Pnl /></Phone>
        <Phone tall full label="سود و زیان · جزئیات بیشتر" note="آبشاری، روند، محقق‌شده، تقویم و گزارش پشت یک دکمه"><Pnl p={{ more: true }} /></Phone>
        <Phone tall label="خرده‌پول به میلی" note="یک کلید؛ مبلغ گرد کردن، ضریب و مقصد زیر «تنظیمات بیشتر»"><RoundUp /></Phone>
        <Phone tall label="دستیار میلی" note="مشاور هوشمند در دستیار ادغام شد: یادآوری، نه پیشنهاد سرمایه‌گذاری"><Assistant /></Phone>
      </section>

      <h2>چهار تب، دکمه پرداخت در وسط، پروفایل در آواتار</h2>
      <section>
        <Phone tall tab="home" label="میلی (خانه)" note="نوار دستیار، موجودی میلی، خرید، فروش، انتقال، یادآور هوشمند، کیف پول ریالی، اعتبار در دسترس، سود طلایی، تراکنش‌های اخیر" ><Home /></Phone>
        <Phone tall tab="assets" label="دارایی‌ها" note="مجموع دارایی، باکس میلی، قلک‌ها (شخصی و گروهی)، سایر دارایی‌ها، خرید و تبدیل"><Assets /></Phone>
        <Phone tall tab="card" label="کارت و اعتبار" note="کارت، اعتبار در دسترس، خرید قسطی، وام، قسط بعدی؛ مدیریت کارت، اعتبار من، پاداش و خرده‌پول"><Card /></Phone>
        <Phone tall tab="services" label="خدمات" note="میلی گالری، سود طلایی، قبض، بیمه، املاک، تحویل فیزیکی، پذیرنده‌ها"><Services /></Phone>
        <Phone tall label="پروفایل" note="از آواتار بالای هر تب باز می‌شود"><Profile /></Phone>
      </section>

      <h2>سود و زیان (تازه)</h2>
      <section>
        <Phone tall tab="assets" full label="ورودی" note="ردیف «سود و زیان ماه» در باکس مجموع دارایی؛ قلک‌ها هم در مجموع دارایی حساب می‌شود"><Assets /></Phone>
        <Phone tall full label="آبشاری · بر اساس دارایی" note="ابتدای دوره، واریز و برداشت خالص، سهم هر گروه دارایی، پایان دوره"><Pnl p={{ open: 'btc', more: true }} /></Phone>
        <Phone tall full over={{ unit: 'toman' }} label="آبشاری · بر اساس منبع · تومان" note="تغییر قیمت، سود طلایی و صندوق، پاداش و خرده‌پول، کارمزد"><Pnl p={{ by: 'source', range: 'q', help: true }} /></Phone>
        <Phone tall full over={{ unit: 'toman' }} label="روند · تومان" note="سود و زیان تجمعی در برابر «اگر همه دارایی میلی بود»"><Pnl p={{ view: 'trend', range: 'y' }} /></Phone>
        <Phone tall full label="روند · میلی" note="خط صفر یعنی نگه‌داشتن میلی"><Pnl p={{ view: 'trend', range: 'c' }} /></Phone>
      </section>

      <h2>ظاهر روشن، میلیکس و تراکنش‌های جمع‌شده (تازه)</h2>
      <section>
        <Phone tall tab="home" theme="light" label="خانه · روشن" note="تراکنش‌های اخیر یک باکس جمع‌شده است و با لمس باز می‌شود"><Home /></Phone>
        <Phone tall tab="assets" theme="light" label="دارایی‌ها · روشن" note="میلیکس (MLX) اولین ردیف رمزارز"><Assets /></Phone>
        <Phone tall tab="card" theme="light" label="کارت و اعتبار · روشن" note="کارت فیزیکی در هر دو ظاهر تیره می‌ماند"><Card /></Phone>
        <Phone tall theme="light" label="پروفایل · روشن" note="ردیف «ظاهر»: تیره یا روشن؛ پیش‌فرض تیره"><Profile /></Phone>
        <Phone tall label="میلیکس" note="توکن میلی: هر MLX معادل یک میلی، با همان نمودار قیمت"><S.AssetPage p={{ id: 'millix' }} /></Phone>
        <Phone label="تبدیل میلیکس و میلی" note="یک‌به‌یک و بدون کارمزد در هر دو جهت"><Convert from="millix" to="milli" /></Phone>
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
        <Phone full label="تبدیل" note="بین هر دو دارایی، فوری؛ کارمزد شفاف و تبدیل به میلی بدون کارمزد"><Convert /></Phone>
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
