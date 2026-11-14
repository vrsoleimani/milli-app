// دریافت رویدادهای رفتار و نتیجه آزمون
// POST {code, sid, events:[{seq,...}], meta?, results?, complete?}
// هر بسته یک فایل جدا و بی‌تداخل است: p/CODE/SID-FIRST-LAST.json (شرکت‌کننده) یا t/... (آزمایش داخلی تیم)
// ارسال دوباره همان بسته همان فایل را بازنویسی می‌کند، پس تکراری ثبت نمی‌شود.
import { put } from '@vercel/blob';
import { ADMIN, PART, parseCookies, verify } from '../lib/auth.js';
import { getQuota, quotas, recountQuota } from '../lib/store.js';

const MAX_BODY = 256 * 1024;
const json = (data, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
const save = (path, data) => put(path, JSON.stringify(data), {
  access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true,
});

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ error: 'method' }, 405);
    const text = await request.text();
    if (text.length > MAX_BODY) return json({ error: 'too large' }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return json({ error: 'bad json' }, 400); }

    const jar = parseCookies(request.headers.get('cookie'));
    const part = await verify(jar[PART], 'p');
    const code = String(body.code || '');
    let who;
    if (part && part.code === code) who = { kind: 'p', code, g: part.g, set: part.set, persona: part.persona };
    else if (/^[A-Za-z0-9_-]{1,24}$/.test(code) && (await verify(jar[ADMIN], 'admin'))) {
      who = { kind: 't', code, g: body.meta?.g || '-', set: body.meta?.set || '-', persona: body.meta?.persona || '-' };
    } else return json({ error: 'unauthorized' }, 401);

    const sid = /^[a-z0-9]{1,16}$/.test(body.sid || '') ? body.sid : 'x';
    const events = (Array.isArray(body.events) ? body.events : []).filter((e) => e && Number.isFinite(e.seq)).sort((a, b) => a.seq - b.seq);
    const now = new Date().toISOString();
    const first = events.length ? events[0].seq : 0;
    const last = events.length ? events[events.length - 1].seq : 0;
    const name = events.length ? `${sid}-${first}-${last}` : `${sid}-r${Date.now()}`;

    const chunk = {
      code: who.code, g: who.g, set: who.set, persona: who.persona, internal: who.kind === 't', sid, at: now,
      meta: body.meta && typeof body.meta === 'object' ? body.meta : undefined,
      results: body.results && typeof body.results === 'object' ? body.results : undefined,
      complete: !!body.complete,
      events,
    };

    let overQuota = false;
    if (body.complete && who.kind === 'p') {
      // سهمیه: اگر پیش از این پایان، ظرفیت گروه پر بوده، پاسخ «بیش از سهمیه» علامت می‌خورد
      const before = (await getQuota())[who.g] || 0;
      overQuota = before >= quotas()[who.g];
      chunk.overQuota = overQuota;
    }
    await save(`${who.kind}/${who.code}/${name}.json`, chunk);
    if (body.complete && who.kind === 'p') {
      await save(`done/${who.g}/${who.code}.json`, { at: now, overQuota });
      await recountQuota();
    }
    return json({ ok: true, lastSeq: last, overQuota });
  },
};
