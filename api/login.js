// ورود تیم با رمز ثابت (متغیر محیطی TEST_PASSWORD)
import { ADMIN, ADMIN_TTL, cookie, sameText, sign } from '../lib/auth.js';
import { loginPage } from '../lib/page.js';

const safeNext = (n) => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : '/');

export default {
  async fetch(request) {
    if (request.method !== 'POST') return Response.redirect(new URL('/', request.url), 302);
    const form = await request.formData().catch(() => null);
    const next = safeNext(form?.get('next'));
    const ok = process.env.TEST_PASSWORD && sameText(form?.get('password'), process.env.TEST_PASSWORD);
    if (!ok) {
      await new Promise((r) => setTimeout(r, 900)); // کند کردن حدس زدن رمز
      return loginPage(next, 'رمز درست نیست.');
    }
    const token = await sign({ r: 'admin' }, ADMIN_TTL);
    return new Response(null, {
      status: 303,
      headers: { location: next, 'set-cookie': cookie(ADMIN, token, ADMIN_TTL), 'cache-control': 'no-store' },
    });
  },
};
