import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Music, Check, X, Users, Send, TicketCheck, Sparkles } from 'lucide-react';
import { saveRsvpEntry } from '../services/storage';
import { RsvpEntry } from '../types';

interface RsvpFormProps {
  onEntryAdded: () => void;
}

export const RsvpForm: React.FC<RsvpFormProps> = ({ onEntryAdded }) => {
  const [attending, setAttending] = useState<boolean | null>(true);
  const [names, setNames] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [songRequest, setSongRequest] = useState<string>('');

  const [submittedEntry, setSubmittedEntry] = useState<RsvpEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!names.trim()) {
      setErrorMsg('Bitte gib deinen Namen bzw. eure Namen ein.');
      return;
    }

    if (attending === null) {
      setErrorMsg('Bitte wähle aus, ob du/ihr zur Hochzeit kommen könnt.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newEntry = saveRsvpEntry({
        names: names.trim(),
        attending: attending,
        guestCount: attending ? guestCount : 0,
        songRequest: attending ? songRequest.trim() : '',
      });

      if (attending) {
        confetti({
          particleCount: 120,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#d6611e', '#cfa052', '#f6eedf', '#b84c12', '#ffffff'],
        });
      }

      setSubmittedEntry(newEntry);
      onEntryAdded();
    } catch (err) {
      console.error(err);
      setErrorMsg('Es gab ein Problem beim Speichern. Bitte versuche es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedEntry(null);
    setNames('');
    setSongRequest('');
    setAttending(true);
    setGuestCount(2);
  };

  return (
    <section id="rsvp-form" className="py-16 px-4 sm:px-6 relative">
      <div className="max-w-2xl mx-auto">
        {/* Section Header styled in ticket colors */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#d6611e] font-semibold mb-2">
            <Heart className="w-4 h-4 text-[#d6611e] fill-[#d6611e]" />
            <span>Gebt uns Bescheid</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#f6eedf] tracking-wide uppercase">
            Rückmeldung zur Hochzeit
          </h2>
          <p className="mt-2 text-[#cbb59f] text-sm sm:text-base leading-relaxed">
            Lasst Katharina &amp; Ole wissen, ob ihr am <strong>27. August 2027</strong> beim Festival of Love dabei seid.
          </p>
        </div>

        {submittedEntry ? (
          /* Confirmation Ticket Card styled like the Save the Date Card */
          <div className="bg-[#f6eedf] text-[#1a130f] rounded-3xl p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden border-4 border-[#d6611e]/30 ticket-drop-shadow">
            {/* Top orange ticket band */}
            <div className="absolute top-0 left-0 w-full h-3 bg-[#d6611e]" />

            <div className="w-16 h-16 rounded-full bg-[#d6611e]/15 border-2 border-[#d6611e] text-[#d6611e] flex items-center justify-center mx-auto mb-5 mt-2">
              <TicketCheck className="w-8 h-8" />
            </div>

            <div className="text-xs uppercase tracking-[0.2em] text-[#d6611e] font-bold">
              Festival of Love · 27.08.2027
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1a130f] uppercase tracking-wide mt-1">
              {submittedEntry.attending ? 'Festival-Ticket Gesichert!' : 'Rückmeldung erhalten'}
            </h3>

            <p className="mt-4 text-[#4a3b30] text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              {submittedEntry.attending ? (
                <>
                  Vielen Dank, <strong className="text-[#1a130f]">{submittedEntry.names}</strong>!
                  Wir haben deine Zusage für{' '}
                  <strong className="text-[#d6611e] font-bold">{submittedEntry.guestCount} Person(en)</strong> eingetragen.
                  Wir freuen uns riesig darauf, am 27.08.2027 mit euch zu feiern! 🥂🎸
                </>
              ) : (
                <>
                  Danke für deine Rückmeldung, <strong className="text-[#1a130f]">{submittedEntry.names}</strong>.
                  Schade, dass du nicht dabei sein kannst – wir trinken ein Glas auf dich! 💛
                </>
              )}
            </p>

            {/* Ticket Summary Stub */}
            <div className="mt-6 p-5 bg-[#eee3d1] border border-dashed border-[#b39e88] rounded-2xl text-left max-w-md mx-auto text-xs space-y-2 text-[#3b2e24]">
              <div className="flex justify-between pb-2 border-b border-[#ddcdb8]">
                <span className="text-[#735e4d]">Gäste:</span>
                <span className="font-bold text-[#1a130f]">{submittedEntry.names}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#ddcdb8]">
                <span className="text-[#735e4d]">Datum:</span>
                <span className="font-semibold text-[#1a130f]">Freitag, 27. August 2027</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#ddcdb8]">
                <span className="text-[#735e4d]">Status:</span>
                <span className={submittedEntry.attending ? 'text-[#b84c12] font-bold' : 'text-[#735e4d] font-bold'}>
                  {submittedEntry.attending ? `✓ Zusage (${submittedEntry.guestCount} Pers.)` : '✗ Leider verhindert'}
                </span>
              </div>
              {submittedEntry.attending && submittedEntry.songRequest && (
                <div className="flex justify-between pt-1">
                  <span className="text-[#735e4d]">Wunsch-Song:</span>
                  <span className="text-[#1a130f] font-semibold italic">{submittedEntry.songRequest}</span>
                </div>
              )}
            </div>

            <div className="mt-7 flex justify-center">
              <button
                onClick={handleResetForm}
                className="px-6 py-2.5 bg-[#2b1f17] hover:bg-[#1a130f] text-[#f6eedf] font-medium text-xs rounded-xl transition-colors cursor-pointer"
              >
                Weitere Rückmeldung erfassen
              </button>
            </div>
          </div>
        ) : (
          /* Form Container with Parchment Texture & Ticket Border */
          <form
            onSubmit={handleSubmit}
            className="bg-[#f6eedf] text-[#1a130f] rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-[#d6611e]/30 relative overflow-hidden ticket-drop-shadow space-y-7"
          >
            {/* Top orange ticket band */}
            <div className="absolute top-0 left-0 w-full h-2.5 bg-[#d6611e]" />

            {errorMsg && (
              <div className="p-3.5 bg-red-100 border border-red-300 rounded-xl text-red-800 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* 1. Attendance Toggle */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#b84c12] font-bold mb-3">
                1. Bist du am 27.08.2027 dabei? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setAttending(true)}
                  className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                    attending === true
                      ? 'bg-[#edd9c5] border-[#d6611e] text-[#1a130f] ring-2 ring-[#d6611e]/30'
                      : 'bg-[#eee3d1]/70 border-[#dac8b1] text-[#6b584b] hover:border-[#c59c77]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      attending === true ? 'bg-[#d6611e] text-white' : 'bg-[#dac8b1] text-[#6b584b]'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <span className="block font-bold text-sm sm:text-base text-[#1a130f]">
                      Ja, ich bin / wir sind dabei! 🎉
                    </span>
                    <span className="block text-xs text-[#735e4d] mt-0.5">
                      Festival-Ticket gebucht!
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAttending(false)}
                  className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                    attending === false
                      ? 'bg-[#dfd4c5] border-[#8a7263] text-[#1a130f] ring-2 ring-[#8a7263]/30'
                      : 'bg-[#eee3d1]/70 border-[#dac8b1] text-[#6b584b] hover:border-[#c59c77]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      attending === false ? 'bg-[#735e4d] text-white' : 'bg-[#dac8b1] text-[#6b584b]'
                    }`}
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div>
                    <span className="block font-bold text-sm sm:text-base text-[#1a130f]">
                      Kann leider nicht kommen 💔
                    </span>
                    <span className="block text-xs text-[#735e4d] mt-0.5">
                      Wir sind leider verhindert.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Names Input */}
            <div>
              <label htmlFor="guest-names" className="block text-xs uppercase tracking-wider text-[#b84c12] font-bold mb-2">
                2. Dein Name / Eure Namen *
              </label>
              <input
                id="guest-names"
                type="text"
                required
                value={names}
                onChange={(e) => setNames(e.target.value)}
                placeholder="z.B. Katharina &amp; Ole oder Lisa Müller"
                className="w-full px-4 py-3 bg-[#ffffff] border-2 border-[#d9c7af] focus:border-[#d6611e] rounded-xl text-[#1a130f] placeholder-[#a69280] focus:outline-none text-sm transition-colors shadow-inner"
              />
            </div>

            {/* 3. If Attending: Guest Count & Song Request */}
            {attending && (
              <>
                {/* Guest Count */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#b84c12] font-bold mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#d6611e]" />
                    <span>3. Personenanzahl</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setGuestCount(count)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                          guestCount === count
                            ? 'bg-[#d6611e] text-white shadow-md'
                            : 'bg-[#eee3d1] text-[#4a392c] border border-[#d9c7af] hover:border-[#d6611e]'
                        }`}
                      >
                        {count}{count === 5 ? '+' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Song Request */}
                <div>
                  <label htmlFor="song-request" className="block text-xs uppercase tracking-wider text-[#b84c12] font-bold mb-2 flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-[#d6611e]" />
                    <span>4. Festival-Songwunsch für die Tanzfläche</span>
                  </label>
                  <p className="text-xs text-[#735e4d] mb-2">
                    Welcher Track bringt dich garantiert zum Tanzen oder Feiern?
                  </p>
                  <input
                    id="song-request"
                    type="text"
                    value={songRequest}
                    onChange={(e) => setSongRequest(e.target.value)}
                    placeholder="z.B. Kings of Leon – Sex on Fire oder Daft Punk – One More Time"
                    className="w-full px-4 py-3 bg-[#ffffff] border-2 border-[#d9c7af] focus:border-[#d6611e] rounded-xl text-[#1a130f] placeholder-[#a69280] focus:outline-none text-sm transition-colors shadow-inner"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-[#d6611e] hover:bg-[#b84c12] active:bg-[#a0400d] text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <span>Wird übermittelt...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>Rückmeldung jetzt absenden</span>
                  <Sparkles className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
