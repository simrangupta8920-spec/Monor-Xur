import React, { useState } from 'react';
import { ArrowLeft, Stethoscope, ShieldCheck } from 'lucide-react';
import { soundController } from '../../utils/audio';

interface AshaLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const AshaLogin: React.FC<AshaLoginProps> = ({ onSuccess, onBack }) => {
  const [workerId, setWorkerId] = useState('ASHA001');
  const [password, setPassword] = useState('asha123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundController.playClick();
    if (
      (workerId.trim().toUpperCase() === 'ASHA001' && password === 'asha123') ||
      (workerId.includes('@') && password.length >= 6)
    ) {
      soundController.playSuccess();
      onSuccess();
    } else {
      setError('Invalid credentials. Use demo: ID ASHA001 / Pass asha123');
    }
  };

  return (
    <div className="p-4 pb-24 space-y-6 animate-fadeIn max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] hover:bg-[#EAF1E8]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-[#5A6E5D]">ASHA Health Worker</span>
      </div>

      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-3xl overflow-hidden border-2 border-[#E8B25C]/40 bg-[#FDF0D5] p-1 shadow-xs">
          <img src="/logo.jpg" alt="Monor Xur" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
        </div>
        <h2 className="text-2xl font-black text-[#2D3A2F]">Health Worker Login</h2>
        <p className="text-xs text-[#5A6E5D]">Access clinical reports and community player engagement</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-3xl border border-[#E0DCD3] shadow-xs">
        <div>
          <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
            ASHA Worker ID / Email
          </label>
          <input
            type="text"
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-[#E0DCD3] text-sm font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
            placeholder="e.g. ASHA001"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-[#2D3A2F] mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-[#E0DCD3] text-sm font-bold text-[#2D3A2F] focus:outline-hidden focus:border-[#5B825B]"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-xs font-extrabold text-[#C46A66]">{error}</p>}

        <button
          type="submit"
          className="w-full py-3.5 px-4 rounded-2xl bg-[#5B825B] text-white font-extrabold text-sm hover:bg-[#4c704c] shadow-xs active:scale-95 transition-all"
        >
          Sign In to Portal
        </button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setWorkerId('ASHA001');
              setPassword('asha123');
              soundController.playSuccess();
              onSuccess();
            }}
            className="text-xs font-extrabold text-[#5B825B] hover:underline"
          >
            Quick Sign In with Demo Account (ASHA001)
          </button>
        </div>
      </form>
    </div>
  );
};
