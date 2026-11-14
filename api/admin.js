// صفحه مدیریت آزمون (پشت رمز): ساخت کد دعوت، وضعیت سهمیه و خروجی داده
// GET  /api/admin                         صفحه مدیریت
// POST /api/admin  action=codes&g&n&persona  ساخت کد تازه و دریافت CSV لینک‌ها
// GET  /api/admin?action=codes            CSV همه کدها با وضعیت
// GET  /api/admin?action=export&scope=p|t&format=csv|json   خروجی رویدادها
import { ADMIN, parseCookies, verify } from '../lib/auth.js';
import { loginPage, page } from '../lib/page.js';
import {
  DEFAULT_PERSONA, GROUPS, PERSONAS, CODE_RE, addCodes, getCodes, listAll, loadRecords, purgeCode, quotas, recountQuota,
} from '../lib/store.js';

const PERSONA_FA = { only: 'فقط میلی', multi: 'چند دارایی', new: 'تازه‌وارد با موجودی صفر' };
const SET_FA = { A: 'الف', B: 'ب', C: 'ج', D: 'د' };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cell = (v) => {
  const s = v === undefined || v === null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (rows, name) => new Response(`﻿${rows.map((r) => r.map(cell).join(',')).join('\r\n')}\r\n`, {
  headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${name}"`, 'cache-control': 'no-store' },
});

const BASE_COLS = ['sid', 'seq', 'ts', 't', 'type', 'mission', 'screen', 'target', 'x', 'y', 'dead', 'vw', 'vh'];

async function exportEvents(scope, format) {
  const recs = await loadRecords(scope);
  if (format === 'json') {
    return new Response(JSON.stringify(recs), {
      headers: { 'content-type': 'application/json', 'content-disposition': `attachment; filename="milli-test-${scope}.json"`, 'cache-control': 'no-store' },
    });
  }
  const rows = [['code', 'group', 'set', 'persona', 'internal', 'done', 'overQuota', 'time', ...BASE_COLS, 'detail']];
  recs.forEach((r) => (r.events || []).forEach((e) => {
    const detail = { ...e };
    BASE_COLS.forEach((k) => delete detail[k]);
    rows.push([r.code, r.g, r.set, r.persona, r.internal ? 1 : 0, r.done ? 1 : 0, r.overQuota ? 1 : 0,
      e.ts ? new Date(e.ts).toISOString() : '', ...BASE_COLS.map((k) => (k === 'dead' ? (e.dead ? 1 : e.dead === false ? 0 : '') : e[k])),
      Object.keys(detail).length ? detail : '']);
  }));
  return csv(rows, `milli-test-events-${scope}.csv`);
}

async function codeStatus() {
  const [codes, done, started] = await Promise.all([getCodes(true), listAll('done/'), listAll('s/')]);
  const doneSet = new Set(done.map((b) => b.pathname.split('/')[2]?.replace('.json', '')));
  const startedSet = new Set(started.map((b) => b.pathname.slice(2).replace('.json', '')));
  return { codes: codes.codes, doneSet, startedSet };
}

function adminPage({ codes, doneSet, startedSet }, origin, msg = '') {
  const cap = quotas();
  const rows = Object.keys(GROUPS).map((g) => {
    const list = Object.entries(codes).filter(([, c]) => c.g === g).map(([k]) => k);
    const d = list.filter((k) => doneSet.has(k)).length;
    const s = list.filter((k) => startedSet.has(k)).length;
    return `<tr><td>${esc(GROUPS[g])} <small>(${g})</small></td><td>${list.length}</td><td>${s}</td><td>${d}</td><td>${cap[g]}</td><td>${d >= cap[g] ? '<b class="full">بسته</b>' : 'باز'}</td></tr>`;
  }).join('');
  const opts = (o, sel) => Object.entries(o).map(([k, v]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${esc(v)}</option>`).join('');
  return page('مدیریت آزمون', `
<style>.box{max-width:720px;text-align:right}table{width:100%;border-collapse:collapse;font-size:14px;margin:8px 0 24px}
td,th{border-bottom:1px solid #222;padding:10px 6px;text-align:right}th{color:#9a9a9a;font-weight:600}
small{color:#777}.full{color:#ff6b6b}h2{font-size:16px;margin:28px 0 10px;color:#fbb918}
form{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}select,input.n{height:48px;border-radius:12px;border:1px solid #333;background:#141414;color:#fff;font:inherit;padding:0 10px;letter-spacing:0;font-size:15px}
form button{grid-column:1/-1;margin:0}a{color:#fbb918}ul{line-height:2.2;padding-right:18px;font-size:14px}.ok{color:#4ade80}code{direction:ltr;display:inline-block}</style>
<h1>مدیریت آزمون کاربر</h1>
<p>کدها تصادفی و یک‌بارمصرف‌اند؛ پس از پایان کامل، لینک دوباره باز نمی‌شود. مجموعه مأموریت (الف تا د) به نوبت به کدهای هر گروه داده می‌شود.</p>
${msg ? `<p class="ok">${esc(msg)}</p>` : ''}
<h2>وضعیت گروه‌ها</h2>
<table><tr><th>گروه</th><th>کد ساخته‌شده</th><th>شروع‌کرده</th><th>پاسخ کامل</th><th>ظرفیت</th><th>ورود</th></tr>${rows}</table>
<h2>ساخت کد دعوت</h2>
<form method="post" action="/api/admin">
<input type="hidden" name="action" value="codes">
<select name="g" aria-label="گروه">${opts(GROUPS, 'm')}</select>
<input class="n" name="n" type="number" min="1" max="500" value="100" aria-label="تعداد">
<select name="persona" aria-label="کاربر نمونه"><option value="">پیش‌فرض گروه</option>${opts(PERSONA_FA)}</select>
<button type="submit">ساخت و دریافت فایل لینک‌ها</button>
</form>
<p><small>پیش‌فرض کاربر نمونه: میلی گلد «فقط میلی»؛ دو گروه دیگر «چند دارایی». ظرفیت در متغیر محیطی QUOTAS است.</small></p>
<h2>خروجی</h2>
<ul>
<li><a href="/api/admin?action=codes">همه کدها با وضعیت (CSV)</a></li>
<li><a href="/api/admin?action=export&scope=p">رویدادهای شرکت‌کننده‌ها (CSV)</a> · <a href="/api/admin?action=export&scope=p&format=json">JSON</a></li>
<li><a href="/api/admin?action=export&scope=t">رویدادهای آزمایش داخلی (CSV)</a> · <a href="/api/admin?action=export&scope=t&format=json">JSON</a></li>
</ul>
<h2>پاک کردن کد</h2>
<form method="post" action="/api/admin" style="grid-template-columns:1fr">
<input type="hidden" name="action" value="purge">
<input class="n" name="codes" placeholder="کدها، جدا با فاصله یا ویرگول" aria-label="کدها" style="letter-spacing:1px">
<button type="submit" style="background:#333;color:#fff">پاک کردن کد و داده‌اش</button>
</form>
<p><small>برای کدهای آزمایشی تیم؛ کد پاک‌شده دیگر باز نمی‌شود و از سهمیه بیرون می‌رود.</small></p>
<h2>پیش‌نمایش</h2>
<ul>
<li>کاربر نمونه: <a href="/?persona=only">فقط میلی</a> · <a href="/?persona=multi">چند دارایی</a> · <a href="/?persona=new">تازه‌وارد</a></li>
<li><a href="/api/login?logout=1">خروج از حساب تیم</a></li>
<li>حالت آزمون داخلی (داده جدا در t/): <a href="/?test=TEAM01&g=m&set=A&persona=only">نمونه</a> — نشانی: <code>${esc(origin)}/?test=نام&amp;g=m&amp;set=A&amp;persona=only</code></li>
</ul>`);
}

export default {
  async fetch(request) {
    const jar = parseCookies(request.headers.get('cookie'));
    if (!(await verify(jar[ADMIN], 'admin'))) return loginPage('/api/admin');
    const url = new URL(request.url);

    if (request.method === 'POST') {
      const f = await request.formData();
      if (f.get('action') === 'codes') {
        const g = f.get('g');
        const n = Math.min(500, Math.max(1, parseInt(f.get('n'), 10) || 0));
        const persona = PERSONAS.includes(f.get('persona')) ? f.get('persona') : DEFAULT_PERSONA[g];
        if (!GROUPS[g]) return new Response('bad group', { status: 400 });
        const made = await addCodes(g, n, persona);
        const rows = [['code', 'group', 'set', 'set_fa', 'persona', 'link']];
        made.forEach((c) => rows.push([c.code, c.g, c.set, SET_FA[c.set], c.persona, `${url.origin}/?c=${c.code}`]));
        return csv(rows, `milli-invites-${g}-${Date.now()}.csv`);
      }
      if (f.get('action') === 'recount') await recountQuota();
      if (f.get('action') === 'purge') {
        const codes = String(f.get('codes') || '').toUpperCase().split(/[\s,]+/).filter((c) => CODE_RE.test(c));
        for (const c of codes) await purgeCode(c);
        return adminPage(await codeStatus(), url.origin, `${codes.length} کد پاک شد.`);
      }
      return Response.redirect(new URL('/api/admin', request.url), 303);
    }

    const action = url.searchParams.get('action');
    if (action === 'export') {
      const scope = url.searchParams.get('scope') === 't' ? 't' : 'p';
      return exportEvents(scope, url.searchParams.get('format'));
    }
    const st = await codeStatus();
    if (action === 'codes') {
      const rows = [['code', 'group', 'set', 'set_fa', 'persona', 'created', 'started', 'done', 'link']];
      Object.entries(st.codes).forEach(([k, c]) => rows.push([k, c.g, c.set, SET_FA[c.set], c.persona, c.at,
        st.startedSet.has(k) ? 1 : 0, st.doneSet.has(k) ? 1 : 0, `${url.origin}/?c=${k}`]));
      return csv(rows, 'milli-invites-all.csv');
    }
    return adminPage(st, url.origin);
  },
};
