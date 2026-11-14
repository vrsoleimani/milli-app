// انبار داده آزمون روی Vercel Blob (خصوصی)
// codes.json        فهرست کدهای دعوت {codes:{CODE:{g,set,persona,at}}}
// quota.json        شمار پاسخ کامل هر گروه {m:0,n:0,e:0}
// p/CODE.json       رویدادها و نتیجه هر شرکت‌کننده
// t/CODE.json       آزمایش داخلی تیم (با رمز، بدون کد دعوت)
// done/G/CODE.json  نشان پایان کامل؛ پایه شمارش سهمیه
import { put, get, head, list, del } from '@vercel/blob';

const ACCESS = { access: 'private' };

export async function readJSON(path) {
  const r = await get(path, { ...ACCESS, useCache: false }).catch((e) => {
    if (e?.name === 'BlobNotFoundError' || /not found/i.test(e?.message || '')) return null;
    throw e;
  });
  if (!r || r.statusCode !== 200) return null;
  const text = await new Response(r.stream).text();
  return { data: JSON.parse(text), etag: r.blob.etag };
}

export async function writeJSON(path, data, etag) {
  const opts = { ...ACCESS, contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60 };
  if (etag) opts.ifMatch = etag;
  else opts.allowOverwrite = true;
  return put(path, JSON.stringify(data), opts);
}

// خواندن، تغییر و نوشتن با بررسی ETag (تا دو نوشتن هم‌زمان هم را پاک نکنند)
export async function update(path, fn, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const cur = await readJSON(path);
    const next = await fn(cur ? cur.data : null);
    if (next === undefined) return cur?.data;
    try {
      if (cur) await writeJSON(path, next, cur.etag);
      else await put(path, JSON.stringify(next), { ...ACCESS, contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 60 });
      return next;
    } catch (e) {
      const conflict = e?.name === 'BlobPreconditionFailedError' || /precondition|already exists/i.test(e?.message || '');
      if (!conflict || i === tries - 1) throw e;
      await new Promise((r) => setTimeout(r, 120 * (i + 1)));
    }
  }
}

export async function exists(path) {
  try {
    await head(path, ACCESS);
    return true;
  } catch (e) {
    if (e?.name === 'BlobNotFoundError' || /not found/i.test(e?.message || '')) return false;
    throw e;
  }
}

export async function listAll(prefix) {
  const out = [];
  let cursor;
  do {
    const r = await list({ prefix, cursor, limit: 1000 });
    out.push(...r.blobs);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return out;
}

// ─── کدها، گروه‌ها و سهمیه ───
export const GROUPS = { m: 'کاربر میلی گلد', n: 'بدون تجربه سرمایه‌گذاری آنلاین', e: 'آشنا با بورس یا رمزارز' };
export const SETS = ['A', 'B', 'C', 'D']; // مجموعه‌های الف تا د بسته پژوهش
export const PERSONAS = ['only', 'multi', 'new'];
export const DEFAULT_PERSONA = { m: 'only', n: 'multi', e: 'multi' };
const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // بدون O، 0، I، 1 و L

export function quotas() {
  const out = { m: 40, n: 40, e: 40 };
  (process.env.QUOTAS || '').split(',').forEach((kv) => {
    const [k, v] = kv.split(':').map((x) => x.trim());
    if (GROUPS[k] && Number(v) >= 0) out[k] = Number(v);
  });
  return out;
}

export function randomCode(len = 6) {
  const bytes = crypto.getRandomValues(new Uint8Array(len * 2));
  let s = '';
  for (const b of bytes) {
    if (b >= 248) continue; // 248 = 31 × 8؛ برای پخش یکنواخت
    s += ALPHA[b % ALPHA.length];
    if (s.length === len) break;
  }
  return s.length === len ? s : randomCode(len);
}

export const CODE_RE = /^[A-Z2-9]{6}$/;

let codesCache = { at: 0, data: null };
export async function getCodes(fresh = false) {
  if (!fresh && codesCache.data && Date.now() - codesCache.at < 60_000) return codesCache.data;
  const r = await readJSON('codes.json');
  codesCache = { at: Date.now(), data: r ? r.data : { codes: {} } };
  return codesCache.data;
}

export async function addCodes(g, n, persona) {
  const made = [];
  await update('codes.json', (cur) => {
    const data = cur || { codes: {} };
    made.length = 0;
    const inGroup = Object.values(data.codes).filter((c) => c.g === g).length;
    for (let i = 0; i < n; i++) {
      let code;
      do code = randomCode(); while (data.codes[code]);
      const c = { g, set: SETS[(inGroup + i) % SETS.length], persona, at: new Date().toISOString() };
      data.codes[code] = c;
      made.push({ code, ...c });
    }
    return data;
  });
  codesCache = { at: 0, data: null };
  return made;
}

export async function getQuota() {
  const r = await readJSON('quota.json');
  return r ? r.data : { m: 0, n: 0, e: 0 };
}

export async function recountQuota() {
  const done = await listAll('done/');
  const q = { m: 0, n: 0, e: 0 };
  done.forEach((b) => {
    const g = b.pathname.split('/')[1];
    if (q[g] !== undefined) q[g]++;
  });
  await writeJSON('quota.json', q);
  return q;
}

// پاک کردن کامل یک کد (برای کدهای آزمایشی تیم): از فهرست کدها، داده و نشان پایان
export async function purgeCode(code) {
  let g = null;
  await update('codes.json', (cur) => {
    if (!cur || !cur.codes[code]) return undefined;
    g = cur.codes[code].g;
    const codes = { ...cur.codes };
    delete codes[code];
    return { ...cur, codes };
  });
  const paths = [`p/${code}.json`, `t/${code}.json`];
  if (g) paths.push(`done/${g}/${code}.json`);
  await del(paths).catch(() => {});
  codesCache = { at: 0, data: null };
  await recountQuota();
  return g;
}
