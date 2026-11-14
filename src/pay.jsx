import React, { useState } from 'react';
import {
  X, Flashlight, Image, Search, Send as SendIcon, HandCoins, Store, ChevronLeft, Copy, Share2, QrCode, ScanLine,
} from 'lucide-react';
import { useApp, Avatar } from './ui.jsx';
import { contacts } from './data.js';
import { FakeQR } from './flows.jsx';

/* ───────────── پرداخت (دکمه وسط نوار): اسکنر + برگه انتقال ───────────── */
export function PayHub({ mode: init = 'scan' }) {
  const { go, back, toast } = useApp();
  const [mode, setMode] = useState(init);
  return (
    <div className="payhub">
      <div className="ph-cam">
        <div className="ph-head">
          <button className="icon-btn glass" onClick={back} aria-label="بستن"><X size={20} /></button>
          <span className="title">پرداخت</span>
          {mode === 'scan' ? (
            <span className="row gap8">
              <button className="icon-btn glass" aria-label="انتخاب از گالری"><Image size={19} /></button>
              <button className="icon-btn glass" aria-label="چراغ"><Flashlight size={19} /></button>
            </span>
          ) : <span />}
        </div>

        {mode === 'scan' ? (
          <div className="ph-mid">
            <button className="ph-vf" onClick={() => go('pay')} aria-label="اسکن کد پذیرنده">
              <span className="ph-code"><FakeQR abs={false} size="100%" /></span>
              <i /><i /><i /><i /><span className="scanline" />
            </button>
            <span className="h3">کد پذیرنده را اسکن کن</span>
            <button className="ph-near" onClick={() => go('merchants')}>
              <Store size={14} />پذیرنده‌های نزدیک · تا ۳٪ پاداش<ChevronLeft size={14} />
            </button>
          </div>
        ) : (
          <div className="ph-mid">
            <div className="ph-qrcard">
              <span className="ph-qr"><FakeQR seed={23} abs={false} size="100%" /></span>
              <span className="h2">علی رضایی</span>
              <span className="small">با اسکن این کد به تو میلی می‌فرستند</span>
            </div>
            <div className="row gap8">
              <button className="pill glass" onClick={() => toast('پیوند دریافت میلی کپی شد')}><Copy size={15} />کپی پیوند</button>
              <button className="pill glass" onClick={() => toast('کد برای اشتراک آماده شد')}><Share2 size={15} />اشتراک</button>
            </div>
          </div>
        )}

        <div className="segment ph-seg">
          <button className={mode === 'scan' ? 'on' : ''} onClick={() => setMode('scan')}>
            <span className="row gap8" style={{ justifyContent: 'center' }}><ScanLine size={16} />اسکن</span>
          </button>
          <button className={mode === 'qr' ? 'on' : ''} onClick={() => setMode('qr')}>
            <span className="row gap8" style={{ justifyContent: 'center' }}><QrCode size={16} />QR من</span>
          </button>
        </div>
      </div>

      <div className="ph-sheet">
        <span className="ph-grab" />
        <div className="ph-people">
          <button className="col gap8" onClick={() => go('send')}>
            <span className="avatar" style={{ background: 'var(--surface-3)', color: '#fff' }}><Search size={20} /></span>
            <span className="xs muted">جستجو</span>
          </button>
          {contacts.map((c) => (
            <button key={c.id} className="col gap8" onClick={() => go('send', { to: c.id })}>
              <Avatar c={c} />
              <span className="xs">{c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="row" style={{ gap: 10 }}>
          <button className="btn primary" onClick={() => go('send')}><SendIcon size={18} />انتقال</button>
          <button className="btn ghost" onClick={() => go('request')}><HandCoins size={19} />درخواست</button>
        </div>
      </div>
    </div>
  );
}
