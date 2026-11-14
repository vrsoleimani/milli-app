// قفل ورود موکاپ: هر صفحه و فایل (از جمله board.html) بدون کوکی معتبر، صفحه رمز را نشان می‌دهد.
// شرکت‌کننده با لینک دعوت (?c=کد) بدون رمز وارد می‌شود و فقط به خود اپ در حالت آزمون دسترسی دارد.
// مسیرهای /api خودشان دسترسی را بررسی می‌کنند.
import { next } from '@vercel/functions';
import { ADMIN, PART, parseCookies, verify, testUrl } from './lib/auth.js';
import { loginPage } from './lib/page.js';

export const config = { matcher: '/((?!api/).*)' };

// فایل‌هایی که مرورگر بدون کوکی می‌خواهد و چیزی از طرح لو نمی‌دهند
const PUBLIC = new Set(['/robots.txt', '/favicon.svg', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']);
// آنچه شرکت‌کننده برای اجرای اپ لازم دارد
const PART_OK = (p) => p.startsWith('/assets/') || PUBLIC.has(p);
const IS_APP = (p) => p === '/' || p === '/index.html';

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (PUBLIC.has(path)) return next();

  const jar = parseCookies(request.headers.get('cookie'));
  const code = url.searchParams.get('c');

  // لینک دعوت همیشه از مسیر ورود با کد می‌گذرد (حتی برای تیم، تا کد آزموده شود)
  if (code && IS_APP(path)) {
    return Response.redirect(new URL(`/api/enter?c=${encodeURIComponent(code)}`, url), 302);
  }

  if (await verify(jar[ADMIN], 'admin')) return next();

  const part = await verify(jar[PART], 'p');
  if (part) {
    if (IS_APP(path)) {
      // شرکت‌کننده همیشه در حالت آزمون خودش می‌ماند
      if (url.searchParams.get('test') !== part.code) return Response.redirect(new URL(testUrl(part), url), 302);
      return next();
    }
    if (PART_OK(path)) return next();
  }

  return loginPage(path + url.search);
}
