import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Music, Check, X, Users, Send, TicketCheck, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { 
  saveRsvpEntry, updateRsvpEntry, isSongAlreadyInPlaylist, 
  areSongsEquivalent 
} from '../services/storage';
import { RsvpEntry } from '../types';
import { searchSpotifyTracks, SpotifyTrack } from '../services/spotify';

interface RsvpFormProps {
  onEntryAdded: () => void;
}

export const RsvpForm: React.FC<RsvpFormProps> = ({ onEntryAdded }) => {
  // Main RSVP State (1., 2., 3.)
  const [attending, setAttending] = useState<boolean | null>(true);
  const [names, setNames] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(2);

  const [submittedEntry, setSubmittedEntry] = useState<RsvpEntry | null>(null);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState<boolean>(false);
  const [rsvpErrorMsg, setRsvpErrorMsg] = useState<string>('');
  const [rsvpSuccessMsg, setRsvpSuccessMsg] = useState<string>('');
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);

  // Independent Spotify Song Requests State (Multiple inputs, Spotify search, Duplicate Prevention)
  const [songRequests, setSongRequests] = useState<string[]>(['']);
  const [isSubmittingSong, setIsSubmittingSong] = useState<boolean>(false);
  const [songErrorMsg, setSongErrorMsg] = useState<string>('');
  const [songSuccessMsg, setSongSuccessMsg] = useState<string>('');

  // Autocomplete state
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveSearchIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle typing in a song input with Spotify live autocomplete
  const handleSongInputChange = (index: number, value: string) => {
    const updated = [...songRequests];
    updated[index] = value;
    setSongRequests(updated);

    if (songErrorMsg) setSongErrorMsg('');

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (value.trim().length >= 2) {
      setActiveSearchIndex(index);
      setIsSearching(true);
      searchDebounceRef.current = setTimeout(async () => {
        const results = await searchSpotifyTracks(value);
        setSuggestions(results);
        setIsSearching(false);
      }, 250);
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  // Add another song input field ('+' Button)
  const handleAddSongField = () => {
    setSongRequests((prev) => [...prev, '']);
    setActiveSearchIndex(null);
    setSuggestions([]);
  };

  // Remove a song input field
  const handleRemoveSongField = (indexToRemove: number) => {
    if (songRequests.length <= 1) {
      setSongRequests(['']);
      return;
    }
    setSongRequests((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (activeSearchIndex === indexToRemove) {
      setActiveSearchIndex(null);
      setSuggestions([]);
    }
  };

  // Select a suggestion from Spotify with DUPLICATE PREVENTION
  const handleSelectSuggestion = (index: number, track: SpotifyTrack) => {
    const formatted = `${track.name} – ${track.artist}`;

    // 1. Prüfen, ob Song bereits auf der DJ Playlist existiert
    if (isSongAlreadyInPlaylist(formatted)) {
      setSongErrorMsg(`„${formatted}“ steht bereits auf der DJ-Playlist! 🎶 Bitte wähle einen anderen Track.`);
      return;
    }

    // 2. Prüfen, ob Song bereits in einem anderen Eingabefeld des Formulars steht
    const isDuplicateInForm = songRequests.some(
      (s, i) => i !== index && s.trim() && areSongsEquivalent(s, formatted)
    );
    if (isDuplicateInForm) {
      setSongErrorMsg(`„${formatted}“ hast du bereits in die Liste eingetragen.`);
      return;
    }

    const updated = [...songRequests];
    updated[index] = formatted;
    setSongRequests(updated);
    setActiveSearchIndex(null);
    setSuggestions([]);
    setSongErrorMsg('');
  };

  // 1. Submit Handler for Rückmeldung (Points 1, 2, 3)
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!names.trim()) {
      setRsvpErrorMsg('Bitte gib deinen Namen bzw. eure Namen ein.');
      return;
    }

    if (attending === null) {
      setRsvpErrorMsg('Bitte wähle aus, ob du/ihr zur Hochzeit kommen könnt.');
      return;
    }

    const validSongs = songRequests.map((s) => s.trim()).filter(Boolean);

    // Duplikate prüfen, falls Songs mit dem RSVP abgesendet werden
    for (const song of validSongs) {
      if (isSongAlreadyInPlaylist(song)) {
        setRsvpErrorMsg(`Der Song „${song}“ steht bereits auf der DJ-Playlist! Bitte wähle einen anderen Song.`);
        return;
      }
    }

    setIsSubmittingRsvp(true);
    setRsvpErrorMsg('');

    try {
      const combinedSongs = validSongs.join('\n');

      let current: RsvpEntry | null = null;
      if (submittedEntry) {
        current = updateRsvpEntry(submittedEntry.id, {
          names: names.trim(),
          attending: attending,
          guestCount: attending ? guestCount : 0,
          songRequest: attending ? (combinedSongs || submittedEntry.songRequest || '') : '',
        });
      } else {
        current = saveRsvpEntry({
          names: names.trim(),
          attending: attending,
          guestCount: attending ? guestCount : 0,
          songRequest: attending ? combinedSongs : '',
        });
      }

      if (attending) {
        confetti({
          particleCount: 130,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#d7541d', '#df931d', '#cf3464', '#92092f', '#dc6b6b', '#858e7f', '#f5d8b3', '#4f5a3b'],
        });
      }

      if (current) {
        setSubmittedEntry(current);
      }
      setRsvpSuccessMsg(
        attending
          ? `Vielen Dank, ${names.trim()}! Zusage für ${guestCount} Person(en) gespeichert.`
          : `Danke für deine Rückmeldung, ${names.trim()}. Wir haben deine Absage vermerkt.`
      );
      onEntryAdded();
    } catch (err) {
      console.error(err);
      setRsvpErrorMsg('Es gab ein Problem beim Speichern. Bitte versuche es erneut.');
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  // 2. Submit Handler for Spotify Song Requests (Unabhängig vom Namen & mit Duplikatsprüfung)
  const handleSongSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validSongs = songRequests.map((s) => s.trim()).filter(Boolean);

    if (validSongs.length === 0) {
      setSongErrorMsg('Bitte gib mindestens einen Songtitel ein oder wähle einen Spotify-Vorschlag aus.');
      return;
    }

    // 1. Prüfen, ob innerhalb der Liste Duplikate vorhanden sind
    const seenInForm: string[] = [];
    for (const song of validSongs) {
      if (seenInForm.some((prev) => areSongsEquivalent(prev, song))) {
        setSongErrorMsg(`Der Song „${song}“ wurde mehrfach eingetragen. Bitte entferne das Duplikat.`);
        return;
      }
      seenInForm.push(song);
    }

    // 2. Prüfen, ob einer der Songs bereits auf der DJ-Playlist existiert
    for (const song of validSongs) {
      if (isSongAlreadyInPlaylist(song)) {
        setSongErrorMsg(`Der Song „${song}“ steht bereits auf der DJ-Playlist! 🎶 Bitte wähle einen anderen Track.`);
        return;
      }
    }

    setIsSubmittingSong(true);
    setSongErrorMsg('');

    try {
      const who = names.trim() || 'Festival-Gast';
      const combinedSongs = validSongs.join('\n');

      if (submittedEntry) {
        const existingSongs = submittedEntry.songRequest ? submittedEntry.songRequest + '\n' : '';
        const updated = updateRsvpEntry(submittedEntry.id, {
          songRequest: (existingSongs + combinedSongs).trim(),
        });
        if (updated) {
          setSubmittedEntry(updated);
        }
      } else {
        saveRsvpEntry({
          names: who,
          attending: true,
          guestCount: 0,
          songRequest: combinedSongs,
        });
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#1db954', '#cf3464', '#df931d', '#d7541d'],
      });

      const countText = validSongs.length === 1 ? 'Dein Songwunsch wurde' : `${validSongs.length} neue Songs wurden`;
      setSongSuccessMsg(`🎧 ${countText} erfolgreich zur DJ-Playlist hinzugefügt!`);
      
      setSongRequests(['']);
      onEntryAdded();
    } catch (err) {
      console.error(err);
      setSongErrorMsg('Fehler beim Speichern der Songwünsche.');
    } finally {
      setIsSubmittingSong(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedEntry(null);
    setNames('');
    setSongRequests(['']);
    setAttending(true);
    setGuestCount(2);
    setRsvpSuccessMsg('');
    setSongSuccessMsg('');
    setRsvpErrorMsg('');
    setSongErrorMsg('');
    setShowTicketModal(false);
  };

  return (
    <section id="rsvp-form" className="py-10 sm:py-16 px-3.5 sm:px-6 relative">
      <div className="max-w-2xl mx-auto">
        {/* Section Header styled in floral palette */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#d7541d] font-bold mb-2 px-3 py-1 bg-[#faebd7] border border-[#f0d4b4] rounded-full">
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#cf3464] fill-[#cf3464]" />
            <span>Gebt uns Bescheid</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#261c14] tracking-wide uppercase drop-shadow-xs">
            Rückmeldung zur Hochzeit
          </h2>
          <p className="mt-1.5 sm:mt-2 text-[#665444] text-xs sm:text-base leading-relaxed px-1">
            Lasst Katharina &amp; Ole wissen, ob ihr am <strong className="text-[#92092f]">27. August 2027</strong> beim Festival of Love dabei seid.
          </p>
        </div>

        {/* Haupt-Container */}
        <div className="bg-[#fffcf7] text-[#261c14] rounded-2xl sm:rounded-3xl p-3.5 sm:p-10 shadow-2xl border-2 sm:border-4 border-[#d7541d]/30 relative overflow-hidden ticket-drop-shadow space-y-4 sm:space-y-6">
          {/* Top floral gradient ticket band */}
          <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-[#d7541d] via-[#cf3464] to-[#df931d]" />

          {rsvpErrorMsg && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-800 text-xs font-medium">
              {rsvpErrorMsg}
            </div>
          )}

          {/* 1. Eigenes grafisches Feld: Bist du am 27.08.2027 dabei? */}
          <div className="bg-[#fffaf2] border-2 border-[#eedcc8] rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-xs transition-all hover:border-[#df931d]/60">
            <label className="block text-xs uppercase tracking-wider text-[#b84112] font-bold mb-2.5 sm:mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#d7541d] text-white flex items-center justify-center text-xs font-bold shrink-0">
                1
              </span>
              <span>Bist du am 27.08.2027 dabei? *</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
              <button
                type="button"
                onClick={() => {
                  setAttending(true);
                  if (rsvpErrorMsg) setRsvpErrorMsg('');
                }}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left flex items-start gap-2.5 sm:gap-3 transition-all cursor-pointer min-h-[52px] ${
                  attending === true
                    ? 'bg-[#faebd7] border-[#d7541d] text-[#261c14] ring-2 ring-[#d7541d]/30 shadow-xs'
                    : 'bg-[#ffffff] border-[#eedcc8] text-[#786757] hover:border-[#d7541d]/50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    attending === true ? 'bg-[#d7541d] text-white' : 'bg-[#eedcc8] text-[#786757]'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <span className="block font-bold text-sm sm:text-base text-[#261c14]">
                    Ja, ich bin / wir sind dabei! 🎉
                  </span>
                  <span className="block text-xs text-[#786757] mt-0.5">
                    Festival-Ticket gebucht!
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAttending(false);
                  if (rsvpErrorMsg) setRsvpErrorMsg('');
                }}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left flex items-start gap-2.5 sm:gap-3 transition-all cursor-pointer min-h-[52px] ${
                  attending === false
                    ? 'bg-[#f0ebd9] border-[#6b5e52] text-[#261c14] ring-2 ring-[#6b5e52]/30 shadow-xs'
                    : 'bg-[#ffffff] border-[#eedcc8] text-[#786757] hover:border-[#d7541d]/50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    attending === false ? 'bg-[#6b5e52] text-white' : 'bg-[#eedcc8] text-[#786757]'
                  }`}
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <span className="block font-bold text-sm sm:text-base text-[#261c14]">
                    Kann leider nicht kommen 💔
                  </span>
                  <span className="block text-xs text-[#786757] mt-0.5">
                    Wir sind leider verhindert.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Eigenes grafisches Feld: Dein Name / Eure Namen */}
          <div className="bg-[#fffaf2] border-2 border-[#eedcc8] rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-xs transition-all hover:border-[#df931d]/60">
            <label htmlFor="guest-names" className="block text-xs uppercase tracking-wider text-[#b84112] font-bold mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#d7541d] text-white flex items-center justify-center text-xs font-bold shrink-0">
                2
              </span>
              <span>Dein Name / Eure Namen *</span>
            </label>
            <input
              id="guest-names"
              type="text"
              required
              value={names}
              onChange={(e) => {
                setNames(e.target.value);
                if (rsvpErrorMsg) setRsvpErrorMsg('');
              }}
              placeholder="z.B. Katharina & Ole"
              className="w-full px-3.5 sm:px-4 py-3 bg-[#ffffff] border-2 border-[#d9c7af] focus:border-[#d7541d] rounded-xl text-[#261c14] placeholder-[#a69280] focus:outline-none text-base sm:text-sm transition-colors shadow-inner"
            />
          </div>

          {/* 3. Eigenes grafisches Feld: Personenanzahl (wenn Zusage) */}
          {attending && (
            <div className="bg-[#fffaf2] border-2 border-[#eedcc8] rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-xs transition-all hover:border-[#df931d]/60">
              <label className="block text-xs uppercase tracking-wider text-[#b84112] font-bold mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#d7541d] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </span>
                <Users className="w-4 h-4 text-[#d7541d]" />
                <span>Personenanzahl</span>
              </label>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setGuestCount(count)}
                    className={`flex-1 min-h-[44px] py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      guestCount === count
                        ? 'bg-[#d7541d] text-white shadow-md'
                        : 'bg-[#faebd7] text-[#4a3f35] border border-[#eedcc8] hover:border-[#d7541d]'
                    }`}
                  >
                    {count}{count === 5 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Button DIREKT UNTER 3: Rückmeldung jetzt absenden */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleRsvpSubmit}
              disabled={isSubmittingRsvp}
              className="w-full min-h-[48px] py-3.5 sm:py-4 px-4 sm:px-6 bg-[#d7541d] hover:bg-[#b84112] active:bg-[#9c360e] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingRsvp ? (
                <span>Wird übermittelt...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>Rückmeldung jetzt absenden</span>
                  <Sparkles className="w-4 h-4 text-white" />
                </>
              )}
            </button>

            {rsvpSuccessMsg && (
              <div className="mt-3.5 p-3.5 sm:p-4 bg-emerald-50 border border-emerald-300 rounded-xl sm:rounded-2xl text-emerald-900 text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span>{rsvpSuccessMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTicketModal(true)}
                  className="w-full sm:w-auto px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-2xs transition-colors text-center min-h-[38px] flex items-center justify-center"
                >
                  Ticket ansehen 🎟️
                </button>
              </div>
            )}
          </div>

          {/* EIGENES UMRANDETES FELD FÜR FESTIVAL SONGWUNSCH (Unabhängig vom Namen jederzeit nutzbar, mit Spotify & Duplikatschutz) */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-dashed border-[#eedcc8] space-y-4">
            <div className="bg-[#fffaf2] border-2 border-[#eedcc8] rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-xs space-y-3.5 sm:space-y-4 transition-all hover:border-[#cf3464]/60 relative">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="block text-xs uppercase tracking-wider text-[#b84112] font-bold flex items-center gap-2">
                  <Music className="w-4 h-4 text-[#cf3464]" />
                  <span>Festival Songwunsch</span>
                </label>

                {/* Spotify Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1db954]/12 border border-[#1db954]/30 rounded-full text-[10px] sm:text-[11px] font-bold text-[#15883e]">
                  <span className="w-2 h-2 rounded-full bg-[#1db954] animate-pulse" />
                  <span>Spotify Autocomplete</span>
                </div>
              </div>

              <p className="text-xs text-[#786757] leading-relaxed">
                Tippe deinen Wunschsong ein: Anhand der Buchstaben werden dir live passende Tracks aus <strong>Spotify</strong> vorgeschlagen. Songs, die bereits auf der Playlist stehen, können nicht doppelt hinzugefügt werden.
              </p>

              {/* Liste von Song-Eingabefeldern */}
              <div className="space-y-3" ref={dropdownRef}>
                {songRequests.map((song, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={song}
                          onChange={(e) => handleSongInputChange(idx, e.target.value)}
                          onFocus={() => {
                            setActiveSearchIndex(idx);
                            if (song.trim().length >= 2) {
                              searchSpotifyTracks(song).then(setSuggestions);
                            }
                          }}
                          placeholder={
                            idx === 0
                              ? "Songtitel oder Interpret tippen..."
                              : `Weiterer Songwunsch #${idx + 1}...`
                          }
                          className="w-full pl-3.5 pr-10 py-3 bg-[#ffffff] border-2 border-[#d9c7af] focus:border-[#cf3464] rounded-xl text-[#261c14] placeholder-[#a69280] focus:outline-none text-base sm:text-sm transition-colors shadow-inner"
                        />

                        {isSearching && activeSearchIndex === idx && (
                          <div className="absolute right-3 top-3.5 text-[#1db954]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        )}
                      </div>

                      {songRequests.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSongField(idx)}
                          className="p-2.5 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-[#faebd7] hover:bg-red-50 text-[#786757] hover:text-red-600 rounded-xl transition-colors cursor-pointer border border-[#eedcc8]"
                          title="Diesen Song entfernen"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Spotify Autocomplete Vorschläge */}
                    {activeSearchIndex === idx && suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 z-50 mt-1.5 bg-[#ffffff] border-2 border-[#eedcc8] rounded-2xl shadow-2xl overflow-hidden max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-[#f7ede1] animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 bg-[#faefe0] text-[10px] uppercase font-bold text-[#786757] flex items-center justify-between border-b border-[#eedcc8]">
                          <span className="flex items-center gap-1.5 text-emerald-800">
                            <span className="w-2 h-2 rounded-full bg-[#1db954]" />
                            <span>Spotify Vorschläge</span>
                          </span>
                          <span className="text-[#a89684]">Tippen zum Wählen</span>
                        </div>

                        {suggestions.map((track) => {
                          const candidate = `${track.name} – ${track.artist}`;
                          const isAlreadyAdded = isSongAlreadyInPlaylist(candidate);

                          return (
                            <div
                              key={track.id}
                              onClick={() => handleSelectSuggestion(idx, track)}
                              className={`w-full text-left px-3 py-2.5 transition-colors flex items-center justify-between gap-2.5 cursor-pointer group ${
                                isAlreadyAdded ? 'bg-amber-50/60 hover:bg-amber-100/60' : 'hover:bg-[#fff7ee]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                {track.albumArt ? (
                                  <img
                                    src={track.albumArt}
                                    alt={track.name}
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover shadow-2xs shrink-0 border border-[#ecdac6]"
                                  />
                                ) : (
                                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#faebd7] flex items-center justify-center shrink-0 text-[#cf3464]">
                                    <Music className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-[#261c14] truncate group-hover:text-[#cf3464]">
                                    {track.name}
                                  </div>
                                  <div className="text-[11px] text-[#786757] truncate">
                                    {track.artist}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {isAlreadyAdded ? (
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded-md border border-amber-300">
                                    Bereits vorhanden
                                  </span>
                                ) : (
                                  <span className="text-[10px] sm:text-[11px] font-bold text-[#15883e] bg-emerald-50 group-hover:bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200">
                                    Wählen ✓
                                  </span>
                                )}
                                <a
                                  href={track.spotifyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 text-[#786757] hover:text-[#1db954] transition-colors"
                                  title="Auf Spotify anhören"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* '+' Zeichen unterhalb des Eingabefeldes, um weitere Songnamen hinzuzufügen */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleAddSongField}
                  className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 bg-[#faebd7] hover:bg-[#f0d8bd] text-[#b84112] border border-[#ecdac6] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-[#d7541d] text-white flex items-center justify-center font-bold text-xs">
                    +
                  </div>
                  <span>Weiteren Song hinzufügen</span>
                </button>
              </div>
            </div>

            {/* Button UNTERHALB DES FELDES von 'Festival Songwunsch': Songwunsch absenden */}
            <div>
              <button
                type="button"
                onClick={handleSongSubmit}
                disabled={isSubmittingSong}
                className="w-full min-h-[48px] py-3.5 px-4 sm:px-6 bg-[#cf3464] hover:bg-[#b02650] active:bg-[#92092f] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingSong ? (
                  <span>Wird gespeichert...</span>
                ) : (
                  <>
                    <Music className="w-4 h-4 text-white" />
                    <span>Songwunsch absenden</span>
                  </>
                )}
              </button>

              {songSuccessMsg && (
                <div className="mt-3.5 p-3.5 sm:p-4 bg-emerald-50 border border-emerald-300 rounded-xl sm:rounded-2xl text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>{songSuccessMsg}</span>
                  </div>
                </div>
              )}

              {songErrorMsg && (
                <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-xl text-red-800 text-xs font-medium">
                  {songErrorMsg}
                </div>
              )}
            </div>
          </div>

          {/* Reset / Weitere Rückmeldung erfassen (falls bereits erfasst) */}
          {submittedEntry && (
            <div className="pt-4 text-center border-t border-[#eedcc8]">
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-[#786757] hover:text-[#d7541d] underline cursor-pointer transition-colors py-2"
              >
                Formular zurücksetzen &amp; neue Rückmeldung erfassen
              </button>
            </div>
          )}
        </div>

        {/* Festival-Ticket Modal (wird geöffnet bei Klick auf "Ticket ansehen") */}
        {showTicketModal && submittedEntry && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#fffcf7] text-[#261c14] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden border-4 border-[#d7541d]/30 animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-[#d7541d] via-[#cf3464] to-[#df931d]" />

              <div className="w-14 h-14 rounded-full bg-[#d7541d]/15 border-2 border-[#d7541d] text-[#d7541d] flex items-center justify-center mx-auto mb-4 mt-2">
                <TicketCheck className="w-7 h-7" />
              </div>

              <div className="text-center">
                <div className="text-xs uppercase tracking-[0.2em] text-[#d7541d] font-bold">
                  Festival of Love · 27.08.2027
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#261c14] uppercase tracking-wide mt-1">
                  {submittedEntry.attending ? 'Festival-Ticket Gesichert!' : 'Rückmeldung erhalten'}
                </h3>
              </div>

              {/* Ticket Summary Stub */}
              <div className="mt-5 p-4 bg-[#faebd7]/70 border border-dashed border-[#d9c7af] rounded-2xl text-xs space-y-2.5 text-[#4a3f35]">
                <div className="flex justify-between pb-2 border-b border-[#ecdac6]">
                  <span className="text-[#786757]">Gäste:</span>
                  <span className="font-bold text-[#261c14]">{submittedEntry.names}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#ecdac6]">
                  <span className="text-[#786757]">Datum:</span>
                  <span className="font-semibold text-[#261c14]">Freitag, 27. August 2027</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#ecdac6]">
                  <span className="text-[#786757]">Status:</span>
                  <span className={submittedEntry.attending ? 'text-[#d7541d] font-bold' : 'text-[#786757] font-bold'}>
                    {submittedEntry.attending ? `✓ Zusage (${submittedEntry.guestCount} Pers.)` : '✗ Leider verhindert'}
                  </span>
                </div>
                {submittedEntry.attending && submittedEntry.songRequest && (
                  <div className="pt-1">
                    <span className="text-[#786757] block mb-1">Wunsch-Songs:</span>
                    <div className="space-y-1">
                      {submittedEntry.songRequest.split('\n').filter(Boolean).map((s, i) => (
                        <div key={i} className="text-[#92092f] font-semibold italic">
                          "{s}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-6 py-2.5 bg-[#261c14] hover:bg-[#3d2f23] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
