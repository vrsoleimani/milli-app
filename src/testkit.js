// لایه آزمون کاربر: فقط با پارامتر نشانی فعال می‌شود و ظاهر موکاپ را عوض نمی‌کند.
//   ?test=CODE&g=m&set=A&persona=only   حالت آزمون (ثبت رفتار و ماندگاری وضعیت)
//   ?persona=only|multi|new             فقط انتخاب کاربر نمونه، بدون ثبت
// رابط برای سشن سوم (پوسته آزمون): window.milliTest یا import { test } from './testkit.js'

const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const PERSONAS = ['only', 'multi', 'new'];
const DEFAULT_PERSONA = { m: 'only', n: 'multi', e: 'multi' };

const code = q.get('test');
const g = q.get('g') || '-';
export const TEST = {
  active: !!code,
  code: code || null,
  g,
  set: q.get('set') || '-',
  persona: PERSONAS.includes(q.get('persona')) ? q.get('persona') : (DEFAULT_PERSONA[g] || 'multi'),
};
// بدون حالت آزمون، کاربر نمونه فقط وقتی عوض می‌شود که پارامتر persona آمده باشد
export const PERSONA = TEST.active ? TEST.persona : (PERSONAS.includes(q.get('persona')) ? q.get('persona') : 'multi');

const LS = (k) => `milli-test-${TEST.code}-${k}`;
const lsGet = (k, d) => { try { const v = localStorage.getItem(LS(k)); return v ? JSON.parse(v) : d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(LS(k), JSON.stringify(v)); } catch { /* ignore */ } };
const lsDel = (k) => { try { localStorage.removeItem(LS(k)); } catch { /* ignore */ } };

// ─── وضعیت ماندگار (ردیف ۱۰): بارگذاری دوباره موجودی را برنمی‌گرداند ───
export function loadSaved() { return TEST.active ? lsGet('state', null) : null; }
let saveTimer;
export function saveState(state, tab, unit) {
  if (!TEST.active) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => lsSet('state', { state, tab, unit, at: Date.now() }), 150);
}

// ─── ثبت رفتار (ردیف ۴) ───
let log = TEST.active ? lsGet('log', null) || { sid: Math.random().toString(36).slice(2, 10), seq: 0, acked: 0, queue: [], mission: null, started: Date.now() } : null;
const persistLog = () => lsSet('log', log);
let curScreen = 'tab:home';
let lastSize = '';

export function track(type, data = {}) {
  if (!TEST.active) return;
  const e = {
    seq: ++log.seq, ts: Date.now(), t: Date.now() - log.started, type,
    mission: log.mission, screen: curScreen, vw: innerWidth, vh: innerHeight, ...data,
  };
  log.queue.push(e);
  if (log.queue.length > 5000) log.queue = log.queue.slice(-5000);
  persistLog();
  return e;
}

let inFlight = null;
const meta = () => ({ g: TEST.g, set: TEST.set, persona: TEST.persona, ua: navigator.userAgent, dpr: devicePixelRatio, lang: navigator.language });

// ارسال رویدادهای فرستاده‌نشده؛ پاسخ موفق، آن‌ها را از صف برمی‌دارد
export async function flush({ keepalive = false, results, complete } = {}) {
  if (!TEST.active) return null;
  if (inFlight && !keepalive) await inFlight.catch(() => {});
  const batch = log.queue.slice(0, keepalive ? 150 : 1000);
  if (!batch.length && !results && !complete) return { ok: true };
  const body = JSON.stringify({ code: TEST.code, sid: log.sid, events: batch, meta: meta(), results, complete });
  const req = fetch('/api/log', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive, credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`log ${r.status}`))))
    .then((res) => {
      log.queue = log.queue.filter((e) => e.seq > res.lastSeq);
      log.acked = res.lastSeq;
      persistLog();
      return res;
    });
  if (!keepalive) inFlight = req;
  const res = await req.catch(() => null);
  if (res && !keepalive && log.queue.length) return flush({ results: undefined }); // صف بلند در چند بسته
  return res;
}

// ─── شنود لمس، لمس بی‌نتیجه و اندازه صفحه ───
function describe(el) {
  const t = el.closest('button, a, input, textarea, select, label, [role="button"], .list-row, [onclick]') || el;
  const text = (t.getAttribute('aria-label') || t.innerText || t.value || '').replace(/\s+/g, ' ').trim().slice(0, 50);
  const cls = typeof t.className === 'string' ? t.className.split(' ')[0] : '';
  return { target: `${t.tagName.toLowerCase()}${cls ? `.${cls}` : ''}${text ? `:${text}` : ''}`, interactive: t !== el || /^(BUTTON|A|INPUT|TEXTAREA|SELECT|LABEL)$/.test(el.tagName) };
}

function onTap(ev) {
  const phone = document.querySelector('.phone.app');
  if (!phone || !phone.contains(ev.target)) return;
  const r = phone.getBoundingClientRect();
  const { target, interactive } = describe(ev.target);
  const e = track('tap', {
    target, interactive,
    x: Math.round(((ev.clientX - r.left) / r.width) * 1000) / 1000,
    y: Math.round(((ev.clientY - r.top) / r.height) * 1000) / 1000,
  });
  // لمس بی‌نتیجه: هیچ تغییری در صفحه تا ۶۰۰ میلی‌ثانیه بعد از لمس
  let changed = false;
  const mo = new MutationObserver(() => { changed = true; });
  mo.observe(phone, { subtree: true, childList: true, attributes: true, characterData: true });
  setTimeout(() => {
    mo.disconnect();
    if (!changed && !/^(input|textarea)/.test(target)) track('dead', { ref: e.seq, target, x: e.x, y: e.y });
  }, 600);
}

function onSize() {
  const s = `${innerWidth}x${innerHeight}`;
  if (s === lastSize) return;
  lastSize = s;
  track('viewport', { w: innerWidth, h: innerHeight, sw: screen.width, sh: screen.height });
}

let started = false;
export function startLogging() {
  if (!TEST.active || started) return;
  started = true;
  track('session', { event: 'load', persona: TEST.persona, set: TEST.set, g: TEST.g, reload: log.seq > 0 });
  onSize();
  document.addEventListener('click', onTap, true);
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(onSize, 400); });
  document.addEventListener('visibilitychange', () => {
    track('visibility', { state: document.visibilityState });
    if (document.visibilityState === 'hidden') flush({ keepalive: true });
  });
  addEventListener('pagehide', () => flush({ keepalive: true }));
  flush(); // رویدادهای مانده از بار قبل
}

// ─── پل با store (صفحه، بازگشت، نتیجه جریان‌ها) ───
let bridge = null;
export function bindStore(b) { bridge = b; }
export function setScreen(id) {
  if (!TEST.active || id === curScreen) return;
  const from = curScreen;
  curScreen = id;
  track('screen', { from });
}

// پارامترهای جریان را کوچک و بی‌تابع نگه می‌دارد
export function slim(p) {
  const out = {};
  Object.entries(p || {}).forEach(([k, v]) => {
    if (typeof v === 'function') return;
    if (v && typeof v === 'object') { out[k] = JSON.stringify(v).slice(0, 200); return; }
    out[k] = typeof v === 'string' ? v.slice(0, 80) : v;
  });
  return out;
}

// ─── رابط سشن سوم ───
export const test = {
  ...TEST,
  track,
  flush,
  // شروع مأموریت: وضعیت به حالت اول کاربر نمونه برمی‌گردد (ردیف ۱۰)
  startMission(id) {
    if (!TEST.active) return;
    bridge?.reset();
    log.mission = id;
    persistLog();
    track('mission', { event: 'start', id });
  },
  endMission(result = {}) {
    if (!TEST.active) return;
    track('mission', { event: 'end', id: log.mission, ...result });
    log.mission = null;
    persistLog();
    return flush();
  },
  get mission() { return log?.mission ?? null; },
  saveResults(results) { return flush({ results }); },
  // پایان کامل: کد بسته و در سهمیه شمرده می‌شود
  complete(results) { track('session', { event: 'complete' }); return flush({ results, complete: true }); },
  reset() { bridge?.reset(); },
  // پاک کردن همه داده محلی این کد (فقط برای آزمایش داخلی)
  clearLocal() { lsDel('state'); lsDel('log'); },
};
if (typeof window !== 'undefined') window.milliTest = test;
