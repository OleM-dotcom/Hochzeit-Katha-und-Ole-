import { RsvpEntry } from '../types';

const STORAGE_KEY = 'festival_of_love_rsvp_entries_v1';

const INITIAL_SAMPLES: RsvpEntry[] = [
  {
    id: 'sample-1',
    names: 'Maximilian & Sophie Weber',
    attending: true,
    guestCount: 2,
    songRequest: 'Kings of Leon – Sex on Fire',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sample-2',
    names: 'Laura Schmidt',
    attending: true,
    guestCount: 1,
    songRequest: 'Daft Punk – One More Time',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-3',
    names: 'Tobias & Sarah Klein',
    attending: false,
    guestCount: 0,
    songRequest: '',
    submittedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

export function getRsvpEntries(): RsvpEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLES));
      return INITIAL_SAMPLES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load RSVPs', e);
    return INITIAL_SAMPLES;
  }
}

export function saveRsvpEntry(entry: Omit<RsvpEntry, 'id' | 'submittedAt'>): RsvpEntry {
  const current = getRsvpEntries();
  const newEntry: RsvpEntry = {
    ...entry,
    id: 'rsvp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    submittedAt: new Date().toISOString(),
  };
  const updated = [newEntry, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newEntry;
}

export function deleteRsvpEntry(id: string): void {
  const current = getRsvpEntries();
  const updated = current.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function resetRsvpEntries(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLES));
}

export function exportRsvpsToCsv(entries: RsvpEntry[]): void {
  const headers = [
    'ID',
    'Name(n)',
    'Status',
    'Personenanzahl',
    'Songwunsch',
    'Eingetragen am'
  ];

  const rows = entries.map(e => [
    `"${e.id}"`,
    `"${(e.names || '').replace(/"/g, '""')}"`,
    `"${e.attending ? 'Zusage' : 'Absage'}"`,
    e.guestCount,
    `"${(e.songRequest || '').replace(/"/g, '""')}"`,
    `"${new Date(e.submittedAt).toLocaleString('de-DE')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Gaesteliste_Katharina_Ole_Hochzeit_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
