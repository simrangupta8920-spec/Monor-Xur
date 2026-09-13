import React, { useState } from 'react';
import { ArrowLeft, Lock, KeyRound, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

interface FamilyLoginProps {
  onSuccess: () => void;
  onBack: () => void;
  patientName: string;
  configuredPin: string;
  onReopenSetup: () => void;
}

export const FamilyLogin: React.FC<FamilyLoginProps> = ({
  onSuccess,
  onBack,
  patientName,
  configuredPin,
  onReopenSetup,
}) => {
  const { tx } = useLanguage();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const targetPin = configuredPin || '1234';

  const handleKeyPress = (num: string) => {
    if (pin.length >= 4) return;
    soundController.playClick();
    setError(false);

    const nextPin = pin + num;
    setPin(nextPin);

    if (nextPin.length === 4) {
      if (nextPin === targetPin) {
        soundController.playSuccess();
        setTimeout(() => {
          onSuccess();
        }, 200);
      } else {
        soundController.playChime(250, 0.4);
        setError(true);
        setTimeout(() => {
          setPin('');
        }, 700);
      }
    }
  };

  const handleDelete = () => {
    soundController.playClick();
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-4 max-w-sm mx-auto animate-fadeIn">
      {/* Back button */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={() => {
            soundController.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-[#5A6E5D] hover:text-[#2D3A2F]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{tx('Back', 'वापस', 'পিছলৈ')}</span>
        </button>

        <span className="text-xs font-extrabold text-[#5B825B] bg-[#EAF1E8] px-2.5 py-1 rounded-full">
          {tx('Family Security', 'पारिवारिक सुरक्षा', 'পৰিয়ালৰ সুৰক্ষা')}
        </span>
      </div>

      <div className="w-full bg-white p-6 rounded-3xl border border-[#E0DCD3] shadow-sm text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center shadow-xs">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-black text-[#2D3A2F]">
            {tx('Caregiver Access', 'देखभालकर्ता प्रवेश', 'সেৱাযত্নকাৰী প্ৰৱেশ')}
          </h2>
          <p className="text-xs text-[#5A6E5D] mt-1">
            {tx(
              `Enter 4-digit security PIN for ${patientName}'s profile`,
              `${patientName} की प्रोफ़ाइल के लिए 4-अंकीय पिन दर्ज करें`,
              `${patientName}ৰ প্ৰ’ফাইলৰ বাবে ৪-অংকৰ পিন দিয়ক`
            )}
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-3 my-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-rose-500 scale-110'
                    : isFilled
                    ? 'bg-[#5B825B] scale-110 shadow-xs'
                    : 'bg-[#EAE6DF]'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-extrabold text-rose-600 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{tx('Incorrect PIN. Please try again.', 'गलत पिन। पुनः प्रयास करें।', 'ভুল পিন। পুনৰ চেষ্টা কৰক।')}</span>
          </p>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-[#FDFBF7] hover:bg-[#F4EFE6] border border-[#E0DCD3] text-xl font-black text-[#2D3A2F] active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPin('')}
            className="h-14 rounded-2xl bg-[#FDFBF7] hover:bg-[#F4EFE6] border border-[#E0DCD3] text-xs font-black text-[#5A6E5D] active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            {tx('Clear', 'साफ़', 'মচক')}
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-[#FDFBF7] hover:bg-[#F4EFE6] border border-[#E0DCD3] text-xl font-black text-[#2D3A2F] active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-[#FDFBF7] hover:bg-[#F4EFE6] border border-[#E0DCD3] text-sm font-black text-[#5A6E5D] active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            ⌫
          </button>
        </div>

        {/* Demo PIN hint & Reopen Setup */}
        <div className="pt-2 border-t border-[#EAE6DF] space-y-1">
          <p className="text-[11px] text-[#5A6E5D]">
            {tx('Default configured PIN: ', 'डिफ़ॉल्ट पिन: ', 'ডিফল্ট পিন: ')}
            <span className="font-mono font-black text-[#2D3A2F]">{targetPin}</span>
          </p>
          <button
            onClick={() => {
              soundController.playClick();
              onReopenSetup();
            }}
            className="text-[11px] text-[#5B825B] font-bold hover:underline"
          >
            {tx('Need to adjust settings? Open Setup', 'सेटिंग्स बदलें? सेटअप खोलें', 'ছেটিংছ সলনি কৰিবনে?')}
          </button>
        </div>
      </div>
    </div>
  );
};
