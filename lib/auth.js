// امضا و بررسی کوکی‌های ورود (کار در میان‌افزار لبه و تابع‌های Node)
// رمز و کلید امضا فقط در متغیرهای محیطی Vercel است: TEST_PASSWORD و SESSION_SECRET

export const ADMIN = 'mt_a'; // کوکی ورود با رمز (تیم)
export const PART = 'mt_p'; // کوکی شرکت‌کننده (ورود با کد دعوت)

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64u(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function unb64u(str) {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

let keyPromise;
function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  keyPromise ||= crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  return keyPromise;
}

// توکن: بدنه JSON + امضای HMAC؛ r نقش است (admin یا p)
export async function sign(payload, ttlSec) {
  const body = b64u(enc.encode(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec })));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await key(), enc.encode(body)));
  return `${body}.${b64u(sig)}`;
}

export async function verify(token, role) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  try {
    const ok = await crypto.subtle.verify('HMAC', await key(), unb64u(sig), enc.encode(body));
    if (!ok) return null;
    const p = JSON.parse(dec.decode(unb64u(body)));
    if (!p.exp || p.exp < Date.now() / 1000) return null;
    if (role && p.r !== role) return null;
    return p;
  } catch {
    return null;
  }
}

export function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

export function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

// مقایسه با زمان ثابت
export function sameText(a, b) {
  a = String(a ?? '');
  b = String(b ?? '');
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

// نشانی آزمون شرکت‌کننده؛ لایه آزمون فقط با همین پارامترها فعال می‌شود
export function testUrl(p) {
  const q = new URLSearchParams({ test: p.code, g: p.g, set: p.set, persona: p.persona });
  return `/?${q}`;
}

export const ADMIN_TTL = 30 * 24 * 3600;
export const PART_TTL = 3 * 24 * 3600;
