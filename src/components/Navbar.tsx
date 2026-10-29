import React from 'react';
import { Heart } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (sectionId: string) => void;
  activeSection?: string;
  onOpenCardModal?: () => void;
  isCoupleLoggedIn?: boolean;
  onOpenCoupleView?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    if (onNavigate) {
      onNavigate('hero');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fffcf7]/95 backdrop-blur-md border-b border-[#ebdcca] shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-center">
        <button
          onClick={scrollToTop}
          className="group text-center cursor-pointer focus:outline-none transition-all py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 sm:gap-2.5 min-h-[44px]"
          title="Festival of Love · Katharina & Ole"
        >
          <div className="w-7 h-7 rounded-full bg-[#d7541d]/15 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 text-[#d7541d] fill-[#d7541d]" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-1.5 sm:gap-x-2 text-center">
            <span className="font-display text-sm sm:text-lg font-bold tracking-wider text-[#d7541d] group-hover:text-[#b84112] uppercase leading-tight whitespace-nowrap">
              Festival of Love
            </span>
            <span className="text-[11px] sm:text-sm tracking-widest text-[#92092f] uppercase font-semibold whitespace-nowrap">
              · Katharina &amp; Ole
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
