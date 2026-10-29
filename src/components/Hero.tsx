import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Ticket, ArrowDown } from 'lucide-react';

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const Hero: React.FC<{ onNavigateToRsvp: () => void; onOpenCardModal: () => void }> = ({
  onNavigateToRsvp,
  onOpenCardModal,
}) => {
  const WEDDING_DATE = new Date('2027-08-27T14:00:00');

  const calculateTimeLeft = (): CountdownState => {
    const difference = +WEDDING_DATE - +new Date();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState<CountdownState>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="relative pt-12 pb-16 px-6 overflow-hidden">
      {/* Warm ambient festival glow inspired by card */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#d6611e]/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-12 w-[300px] h-[300px] bg-[#cfa052]/10 blur-[110px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Vintage Sunburst Kicker */}
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#d6611e] font-semibold mb-3 px-3.5 py-1 bg-[#26170e]/80 border border-[#54321c] rounded-full">
          <span>Festival of Love</span>
          <span className="text-[#cfa052]" aria-hidden="true">·</span>
          <span>Save the Date</span>
        </div>

        {/* Hero Title Matching Ticket */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wide text-[#f6eedf] uppercase text-balance leading-tight drop-shadow-md">
          Katharina &amp; Ole
        </h1>

        <p className="mt-2 font-editorial text-2xl sm:text-3xl text-[#d6611e] italic tracking-wide">
          Getting Married
        </p>

        {/* Date Ornament matching ticket */}
        <div className="mt-6 inline-flex items-center justify-center gap-4 text-[#cfa052]">
          <div className="h-px w-12 sm:w-24 bg-gradient-to-r from-transparent to-[#cfa052]/60" />
          <div className="flex items-center gap-2.5 text-2xl sm:text-4xl font-display font-bold tracking-widest text-[#f6eedf]">
            <Heart className="w-4 h-4 text-[#cfa052] fill-[#cfa052] inline" />
            <span>27.08.2027</span>
            <Heart className="w-4 h-4 text-[#cfa052] fill-[#cfa052] inline" />
          </div>
          <div className="h-px w-12 sm:w-24 bg-gradient-to-l from-transparent to-[#cfa052]/60" />
        </div>

        <p className="mt-4 font-editorial italic text-[#e7d9c6] text-lg sm:text-xl max-w-xl mx-auto">
          Weitere Infos folgen bald!
        </p>

        <p className="mt-2 text-[#bcaaa0] text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          Haltet euch das Datum frei! Gebt uns bitte kurz Bescheid, ob ihr am Tag unserer Hochzeit mit uns feiert.
        </p>

        {/* Countdown Timer */}
        <div className="mt-10 p-6 sm:p-7 bg-[#1c130d]/90 border border-[#3d2719] rounded-2xl max-w-2xl mx-auto shadow-2xl backdrop-blur-sm">
          <div className="text-xs uppercase tracking-widest text-[#d6611e] font-semibold mb-4">
            Countdown bis zum Hochzeitstag
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            <div className="p-3 bg-[#120b07] border border-[#2d1b11] rounded-xl">
              <span className="block font-display text-3xl sm:text-5xl font-bold text-[#f6eedf] tabular-nums">
                {timeLeft.days}
              </span>
              <span className="text-[11px] sm:text-xs text-[#a18f82] uppercase tracking-wider mt-1 block">
                Tage
              </span>
            </div>
            <div className="p-3 bg-[#120b07] border border-[#2d1b11] rounded-xl">
              <span className="block font-display text-3xl sm:text-5xl font-bold text-[#f6eedf] tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs text-[#a18f82] uppercase tracking-wider mt-1 block">
                Stunden
              </span>
            </div>
            <div className="p-3 bg-[#120b07] border border-[#2d1b11] rounded-xl">
              <span className="block font-display text-3xl sm:text-5xl font-bold text-[#f6eedf] tabular-nums">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs text-[#a18f82] uppercase tracking-wider mt-1 block">
                Minuten
              </span>
            </div>
            <div className="p-3 bg-[#120b07] border border-[#2d1b11] rounded-xl">
              <span className="block font-display text-3xl sm:text-5xl font-bold text-[#f6eedf] tabular-nums">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs text-[#a18f82] uppercase tracking-wider mt-1 block">
                Sekunden
              </span>
            </div>
          </div>
        </div>

        {/* Dual Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onNavigateToRsvp}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#d6611e] hover:bg-[#b84c12] active:bg-[#a0400d] text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-white" />
            <span>Jetzt Rückmeldung geben</span>
          </button>
          <button
            onClick={onOpenCardModal}
            className="w-full sm:w-auto px-7 py-3.5 bg-[#20150e] hover:bg-[#2e1f15] text-[#f6eedf] border border-[#4d301e] font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Ticket className="w-4 h-4 text-[#d6611e]" />
            <span>Karte &amp; QR-Code ansehen / laden</span>
          </button>
        </div>
      </div>
    </section>
  );
};
