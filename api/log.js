// دریافت رویدادهای رفتار و نتیجه آزمون
// POST {code, events:[{seq,...}], meta?, results?, complete?}
// شرکت‌کننده (کوکی کد) در p/CODE.json؛ تیم (کوکی رمز) در t/CODE.json تا از داده اصلی جدا بماند.
import { ADMIN, PART, parseCookies, verify } from '../lib/auth.js';
import { put } from '@vercel/blob';
import { getQuota, quotas, recountQuota, update } from '../lib/store.js';

const MAX_BODY = 256 * 1024;
const MAX_EVENTS = 30000;
const json = (data, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });

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
    if (part && part.code === code) who = { kind: 'p', ...part };
    else if (/^[A-Za-z0-9_-]{1,24}$/.test(code) && (await verify(jar[ADMIN], 'admin'))) {
      who = { kind: 't', code, g: body.meta?.g || '-', set: body.meta?.set || '-', persona: body.meta?.persona || '-' };
    } else return json({ error: 'unauthorized' }, 401);

    const path = `${who.kind}/${who.code}.json`;
    const incoming = Array.isArray(body.events) ? body.events.filter((e) => e && Number.isFinite(e.seq)) : [];
    const now = new Date().toISOString();
    let completedNow = false;
    let lastSeq = 0;
    const sid = /^[a-z0-9]{1,16}$/.test(body.sid || '') ? body.sid : 'x';

    const saved = await update(path, (cur) => {
      const rec = cur || {
        code: who.code, g: who.g, set: who.set, persona: who.persona, internal: who.kind === 't',
        firstSeen: now, done: false, seqBySid: {}, events: [], results: {},
      };
      rec.lastSeen = now;
      if (body.meta && typeof body.meta === 'object') rec.meta = { ...rec.meta, ...body.meta };
      // هر مرورگر یک sid دارد؛ شماره رویدادها برای هر sid جدا پیش می‌رود تا تکراری ثبت نشود
      rec.seqBySid ||= {};
      const last = rec.seqBySid[sid] || 0;
      const fresh = incoming.filter((e) => e.seq > last).sort((a, b) => a.seq - b.seq).map((e) => ({ ...e, sid }));
      if (fresh.length) {
        rec.events = rec.events.concat(fresh).slice(-MAX_EVENTS);
        rec.seqBySid[sid] = fresh[fresh.length - 1].seq;
      }
      lastSeq = rec.seqBySid[sid] || 0;
      if (body.results && typeof body.results === 'object') rec.results = { ...rec.results, ...body.results };
      completedNow = false;
      if (body.complete && !rec.done) {
        rec.done = true;
        rec.completedAt = now;
        completedNow = true;
      }
      return rec;
    });

    let overQuota = saved.overQuota || false;
    if (completedNow && who.kind === 'p') {
      // سهمیه: اگر پیش از این پایان، ظرفیت گروه پر بوده، پاسخ «بیش از سهمیه» علامت می‌خورد
      const before = (await getQuota())[who.g] || 0;
      overQuota = before >= quotas()[who.g];
      await put(`done/${who.g}/${who.code}.json`, JSON.stringify({ at: now, overQuota }), {
        access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true,
      });
      await recountQuota();
      if (overQuota) await update(path, (cur) => ({ ...cur, overQuota: true }));
    }

    return json({ ok: true, lastSeq, done: saved.done, overQuota });
  },
};
