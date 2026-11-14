// صفحه‌های ساده سرور (رمز ورود و پیام‌ها) با ظاهر تیره موکاپ

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function page(title, body, status = 200) {
  const html = `<!doctype html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>${esc(title)}</title>
<style>
*{box-sizing:border-box}html,body{margin:0;height:100%}
body{background:#000;color:#fff;font-family:Vazirmatn,Tahoma,system-ui,sans-serif;display:grid;place-items:center;padding:24px}
.box{width:100%;max-width:360px;text-align:center}
.logo{width:64px;height:64px;border-radius:20px;background:#fbb918;color:#000;display:grid;place-items:center;font-weight:900;font-size:28px;margin:0 auto 20px}
h1{font-size:20px;margin:0 0 8px}p{color:#9a9a9a;line-height:1.9;font-size:14px;margin:0 0 20px}
input{width:100%;height:56px;border-radius:16px;border:1px solid #333;background:#141414;color:#fff;font-size:24px;text-align:center;letter-spacing:10px;font-family:inherit;outline:none}
input:focus{border-color:#fbb918}
button{width:100%;height:54px;border-radius:16px;border:0;background:#fbb918;color:#000;font-weight:800;font-size:16px;margin-top:12px;font-family:inherit;cursor:pointer}
.err{color:#ff6b6b;font-size:13px;min-height:22px;margin-top:10px}
</style></head><body><main class="box"><div class="logo">م</div>${body}</main></body></html>`;
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow, noarchive' },
  });
}

export function loginPage(next = '/', error = '') {
  return page('ورود', `
<h1>طرح اولیه میلی</h1>
<p>برای دیدن طرح، رمز ورود را بزن.</p>
<form method="post" action="/api/login">
<input type="hidden" name="next" value="${esc(next)}">
<input name="password" type="password" inputmode="numeric" autocomplete="current-password" autofocus required aria-label="رمز ورود">
<button type="submit">ورود</button>
<div class="err">${esc(error)}</div>
</form>`, error ? 403 : 401);
}

export function messagePage(title, text, status = 200) {
  return page(title, `<h1>${esc(title)}</h1><p>${esc(text)}</p>`, status);
}
