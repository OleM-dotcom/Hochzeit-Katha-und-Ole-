import React, { useState, useEffect } from 'react';
import { Calendar, Heart } from 'lucide-react';

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const Hero: React.FC<{ onNavigateToRsvp: () => void; onOpenCardModal: () => void }> = ({
  onNavigateToRsvp,
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
    <section id="hero" className="relative pt-8 sm:pt-12 pb-12 sm:pb-16 px-3.5 sm:px-6 overflow-hidden">
      {/* Cheerful summer lighting glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-[#df931d]/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#dc6b6b]/18 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-5 left-10 w-[350px] h-[350px] bg-[#cf3464]/12 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Summer Floral Kicker */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#d7541d] font-bold mb-3 px-3.5 py-1.5 bg-[#fae8d0]/90 border border-[#e4ccab] rounded-full shadow-xs">
          <span>Festival of Love</span>
          <span className="text-[#cf3464]" aria-hidden="true">·</span>
          <span>Save the Date</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-normal sm:tracking-wide text-[#26201a] uppercase text-balance leading-tight drop-shadow-xs">
          Katharina &amp; Ole
        </h1>

        <p className="mt-1.5 sm:mt-2 font-editorial text-xl sm:text-3xl text-[#d7541d] italic tracking-wide font-medium">
          Getting Married
        </p>

        {/* Date Ornament matching bouquet and card */}
        <div className="mt-4 sm:mt-6 inline-flex items-center justify-center gap-2 sm:gap-4 text-[#df931d]">
          <div className="h-px w-6 sm:w-20 bg-gradient-to-r from-transparent to-[#df931d]" />
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-xl sm:text-3xl md:text-4xl font-display font-bold tracking-wider sm:tracking-widest text-[#26201a]">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#cf3464] fill-[#cf3464] inline shrink-0" />
            <span className="tabular-nums">27.08.2027</span>
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#cf3464] fill-[#cf3464] inline shrink-0" />
          </div>
          <div className="h-px w-6 sm:w-20 bg-gradient-to-l from-transparent to-[#df931d]" />
        </div>

        <p className="mt-3.5 sm:mt-4 font-editorial italic text-[#92092f] text-base sm:text-xl max-w-xl mx-auto font-medium">
          Weitere Infos folgen bald!
        </p>

        <p className="mt-1.5 sm:mt-2 text-[#5c4e42] text-xs sm:text-base max-w-lg mx-auto leading-relaxed px-2">
          Haltet euch diesen sonnigen Tag frei! Gebt uns bitte kurz Bescheid, ob ihr am Tag unserer Hochzeit mit uns feiert.
        </p>

        {/* Countdown Timer in bright, joyful summer card */}
        <div className="mt-7 sm:mt-10 p-3.5 sm:p-7 bg-[#ffffff]/90 border border-[#ecdcc9] rounded-2xl sm:rounded-3xl max-w-2xl mx-auto summer-card-shadow backdrop-blur-sm">
          <div className="text-[10px] sm:text-xs uppercase tracking-widest text-[#d7541d] font-bold mb-3 sm:mb-4">
            Countdown bis zum Hochzeitstag
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-4 text-center">
            <div className="p-2 sm:p-3.5 bg-[#fdf8f0] border border-[#f0dfcc] rounded-xl sm:rounded-2xl">
              <span className="block font-display text-2xl sm:text-4xl md:text-5xl font-bold text-[#d7541d] tabular-nums leading-none">
                {timeLeft.days}
              </span>
              <span className="text-[10px] sm:text-xs text-[#858e7f] uppercase tracking-wider mt-1.5 block font-semibold">
                Tage
              </span>
            </div>
            <div className="p-2 sm:p-3.5 bg-[#fdf8f0] border border-[#f0dfcc] rounded-xl sm:rounded-2xl">
              <span className="block font-display text-2xl sm:text-4xl md:text-5xl font-bold text-[#d7541d] tabular-nums leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-[#858e7f] uppercase tracking-wider mt-1.5 block font-semibold">
                Stunden
              </span>
            </div>
            <div className="p-2 sm:p-3.5 bg-[#fdf8f0] border border-[#f0dfcc] rounded-xl sm:rounded-2xl">
              <span className="block font-display text-2xl sm:text-4xl md:text-5xl font-bold text-[#d7541d] tabular-nums leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-[#858e7f] uppercase tracking-wider mt-1.5 block font-semibold">
                Minuten
              </span>
            </div>
            <div className="p-2 sm:p-3.5 bg-[#fdf8f0] border border-[#f0dfcc] rounded-xl sm:rounded-2xl">
              <span className="block font-display text-2xl sm:text-4xl md:text-5xl font-bold text-[#d7541d] tabular-nums leading-none">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-[#858e7f] uppercase tracking-wider mt-1.5 block font-semibold">
                Sekunden
              </span>
            </div>
          </div>
        </div>

        {/* Centered Action Button */}
        <div className="mt-7 sm:mt-8 flex justify-center">
          <button
            onClick={onNavigateToRsvp}
            className="w-full sm:w-auto min-h-[48px] px-8 sm:px-10 py-3.5 sm:py-4 bg-[#d7541d] hover:bg-[#b84112] active:bg-[#9c360e] text-white font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl sm:rounded-2xl shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-2.5 cursor-pointer text-center"
          >
            <Calendar className="w-4 h-4 text-white" />
            <span>Jetzt Rückmeldung geben</span>
          </button>
        </div>
      </div>
    </section>
  );
};
