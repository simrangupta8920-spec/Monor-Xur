import React, { useState } from 'react';
import { ArrowLeft, Delete, KeyRound, Check } from 'lucide-react';
import { soundController } from '../../utils/audio';

interface FamilyLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

const CORRECT_PIN = '1234';

export const FamilyLogin: React.FC<FamilyLoginProps> = ({ onSuccess, onBack }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleDigit = (digit: string) => {
    soundController.playClick();
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);

      if (nextPin.length === 4) {
        if (nextPin === CORRECT_PIN) {
          soundController.playSuccess();
          setTimeout(() => {
            onSuccess();
          }, 300);
        } else {
          setError('Incorrect PIN. Demo PIN is 1234');
          setTimeout(() => setPin(''), 800);
        }
      }
    }
  };

  const handleDelete = () => {
    soundController.playClick();
    setPin((p) => p.slice(0, -1));
    setError(null);
  };

  return (
    <div className="p-4 pb-24 space-y-6 animate-fadeIn max-w-sm mx-auto text-center">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] hover:bg-[#EAF1E8]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-[#5A6E5D]">Family Caregiver</span>
      </div>

      <div className="space-y-2">
        <div className="w-16 h-16 mx-auto rounded-3xl overflow-hidden border-2 border-[#5B825B]/40 bg-[#FDFBF7] p-1 shadow-xs">
          <img src="/logo.jpg" alt="Monor Xur" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
        </div>
        <h2 className="text-2xl font-black text-[#2D3A2F]">Enter Caregiver PIN</h2>
        <p className="text-xs text-[#5A6E5D]">Secured portal for Anita's family • Demo PIN: 1234</p>
      </div>

      {/* PIN Dots Display */}
      <div className="flex justify-center items-center gap-4 py-3">
        {[0, 1, 2, 3].map((idx) => {
          const filled = pin.length > idx;
          return (
            <div
              key={idx}
              className={`w-5 h-5 rounded-full transition-all duration-200 ${
                filled
                  ? 'bg-[#5B825B] scale-110 shadow-xs'
                  : 'border-2 border-[#C2BDB2] bg-white'
              }`}
            />
          );
        })}
      </div>

      {error && (
        <p className="text-xs font-extrabold text-[#C46A66] animate-shake">{error}</p>
      )}

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="h-16 rounded-3xl bg-white border border-[#E0DCD3] text-2xl font-extrabold text-[#2D3A2F] hover:bg-[#EAF1E8] active:scale-95 shadow-xs transition-all flex items-center justify-center"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => {
            setPin(CORRECT_PIN);
            soundController.playSuccess();
            setTimeout(onSuccess, 300);
          }}
          className="h-16 rounded-3xl bg-[#EAF1E8] text-[#5B825B] text-xs font-black hover:bg-[#d5e6d3] active:scale-95 flex items-center justify-center p-1"
        >
          Quick Demo (1234)
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="h-16 rounded-3xl bg-white border border-[#E0DCD3] text-2xl font-extrabold text-[#2D3A2F] hover:bg-[#EAF1E8] active:scale-95 shadow-xs transition-all flex items-center justify-center"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="h-16 rounded-3xl bg-white border border-[#E0DCD3] text-[#5A6E5D] hover:bg-gray-100 active:scale-95 shadow-xs transition-all flex items-center justify-center"
          aria-label="Delete last digit"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
