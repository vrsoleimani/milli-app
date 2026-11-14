// ورود شرکت‌کننده با لینک دعوت: /?c=CODE ← اینجا ← حالت آزمون
// کد باید در codes.json باشد، قبلاً کامل نشده باشد و ظرفیت گروهش پر نباشد.
import { PART, PART_TTL, cookie, sign, testUrl } from '../lib/auth.js';
import { messagePage } from '../lib/page.js';
import { CODE_RE, exists, getCodes, getQuota, quotas } from '../lib/store.js';

const invalid = () => messagePage('لینک معتبر نیست', 'این لینک دعوت درست نیست یا کامل کپی نشده. لطفاً لینک را دوباره از پیام دعوت باز کن.', 404);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const code = (url.searchParams.get('c') || '').trim().toUpperCase();
    if (!CODE_RE.test(code)) {
      await new Promise((r) => setTimeout(r, 600));
      return invalid();
    }
    let info = (await getCodes()).codes[code];
    if (!info) info = (await getCodes(true)).codes[code]; // کد تازه ساخته شده
    if (!info) {
      await new Promise((r) => setTimeout(r, 600));
      return invalid();
    }

    // یک‌بارمصرف: پس از پایان کامل، دوباره باز نمی‌شود
    if (await exists(`done/${info.g}/${code}.json`)) {
      return messagePage('این آزمون انجام شده', 'این لینک قبلاً تا آخر استفاده شده است. از همراهی‌ات ممنونیم.', 410);
    }

    // سقف سهمیه: کسی که شروع کرده می‌تواند ادامه دهد؛ ورود تازه پس از پر شدن بسته است
    const started = await exists(`p/${code}.json`);
    if (!started) {
      const cap = quotas()[info.g];
      const done = (await getQuota())[info.g] || 0;
      if (done >= cap) {
        return messagePage('ظرفیت تکمیل شد', 'ظرفیت این آزمون پر شده است. از وقتی که گذاشتی ممنونیم.', 403);
      }
    }

    const p = { r: 'p', code, g: info.g, set: info.set, persona: info.persona };
    const token = await sign(p, PART_TTL);
    return new Response(null, {
      status: 302,
      headers: { location: testUrl(p), 'set-cookie': cookie(PART, token, PART_TTL), 'cache-control': 'no-store' },
    });
  },
};
