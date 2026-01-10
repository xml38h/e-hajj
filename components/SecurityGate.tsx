
import React, { useState } from 'react';
import { TranslationSet } from '../types';

interface SecurityGateProps {
  correctCode: string;
  onSuccess: () => void;
  t: TranslationSet;
  isRtl: boolean;
}

const SecurityGate: React.FC<SecurityGateProps> = ({ correctCode, onSuccess, t, isRtl }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleVerify = () => {
    if (code === correctCode) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className={`max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-100 ${isRtl ? 'rtl' : ''}`}>
      <div className="text-center mb-6">
        <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">{t.enterSecurityCode}</h2>
        <p className="text-sm text-gray-500 mt-2">{t.securityPrompt}</p>
      </div>

      <div className="space-y-4">
        <input
          type="tel"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="● ● ● ●"
          className={`w-full text-center text-3xl tracking-widest py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
            error ? 'border-red-500 animate-shake' : 'border-gray-200'
          }`}
        />
        <button
          onClick={handleVerify}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-lg"
        >
          {t.verify}
        </button>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default SecurityGate;
