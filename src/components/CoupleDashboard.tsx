import React, { useState } from 'react';
import { 
  Download, Search, Trash2, CheckCircle, XCircle, Music, HeartHandshake, 
  RefreshCw, Plus, Users, AlertTriangle, X
} from 'lucide-react';
import { RsvpEntry } from '../types';
import { 
  deleteRsvpEntry, exportRsvpsToCsv, resetRsvpEntries, saveRsvpEntry,
  deleteSongFromPlaylist, getAllPlaylistSongs, isSongAlreadyInPlaylist 
} from '../services/storage';

interface CoupleDashboardProps {
  entries: RsvpEntry[];
  onRefresh: () => void;
  onBackToGuestView?: () => void;
  onLogout?: () => void;
}

export const CoupleDashboard: React.FC<CoupleDashboardProps> = ({ 
  entries, 
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'attending' | 'declined'>('all');
  const [activeTab, setActiveTab] = useState<'guests' | 'songs'>('guests');

  // Manual entry modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualAttending, setManualAttending] = useState(true);
  const [manualCount, setManualCount] = useState(2);
  const [manualSong, setManualSong] = useState('');

  // Delete confirmation modal
  const [entryToDelete, setEntryToDelete] = useState<RsvpEntry | null>(null);

  // Reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Success toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. GÄSTELISTE (Reine Gäste-Rückmeldungen, getrennt von reinen DJ-Songwünschen)
  const guestEntries = entries.filter((e) => !(e.names === 'Festival-Gast' && e.guestCount === 0));
  const attendingEntries = guestEntries.filter((e) => e.attending);
  const declinedEntries = guestEntries.filter((e) => !e.attending);
  const totalAttendingGuests = attendingEntries.reduce((sum, e) => sum + (e.guestCount || 0), 0);

  const filteredEntries = guestEntries.filter((entry) => {
    const matchesSearch = entry.names.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === 'attending') return entry.attending;
    if (filterStatus === 'declined') return !entry.attending;
    return true;
  });

  // 2. DJ PLAYLIST (Alle einzigartigen Songs, ohne doppelte Einträge und ohne "von Festival-Gast")
  const uniqueSongs = getAllPlaylistSongs();
  const songsList = uniqueSongs.map((song) => ({ song }));

  // Confirmed delete execution for guest entry
  const handleConfirmDelete = () => {
    if (!entryToDelete) return;
    const name = entryToDelete.names;
    deleteRsvpEntry(entryToDelete.id);
    setEntryToDelete(null);
    onRefresh();
    showToast(`Der Eintrag von „${name}“ wurde erfolgreich gelöscht.`);
  };

  // Delete song from DJ playlist
  const handleDeleteSong = (songTitle: string) => {
    deleteSongFromPlaylist(songTitle);
    onRefresh();
    showToast(`„${songTitle}“ wurde aus der Playlist entfernt.`);
  };

  // Reset sample data confirmation
  const handleConfirmReset = () => {
    resetRsvpEntries();
    setShowResetConfirm(false);
    onRefresh();
    showToast('Beispieldaten wurden erfolgreich wiederhergestellt.');
  };

  // Manual new entry
  const handleAddManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    if (manualAttending && manualSong.trim() && isSongAlreadyInPlaylist(manualSong.trim())) {
      showToast(`Der Song „${manualSong.trim()}“ steht bereits auf der DJ-Playlist!`);
      return;
    }

    saveRsvpEntry({
      names: manualName.trim(),
      attending: manualAttending,
      guestCount: manualAttending ? manualCount : 0,
      songRequest: manualAttending ? manualSong.trim() : '',
    });

    setShowAddModal(false);
    const addedName = manualName.trim();
    setManualName('');
    setManualSong('');
    onRefresh();
    showToast(`Gast „${addedName}“ wurde erfolgreich hinzugefügt.`);
  };

  return (
    <section id="couple-admin" className="py-12 px-4 sm:px-6 relative border-t border-[#eedcc8] bg-[#fffdfa]">
      <div className="max-w-5xl mx-auto">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#261c14] text-[#fffcf7] px-4 py-3 rounded-2xl shadow-2xl border border-[#d7541d]/40 flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-3 duration-300">
            <CheckCircle className="w-4 h-4 text-[#d7541d] shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Title & Couple Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-5 border-b border-[#eedcc8]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#d7541d] font-bold mb-1 px-3 py-1 bg-[#faebd7] border border-[#f0d4b4] rounded-full">
              <HeartHandshake className="w-4 h-4 text-[#cf3464]" />
              <span>Brautpaar-Übersicht &amp; Gästeliste</span>
            </div>
            <h2 className="font-display text-xl sm:text-3xl font-bold text-[#261c14] uppercase tracking-wide mt-1.5 sm:mt-2">
              Rückmeldungen für Katharina &amp; Ole
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 md:flex-none min-h-[40px] px-3.5 py-2 text-xs font-semibold text-white bg-[#d7541d] hover:bg-[#b84112] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Gast manuell erfassen</span>
            </button>

            <button
              onClick={() => exportRsvpsToCsv(entries)}
              className="flex-1 md:flex-none min-h-[40px] px-3.5 py-2 text-xs font-medium text-[#261c14] bg-[#ffffff] hover:bg-[#fffaf2] border border-[#ecdac6] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-[#df931d]" />
              <span>CSV Export</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
          {/* Zusagen Personen */}
          <div className="p-3.5 sm:p-5 bg-[#ffffff] border border-[#eedcc8] rounded-xl sm:rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-[#786757] text-[11px] sm:text-xs">
              <span className="uppercase tracking-wider font-semibold truncate">Gäste zugesagt</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#d7541d]/12 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d7541d]" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-display text-2xl sm:text-3xl font-bold text-[#d7541d] tabular-nums">
                {totalAttendingGuests}
              </span>
              <span className="text-[11px] sm:text-xs text-[#786757]">
                ({attendingEntries.length} Zusagen)
              </span>
            </div>
          </div>

          {/* Absagen */}
          <div className="p-3.5 sm:p-5 bg-[#ffffff] border border-[#eedcc8] rounded-xl sm:rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-[#786757] text-[11px] sm:text-xs">
              <span className="uppercase tracking-wider font-semibold truncate">Absagen</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#858e7f]/15 flex items-center justify-center shrink-0">
                <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#858e7f]" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-display text-2xl sm:text-3xl font-bold text-[#6b5e52] tabular-nums">
                {declinedEntries.length}
              </span>
              <span className="text-[11px] sm:text-xs text-[#786757]">verhindert</span>
            </div>
          </div>

          {/* DJ Songwünsche */}
          <div className="p-3.5 sm:p-5 bg-[#ffffff] border border-[#eedcc8] rounded-xl sm:rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-[#786757] text-[11px] sm:text-xs">
              <span className="uppercase tracking-wider font-semibold truncate">DJ Playlist</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#cf3464]/12 flex items-center justify-center shrink-0">
                <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#cf3464]" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-display text-2xl sm:text-3xl font-bold text-[#cf3464] tabular-nums">
                {songsList.length}
              </span>
              <span className="text-[11px] sm:text-xs text-[#786757]">Hits</span>
            </div>
          </div>

          {/* Gästeliste Gesamt */}
          <div className="p-3.5 sm:p-5 bg-[#ffffff] border border-[#eedcc8] rounded-xl sm:rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-[#786757] text-[11px] sm:text-xs">
              <span className="uppercase tracking-wider font-semibold truncate">Gästeliste</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#df931d]/15 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#df931d]" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-display text-2xl sm:text-3xl font-bold text-[#261c14] tabular-nums">
                {guestEntries.length}
              </span>
              <span className="text-[11px] sm:text-xs text-[#786757]">Einträge</span>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
          <div className="flex items-center gap-1 p-1 bg-[#faebd7] rounded-xl border border-[#eedcc8]">
            <button
              onClick={() => setActiveTab('guests')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'guests'
                  ? 'bg-[#d7541d] text-white shadow-xs'
                  : 'text-[#665444] hover:text-[#261c14]'
              }`}
            >
              Gästeliste ({filteredEntries.length})
            </button>
            <button
              onClick={() => setActiveTab('songs')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'songs'
                  ? 'bg-[#d7541d] text-white shadow-xs'
                  : 'text-[#665444] hover:text-[#261c14]'
              }`}
            >
              DJ Playlist ({songsList.length})
            </button>
          </div>

          {activeTab === 'guests' && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Filter Buttons */}
              <div className="flex items-center gap-1 bg-[#ffffff] p-1 rounded-lg border border-[#eedcc8] text-xs">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterStatus === 'all' ? 'bg-[#faebd7] text-[#261c14] font-bold' : 'text-[#786757]'
                  }`}
                >
                  Alle
                </button>
                <button
                  onClick={() => setFilterStatus('attending')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterStatus === 'attending' ? 'bg-[#faebd7] text-[#d7541d] font-bold' : 'text-[#786757]'
                  }`}
                >
                  Zusagen
                </button>
                <button
                  onClick={() => setFilterStatus('declined')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterStatus === 'declined' ? 'bg-[#faebd7] text-[#786757] font-bold' : 'text-[#786757]'
                  }`}
                >
                  Absagen
                </button>
              </div>

              {/* Search Field */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#786757] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Gäste suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#ffffff] border border-[#eedcc8] rounded-lg text-xs text-[#261c14] placeholder-[#9c8978] focus:outline-none focus:border-[#d7541d]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Guest Table – Format: Name(n), Status, Personen, Eingetragen am, Aktionen */}
        {activeTab === 'guests' && (
          <div className="bg-[#ffffff] border border-[#eedcc8] rounded-xl sm:rounded-2xl overflow-hidden shadow-xs">
            <div className="block sm:hidden px-3 py-1.5 bg-[#faefe0] text-[11px] text-[#786757] text-center font-medium border-b border-[#eedcc8]">
              ⇄ Tabelle seitlich wischen zum Scrollen
            </div>
            <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full text-left text-xs text-[#4a3f35] min-w-[540px]">
                <thead className="bg-[#faefe0] text-[#9c360e] uppercase tracking-wider font-bold border-b border-[#eedcc8]">
                  <tr>
                    <th className="py-3.5 px-4">Name(n)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Personen</th>
                    <th className="py-3.5 px-4">Eingetragen am</th>
                    <th className="py-3.5 px-4 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5ebd9]">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#786757] italic">
                        Keine passenden Einträge gefunden.
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[#fffaf2] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#261c14]">
                          {entry.names}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {entry.attending ? (
                            <span className="inline-flex items-center gap-1 text-[#d7541d] font-bold bg-[#faebd7] px-2.5 py-1 rounded-md border border-[#f0d4b4]">
                              <CheckCircle className="w-3.5 h-3.5 text-[#d7541d]" />
                              <span>Zusage</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#786757] font-medium bg-[#f0ebd9] px-2.5 py-1 rounded-md border border-[#e5dcc7]">
                              <XCircle className="w-3.5 h-3.5 text-[#786757]" />
                              <span>Absage</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 tabular-nums text-[#261c14] font-semibold">
                          {entry.attending ? entry.guestCount : 0}
                        </td>
                        <td className="py-3.5 px-4 text-[#786757]">
                          {new Date(entry.submittedAt).toLocaleDateString('de-DE')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setEntryToDelete(entry)}
                            className="text-[#9c8978] hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Eintrag löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#faefe0] border-t border-[#eedcc8] flex flex-wrap items-center justify-between gap-2 text-xs text-[#786757]">
              <span>Gesamt: {guestEntries.length} Rückmeldungen</span>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="hover:text-[#d7541d] flex items-center gap-1 transition-colors cursor-pointer font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Beispieldaten wiederherstellen</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: DJ Songs Playlist – Behalte lediglich Interpret & Songname (ohne 'von Festival Gast') */}
        {activeTab === 'songs' && (
          <div className="p-4 sm:p-6 bg-[#ffffff] border border-[#eedcc8] rounded-xl sm:rounded-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6 pb-4 border-b border-[#eedcc8]">
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#261c14] uppercase tracking-wide flex items-center gap-2">
                  <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[#cf3464]" />
                  <span>DJ &amp; Tanzflächen Playlist</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-[#786757] mt-0.5">
                  Alle von Gästen über das Save the Date Formular eingereichten Songs für Katharina &amp; Ole (ohne Duplikate)
                </p>
              </div>
              <button
                onClick={() => {
                  const content = songsList.map((s, i) => `${i + 1}. ${s.song}`).join('\n');
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `DJ_Playlist_Katharina_Ole.txt`;
                  a.click();
                }}
                className="w-full sm:w-auto px-3 py-2 text-xs text-[#261c14] bg-[#faebd7] hover:bg-[#f5dbc0] border border-[#eedcc8] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium min-h-[38px]"
              >
                <Download className="w-3.5 h-3.5 text-[#df931d]" />
                <span>Playlist herunterladen (.txt)</span>
              </button>
            </div>

            {songsList.length === 0 ? (
              <p className="text-[#786757] text-xs italic text-center py-6">
                Noch keine Songwünsche eingegangen.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {songsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#fffaf2] border border-[#f5e5d3] rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-[#cf3464]/15 text-[#cf3464] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-[#261c14] truncate">
                          {item.song}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(item.song)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Auf Spotify suchen / anhören"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#1db954]" />
                        <span>Spotify</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteSong(item.song)}
                        className="p-1.5 text-[#9c8978] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Song aus Playlist entfernen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BESTÄTIGUNGSFELD: Eintrag löschen Modal */}
        {entryToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#ffffff] border-2 border-red-200 rounded-3xl max-w-md w-full p-6 text-[#261c14] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="font-display text-xl font-bold text-center text-[#261c14] uppercase tracking-wide">
                Eintrag löschen?
              </h3>

              <div className="mt-3 p-3.5 bg-[#fbf6ef] border border-[#ecdac6] rounded-xl text-center text-xs">
                <div className="font-bold text-sm text-[#261c14]">{entryToDelete.names}</div>
                <div className="text-[#786757] mt-1">
                  Status: <strong className={entryToDelete.attending ? 'text-[#d7541d]' : 'text-[#786757]'}>
                    {entryToDelete.attending ? `Zusage (${entryToDelete.guestCount} Personen)` : 'Absage'}
                  </strong>
                </div>
              </div>

              <p className="text-xs text-[#786757] text-center mt-3 leading-relaxed">
                Möchtest du diese Rückmeldung wirklich endgültig aus der Gästeliste entfernen? Diese Aktion kann nicht rückgängig gemacht werden.
              </p>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEntryToDelete(null)}
                  className="flex-1 py-2.5 px-4 bg-[#faebd7] hover:bg-[#f0d8bd] text-[#4a3f35] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ja, löschen</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BESTÄTIGUNGSFELD: Beispieldaten wiederherstellen */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#ffffff] border border-[#eedcc8] rounded-3xl max-w-md w-full p-6 text-[#261c14] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-[#faebd7] text-[#df931d] flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-center text-[#261c14] uppercase tracking-wide">
                Beispieldaten laden?
              </h3>
              <p className="text-xs text-[#786757] text-center mt-2 leading-relaxed">
                Möchtest du die ursprünglichen 3 Test-Einträge wiederherstellen? Alle manuell erfassten Einträge werden dabei überschrieben.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 px-4 bg-[#faebd7] hover:bg-[#f0d8bd] text-[#4a3f35] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="flex-1 py-2.5 px-4 bg-[#d7541d] hover:bg-[#b84112] text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Wiederherstellen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Gast manuell erfassen */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#ffffff] border border-[#eedcc8] rounded-3xl max-w-md w-full p-6 text-[#261c14] shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#eedcc8] mb-4">
                <h3 className="font-display text-lg font-bold text-[#261c14] uppercase tracking-wide">
                  Gast manuell hinzufügen
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-7 h-7 rounded-full bg-[#faebd7] hover:bg-[#f0d8bd] text-[#786757] flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddManualSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#665444] mb-1 font-semibold">Name(n) *</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Vor- und Nachname"
                    className="w-full px-3 py-2 bg-[#ffffff] border border-[#d9c7af] focus:border-[#d7541d] rounded-lg text-[#261c14] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#665444] mb-1 font-semibold">Status</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setManualAttending(true)}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                        manualAttending ? 'bg-[#d7541d] text-white' : 'bg-[#faebd7] text-[#665444]'
                      }`}
                    >
                      Zusage
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualAttending(false)}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                        !manualAttending ? 'bg-[#858e7f] text-white' : 'bg-[#faebd7] text-[#665444]'
                      }`}
                    >
                      Absage
                    </button>
                  </div>
                </div>

                {manualAttending && (
                  <div>
                    <label className="block text-[#665444] mb-1 font-semibold">Personenanzahl</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={manualCount}
                      onChange={(e) => setManualCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#ffffff] border border-[#d9c7af] focus:border-[#d7541d] rounded-lg text-[#261c14] focus:outline-none"
                    />
                  </div>
                )}

                {manualAttending && (
                  <div>
                    <label className="block text-[#665444] mb-1 font-semibold">Songwunsch für DJ (optional)</label>
                    <input
                      type="text"
                      value={manualSong}
                      onChange={(e) => setManualSong(e.target.value)}
                      placeholder="z.B. Interpret – Titel"
                      className="w-full px-3 py-2 bg-[#ffffff] border border-[#d9c7af] focus:border-[#d7541d] rounded-lg text-[#261c14] focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-[#faebd7] hover:bg-[#f0d8bd] text-[#4a3f35] rounded-lg cursor-pointer font-medium"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#d7541d] hover:bg-[#b84112] text-white font-bold rounded-lg cursor-pointer"
                  >
                    Speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
