import React, { useState } from 'react';
import { Lock, KeyRound, Heart, X, CheckCircle2 } from 'lucide-react';

interface BrautpaarAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BrautpaarAuthModal: React.FC<BrautpaarAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().toLowerCase();
    // Accept the wedding date "2708", "27.08.2027", "2027", or password "festival"
    if (cleanPin === '2708' || cleanPin === '27.08.2027' || cleanPin === '27082027' || cleanPin === 'festival' || cleanPin === 'ole' || cleanPin === 'katharina') {
      setError(false);
      localStorage.setItem('brautpaar_authenticated', 'true');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] border-2 border-[#eedcc8] rounded-3xl max-w-md w-full p-6 text-[#261c14] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#faebd7] hover:bg-[#f0d8bd] text-[#786757] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#faebd7] text-[#d7541d] flex items-center justify-center mx-auto mb-3 border border-[#f0d4b4]">
            <Lock className="w-6 h-6 text-[#d7541d]" />
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#d7541d] font-bold mb-1 px-3 py-0.5 bg-[#faebd7] border border-[#f0d4b4] rounded-full">
            <Heart className="w-3.5 h-3.5 text-[#cf3464] fill-[#cf3464]" />
            <span>Geschützter Bereich</span>
          </div>

          <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-[#261c14] mt-1">
            Brautpaar-Bereich
          </h3>
          <p className="text-xs text-[#665444] mt-1.5 leading-relaxed">
            Nur für <strong>Katharina &amp; Ole</strong> sichtbar. Hier werden alle Rückmeldungen und Songwünsche eurer Gäste gebündelt dargestellt.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#665444] uppercase tracking-wider mb-1.5">
              Brautpaar-PIN eingeben:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#786757] absolute left-3.5 top-3" />
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                placeholder="PIN eingeben"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-[#fffaf2] border ${
                  error ? 'border-red-400 focus:border-red-500' : 'border-[#d9c7af] focus:border-[#d7541d]'
                } rounded-xl text-[#261c14] font-mono text-base sm:text-sm focus:outline-none`}
              />
            </div>
            {error && (
              <p className="text-[11px] text-red-600 mt-1.5 font-medium">
                Der PIN ist nicht korrekt. Bitte erneut versuchen.
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[44px] py-2.5 px-4 bg-[#d7541d] hover:bg-[#b84112] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Übersicht öffnen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
