import React from 'react';
import { Heart, Lock, ShieldCheck, Ticket } from 'lucide-react';

interface FooterProps {
  onNavigate?: (sectionId: string) => void;
  onOpenCardModal: () => void;
  isCoupleLoggedIn: boolean;
  onOpenCoupleAuth: () => void;
  onOpenCoupleDashboard: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCardModal,
  isCoupleLoggedIn,
  onOpenCoupleAuth,
  onOpenCoupleDashboard,
}) => {
  return (
    <footer className="py-8 sm:py-12 px-4 sm:px-6 bg-[#f7ebd9] border-t border-[#ebd5be] text-[#6b5847] text-xs">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-center md:text-left">
        <div>
          <div className="font-display text-sm font-bold text-[#261c14] tracking-wider uppercase">
            Festival of Love · Katharina &amp; Ole
          </div>
          <p className="text-[#786757] text-[11px] mt-1">
            Freitag, 27. August 2027 · Save the Date &amp; Rückmeldung
          </p>
        </div>

        {/* Center / Action Buttons in Footer */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 w-full md:w-auto">
          {/* Button: Karte und QR Code ansehen */}
          <button
            onClick={onOpenCardModal}
            className="px-3.5 sm:px-4 py-2.5 min-h-[44px] bg-[#ffffff] hover:bg-[#fff9f0] text-[#261c14] border border-[#e2cca9] hover:border-[#d7541d] rounded-xl transition-all cursor-pointer font-bold text-xs flex items-center justify-center gap-2 shadow-xs group"
          >
            <Ticket className="w-4 h-4 text-[#d7541d] group-hover:scale-110 transition-transform shrink-0" />
            <span>Karte und QR Code ansehen</span>
          </button>

          {/* Discreet Couple Access */}
          {isCoupleLoggedIn ? (
            <button
              onClick={onOpenCoupleDashboard}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] bg-[#d7541d] text-white rounded-xl font-bold hover:bg-[#b84112] transition-colors cursor-pointer shadow-xs"
              title="Alle Rückmeldungen öffnen"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Brautpaar-Übersicht</span>
            </button>
          ) : (
            <button
              onClick={onOpenCoupleAuth}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-[#786757] hover:text-[#d7541d] hover:bg-[#faebd7] rounded-xl transition-colors cursor-pointer"
              title="Nur für Katharina & Ole"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Brautpaar-Login</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[#786757]">
          <span>Mit</span>
          <Heart className="w-3.5 h-3.5 text-[#cf3464] fill-[#cf3464] inline" />
          <span>für Katharina &amp; Ole gestaltet</span>
        </div>
      </div>
    </footer>
  );
};
