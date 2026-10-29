import React from 'react';
import { Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenCardModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenCardModal }) => {
  const scrollTo = (id: string) => {
    onNavigate(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="py-12 px-6 bg-[#0e0906] border-t border-[#2d1b11] text-[#8a7667] text-xs">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="font-display text-sm font-bold text-[#f6eedf] tracking-wider">
            FESTIVAL OF LOVE · KATHARINA &amp; OLE
          </div>
          <p className="text-[#735e4d] text-[11px] mt-1">
            27. August 2027 · Save the Date &amp; Rückmeldung
          </p>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => scrollTo('hero')}
            className="hover:text-[#f6eedf] transition-colors cursor-pointer"
          >
            Nach oben
          </button>
          <button
            onClick={() => scrollTo('rsvp-form')}
            className="hover:text-[#f6eedf] transition-colors cursor-pointer"
          >
            Rückmeldung
          </button>
          <button
            onClick={() => scrollTo('couple-admin')}
            className="hover:text-[#f6eedf] transition-colors cursor-pointer"
          >
            Gästeliste
          </button>
          <button
            onClick={onOpenCardModal}
            className="hover:text-[#d6611e] transition-colors cursor-pointer font-medium text-[#c5b19e]"
          >
            Karte &amp; QR herunterladen
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[#8a7667]">
          <span>Mit</span>
          <Heart className="w-3.5 h-3.5 text-[#d6611e] fill-[#d6611e] inline" />
          <span>für Katharina &amp; Ole gestaltet</span>
        </div>
      </div>
    </footer>
  );
};
