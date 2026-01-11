import QRCode from 'qrcode';
import { useEffect, useMemo, useState } from 'react';

import React from 'react';
import { TranslationSet } from '../types';

interface QrModalProps {
  shareUrl: string;
  onClose: () => void;
  t: TranslationSet;
  isRtl: boolean;
}

const QrModal: React.FC<QrModalProps> = ({ shareUrl, onClose, t, isRtl }) => {
  // استخدام رابط الموقع الحالي لجعله يعمل عند المسح
  const qrValue = shareUrl;
  const qrUrl = qrValue; // نفس الرابط للـ QR
  const currentUrl = qrValue;

  const [qrImage, setQrImage] = useState<string>('');
  const [qrFailed, setQrFailed] = useState(false);

  // ✅ Fallback QR image (إذا مكتبة qrcode لخبطت على جهاز معيّن)
  const fallbackQrImg = useMemo(() => {
    // خدمة توليد QR كصورة PNG
    // (استخدمنا encodeURIComponent عشان الروابط الطويلة)
    const encoded = encodeURIComponent(qrUrl || '');
    return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&margin=10&data=${encoded}`;
  }, [qrUrl]);

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      try {
        setQrFailed(false);

        // ✅ حماية إضافية: لو الرابط فاضي أو قصير جدًا
        if (!qrUrl || String(qrUrl).trim().length < 5) {
          setQrFailed(true);
          return;
        }
useEffect(() => {
  console.log('QR URL:', qrUrl); // ✅ شوف الرابط كامل في الكونسل
  QRCode.toDataURL(qrUrl, { width: 256, margin: 2 })
    .then(setQrImage)
    .catch(console.error);
}, [qrUrl]);

        // ✅ توليد QR كـ DataURL
        const dataUrl = await QRCode.toDataURL(qrUrl, {
          width: 256,
          margin: 2,
          errorCorrectionLevel: 'M',
        });

        if (!cancelled) {
          setQrImage(dataUrl);
          setQrFailed(false);
        }
      } catch (e) {
        console.error('QR generation failed:', e);
        if (!cancelled) {
          setQrFailed(true);
        }
      }
    };

    generate();

    return () => {
      cancelled = true;
    };
  }, [qrUrl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    alert('Link Copied!');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className={`bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all scale-100 ${
          isRtl ? 'rtl' : ''
        }`}
      >
        <div className="p-8 text-center">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">{t.shareProfile}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-white p-4 rounded-3xl inline-block mb-6 border-2 border-emerald-50 shadow-inner">
            {/* ✅ لو نجح التوليد نعرض dataURL، ولو فشل نعرض fallback */}
            <img
              src={qrFailed ? fallbackQrImg : qrImage}
              alt="QR Code"
              className="w-56 h-56 mx-auto"
              onError={() => {
                // ✅ لو حتى الصورة فشلت (نادر) لا نطيّح الصفحة
                setQrFailed(true);
              }}
            />
          </div>

          <p className="text-sm text-gray-500 mb-6 leading-relaxed">{t.scanInstructions}</p>

          <div
            onClick={copyToClipboard}
            className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between mb-8 cursor-pointer hover:bg-gray-100 transition-all overflow-hidden"
          >
            <span className="text-xs text-emerald-800 font-mono truncate mr-2">{currentUrl}</span>
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrModal;
