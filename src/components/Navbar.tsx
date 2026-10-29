import React from 'react';
import { CalendarHeart } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
  onOpenCardModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeSection, onOpenCardModal }) => {
  const scrollTo = (id: string) => {
    onNavigate(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#160f0a]/95 backdrop-blur-md border-b border-[#3d2719]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element brand wordmark */}
        <button
          onClick={() => scrollTo('hero')}
          className="text-left group cursor-pointer focus:outline-none shrink-0"
        >
          <span className="font-display text-lg sm:text-xl font-bold tracking-wider text-[#f6eedf] group-hover:text-[#d6611e] transition-colors whitespace-nowrap">
            FESTIVAL OF LOVE
          </span>
          <span className="hidden sm:inline text-xs tracking-widest text-[#d6611e] ml-2 uppercase font-medium">
            · Katharina &amp; Ole
          </span>
        </button>

        {/* Zone 2: Navigation links (only Rückmeldung and Gästeliste & Admin) */}
        <nav className="flex items-center gap-6 sm:gap-8 text-sm font-medium text-[#cbb59f]">
          <button
            onClick={() => scrollTo('rsvp-form')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-[#f6eedf] ${
              activeSection === 'rsvp-form' ? 'text-[#d6611e] font-semibold' : ''
            }`}
          >
            Rückmeldung
          </button>
          <button
            onClick={() => scrollTo('couple-admin')}
            className={`transition-colors whitespace-nowrap cursor-pointer hover:text-[#f6eedf] ${
              activeSection === 'couple-admin' ? 'text-[#d6611e] font-semibold' : ''
            }`}
          >
            Gästeliste &amp; Admin
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCardModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#f6eedf] bg-[#2a1b12] hover:bg-[#382418] border border-[#523320] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="Save the Date Karte mit QR-Code herunterladen"
          >
            <span>Karte &amp; QR herunterladen</span>
          </button>
          <button
            onClick={() => scrollTo('rsvp-form')}
            className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-bold text-white bg-[#d6611e] hover:bg-[#b84c12] active:bg-[#a0400d] rounded-lg shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <CalendarHeart className="w-4 h-4 text-white" />
            <span>Jetzt Zusagen</span>
          </button>
        </div>
      </div>
    </header>
  );
};
