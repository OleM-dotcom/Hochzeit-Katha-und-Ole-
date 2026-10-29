import React, { useState } from 'react';
import { Download, Search, Trash2, CheckCircle, XCircle, Music, HeartHandshake, RefreshCw, Plus, Users } from 'lucide-react';
import { RsvpEntry } from '../types';
import { deleteRsvpEntry, exportRsvpsToCsv, resetRsvpEntries, saveRsvpEntry } from '../services/storage';

interface CoupleDashboardProps {
  entries: RsvpEntry[];
  onRefresh: () => void;
}

export const CoupleDashboard: React.FC<CoupleDashboardProps> = ({ entries, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'attending' | 'declined'>('all');
  const [activeTab, setActiveTab] = useState<'guests' | 'songs'>('guests');

  // Manual entry modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualAttending, setManualAttending] = useState(true);
  const [manualCount, setManualCount] = useState(2);
  const [manualSong, setManualSong] = useState('');

  // Calculations
  const attendingEntries = entries.filter((e) => e.attending);
  const declinedEntries = entries.filter((e) => !e.attending);
  const totalAttendingGuests = attendingEntries.reduce((sum, e) => sum + (e.guestCount || 0), 0);

  const songsList = entries
    .filter((e) => e.songRequest && e.songRequest.trim() !== '')
    .map((e) => ({
      song: e.songRequest!,
      from: e.names,
    }));

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.names.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.songRequest && entry.songRequest.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === 'attending') return entry.attending;
    if (filterStatus === 'declined') return !entry.attending;
    return true;
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Möchtest du den Eintrag von "${name}" wirklich löschen?`)) {
      deleteRsvpEntry(id);
      onRefresh();
    }
  };

  const handleResetSampleData = () => {
    if (window.confirm('Möchtest du die Beispieldaten wiederherstellen?')) {
      resetRsvpEntries();
      onRefresh();
    }
  };

  const handleAddManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    saveRsvpEntry({
      names: manualName.trim(),
      attending: manualAttending,
      guestCount: manualAttending ? manualCount : 0,
      songRequest: manualAttending ? manualSong.trim() : '',
    });

    setShowAddModal(false);
    setManualName('');
    setManualSong('');
    onRefresh();
  };

  return (
    <section id="couple-admin" className="py-16 px-4 sm:px-6 relative border-t border-[#3d2719]">
      <div className="max-w-5xl mx-auto">
        {/* Title & Couple Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#3d2719]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#d6611e] font-semibold mb-1">
              <HeartHandshake className="w-4 h-4 text-[#d6611e]" />
              <span>Brautpaar-Übersicht &amp; Gästeliste</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#f6eedf] uppercase tracking-wide">
              Rückmeldungen für Katharina &amp; Ole
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#d6611e] hover:bg-[#b84c12] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Gast manuell erfassen</span>
            </button>

            <button
              onClick={() => exportRsvpsToCsv(entries)}
              className="px-3.5 py-2 text-xs font-medium text-[#f6eedf] bg-[#22160e] hover:bg-[#2f1f14] border border-[#4d301e] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#d6611e]" />
              <span>CSV / Excel Export</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Zusagen Personen */}
          <div className="p-5 bg-[#1e140d] border border-[#3d2719] rounded-2xl">
            <div className="flex items-center justify-between text-[#a69280] text-xs">
              <span className="uppercase tracking-wider">Gäste zugesagt</span>
              <Users className="w-4 h-4 text-[#d6611e]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-[#f6eedf] tabular-nums">
                {totalAttendingGuests}
              </span>
              <span className="text-xs text-[#a69280]">
                ({attendingEntries.length} Zusagen)
              </span>
            </div>
          </div>

          {/* Absagen */}
          <div className="p-5 bg-[#1e140d] border border-[#3d2719] rounded-2xl">
            <div className="flex items-center justify-between text-[#a69280] text-xs">
              <span className="uppercase tracking-wider">Absagen</span>
              <XCircle className="w-4 h-4 text-[#735e4d]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-[#c5b19e] tabular-nums">
                {declinedEntries.length}
              </span>
              <span className="text-xs text-[#a69280]">verhindert</span>
            </div>
          </div>

          {/* DJ Songwünsche */}
          <div className="p-5 bg-[#1e140d] border border-[#3d2719] rounded-2xl">
            <div className="flex items-center justify-between text-[#a69280] text-xs">
              <span className="uppercase tracking-wider">DJ Songwünsche</span>
              <Music className="w-4 h-4 text-[#d6611e]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-[#f6eedf] tabular-nums">
                {songsList.length}
              </span>
              <span className="text-xs text-[#a69280]">Tanzflächen-Hits</span>
            </div>
          </div>

          {/* Gesamt */}
          <div className="p-5 bg-[#1e140d] border border-[#3d2719] rounded-2xl">
            <div className="flex items-center justify-between text-[#a69280] text-xs">
              <span className="uppercase tracking-wider">Rückmeldungen</span>
              <CheckCircle className="w-4 h-4 text-[#cfa052]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-[#f6eedf] tabular-nums">
                {entries.length}
              </span>
              <span className="text-xs text-[#a69280]">Gesamteinträge</span>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
          <div className="flex items-center gap-1 p-1 bg-[#1c130d] rounded-xl border border-[#3d2719]">
            <button
              onClick={() => setActiveTab('guests')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'guests'
                  ? 'bg-[#d6611e] text-white shadow-sm'
                  : 'text-[#a69280] hover:text-[#f6eedf]'
              }`}
            >
              Gästeliste ({filteredEntries.length})
            </button>
            <button
              onClick={() => setActiveTab('songs')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'songs'
                  ? 'bg-[#d6611e] text-white shadow-sm'
                  : 'text-[#a69280] hover:text-[#f6eedf]'
              }`}
            >
              DJ Playlist ({songsList.length})
            </button>
          </div>

          {activeTab === 'guests' && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Filter Buttons */}
              <div className="flex items-center gap-1 bg-[#1c130d] p-1 rounded-lg border border-[#3d2719] text-xs">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterStatus === 'all' ? 'bg-[#2f1f14] text-[#f6eedf] font-medium' : 'text-[#a69280]'
                  }`}
                >
                  Alle
                </button>
                <button
                  onClick={() => setFilterStatus('attending')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterStatus === 'attending' ? 'bg-[#2f1f14] text-[#d6611e] font-medium' : 'text-[#a69280]'
                  }`}
                >
                  Zusagen
                </button>
                <button
                  onClick={() => setFilterStatus('declined')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterStatus === 'declined' ? 'bg-[#2f1f14] text-[#c5b19e] font-medium' : 'text-[#a69280]'
                  }`}
                >
                  Absagen
                </button>
              </div>

              {/* Search Field */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#735e4d] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Gäste suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#1c130d] border border-[#3d2719] rounded-lg text-xs text-[#f6eedf] placeholder-[#735e4d] focus:outline-none focus:border-[#d6611e]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Guest Table */}
        {activeTab === 'guests' && (
          <div className="bg-[#1e140d] border border-[#3d2719] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#cbb59f]">
                <thead className="bg-[#140e09] text-[#d6611e] uppercase tracking-wider font-semibold border-b border-[#3d2719]">
                  <tr>
                    <th className="py-3.5 px-4">Name(n)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Personen</th>
                    <th className="py-3.5 px-4">Songwunsch</th>
                    <th className="py-3.5 px-4">Eingetragen am</th>
                    <th className="py-3.5 px-4 text-right">Aktion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d1c12]">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#735e4d] italic">
                        Keine passenden Einträge gefunden.
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[#291b12]/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#f6eedf]">
                          {entry.names}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {entry.attending ? (
                            <span className="inline-flex items-center gap-1 text-[#d6611e] font-bold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Zusage</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#735e4d] font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absage</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 tabular-nums text-[#f6eedf]">
                          {entry.attending ? entry.guestCount : 0}
                        </td>
                        <td className="py-3.5 px-4">
                          {entry.songRequest ? (
                            <span className="text-[#f6eedf] italic">{entry.songRequest}</span>
                          ) : (
                            <span className="text-[#594639]">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#8a7667]">
                          {new Date(entry.submittedAt).toLocaleDateString('de-DE')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDelete(entry.id, entry.names)}
                            className="text-[#735e4d] hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                            title="Eintrag entfernen"
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

            <div className="p-3 bg-[#140e09] border-t border-[#3d2719] flex items-center justify-between text-xs text-[#735e4d]">
              <span>Gesamt: {entries.length} Rückmeldungen</span>
              <button
                onClick={handleResetSampleData}
                className="hover:text-[#d6611e] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Beispieldaten wiederherstellen</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: DJ Songs Playlist */}
        {activeTab === 'songs' && (
          <div className="p-6 bg-[#1e140d] border border-[#3d2719] rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#3d2719]">
              <div>
                <h3 className="font-display text-lg font-bold text-[#f6eedf] uppercase tracking-wide flex items-center gap-2">
                  <Music className="w-5 h-5 text-[#d6611e]" />
                  <span>DJ &amp; Tanzflächen Playlist</span>
                </h3>
                <p className="text-xs text-[#8a7667] mt-0.5">
                  Alle von Gästen über das Save the Date Formular eingereichten Songs für Katharina &amp; Ole
                </p>
              </div>
              <button
                onClick={() => {
                  const content = songsList.map((s) => `${s.song} (Gewünscht von: ${s.from})`).join('\n');
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `DJ_Playlist_Katharina_Ole.txt`;
                  a.click();
                }}
                className="px-3 py-1.5 text-xs text-[#f6eedf] bg-[#291b12] hover:bg-[#382519] border border-[#523320] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#d6611e]" />
                <span>Playlist herunterladen (.txt)</span>
              </button>
            </div>

            {songsList.length === 0 ? (
              <p className="text-[#735e4d] text-xs italic text-center py-6">
                Noch keine Songwünsche eingegangen.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {songsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#140e09] border border-[#332014] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#d6611e]/15 text-[#d6611e] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-xs text-[#f6eedf]">{item.song}</div>
                        <div className="text-[11px] text-[#8a7667]">von {item.from}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Gast manuell erfassen */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#1e140d] border border-[#523320] rounded-2xl max-w-md w-full p-6 text-[#f6eedf]">
              <h3 className="font-display text-lg font-bold text-[#f6eedf] uppercase tracking-wide mb-4">
                Gast manuell hinzufügen
              </h3>
              <form onSubmit={handleAddManualSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#a69280] mb-1">Name(n) *</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Vor- und Nachname"
                    className="w-full px-3 py-2 bg-[#140e09] border border-[#3d2719] rounded-lg text-[#f6eedf] focus:outline-none focus:border-[#d6611e]"
                  />
                </div>

                <div>
                  <label className="block text-[#a69280] mb-1">Status</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setManualAttending(true)}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                        manualAttending ? 'bg-[#d6611e] text-white' : 'bg-[#140e09] text-[#735e4d]'
                      }`}
                    >
                      Zusage
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualAttending(false)}
                      className={`flex-1 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                        !manualAttending ? 'bg-[#3b291d] text-[#f6eedf]' : 'bg-[#140e09] text-[#735e4d]'
                      }`}
                    >
                      Absage
                    </button>
                  </div>
                </div>

                {manualAttending && (
                  <div>
                    <label className="block text-[#a69280] mb-1">Personenanzahl</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={manualCount}
                      onChange={(e) => setManualCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#140e09] border border-[#3d2719] rounded-lg text-[#f6eedf] focus:outline-none focus:border-[#d6611e]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[#a69280] mb-1">Songwunsch (optional)</label>
                  <input
                    type="text"
                    value={manualSong}
                    onChange={(e) => setManualSong(e.target.value)}
                    placeholder="Wunschsong"
                    className="w-full px-3 py-2 bg-[#140e09] border border-[#3d2719] rounded-lg text-[#f6eedf] focus:outline-none focus:border-[#d6611e]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-[#140e09] hover:bg-[#281c13] text-[#c5b19e] rounded-lg cursor-pointer"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#d6611e] hover:bg-[#b84c12] text-white font-bold rounded-lg cursor-pointer"
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
