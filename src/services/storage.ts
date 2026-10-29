import { 
  collection, doc, setDoc, updateDoc, deleteDoc, 
  onSnapshot, getDocFromServer 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { RsvpEntry } from '../types';

const STORAGE_KEY = 'festival_of_love_rsvp_entries_v1';
const COLLECTION_NAME = 'rsvps';

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

// In-memory cache for synchronous reads and optimistic UI
let cachedEntries: RsvpEntry[] = [];

// Seed initial cache from localStorage if available
try {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    cachedEntries = JSON.parse(local);
  }
} catch {
  cachedEntries = INITIAL_SAMPLES;
}

// Test connection on boot per Firebase guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using local cache.');
    }
  }
}
testConnection();

/**
 * Seeds initial demo entries to Firestore if database is empty
 */
async function seedInitialSamples() {
  try {
    for (const sample of INITIAL_SAMPLES) {
      await setDoc(doc(db, COLLECTION_NAME, sample.id), {
        names: sample.names,
        attending: sample.attending,
        guestCount: sample.guestCount,
        songRequest: sample.songRequest,
        submittedAt: sample.submittedAt,
      });
    }
  } catch (err) {
    console.warn('Error seeding initial samples to Firestore:', err);
  }
}

/**
 * Returns currently cached entries synchronously
 */
export function getRsvpEntries(): RsvpEntry[] {
  if (cachedEntries.length > 0) {
    return cachedEntries;
  }
  return INITIAL_SAMPLES;
}

/**
 * Subscribes to real-time Firestore updates across all devices
 */
export function subscribeToRsvpEntries(callback: (entries: RsvpEntry[]) => void): () => void {
  // Immediate callback with current cache
  if (cachedEntries.length > 0) {
    callback(cachedEntries);
  }

  const rsvpsCol = collection(db, COLLECTION_NAME);

  const unsubscribe = onSnapshot(
    rsvpsCol,
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialSamples();
        callback(INITIAL_SAMPLES);
        return;
      }

      const liveEntries: RsvpEntry[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          names: String(data.names || ''),
          attending: Boolean(data.attending),
          guestCount: typeof data.guestCount === 'number' ? data.guestCount : 0,
          songRequest: String(data.songRequest || ''),
          submittedAt: String(data.submittedAt || new Date().toISOString()),
        };
      });

      // Sort newest submissions first
      liveEntries.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      cachedEntries = liveEntries;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(liveEntries));
      } catch (e) {
        console.warn('LocalStorage save error', e);
      }
      callback(liveEntries);
    },
    (error) => {
      console.warn('Firestore Live-Sync Hinweis (Offline/Lokaler Cache aktiv):', error?.message || error);
      try {
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      } catch {
        // Error logged for diagnostics via handleFirestoreError
      }
      callback(cachedEntries.length > 0 ? cachedEntries : INITIAL_SAMPLES);
    }
  );

  return unsubscribe;
}

/**
 * Saves a new RSVP or song request entry to Firestore (syncs across all devices)
 */
export function saveRsvpEntry(entry: Omit<RsvpEntry, 'id' | 'submittedAt'>): RsvpEntry {
  const newId = 'rsvp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newEntry: RsvpEntry = {
    ...entry,
    id: newId,
    submittedAt: new Date().toISOString(),
  };

  // Optimistic update
  cachedEntries = [newEntry, ...cachedEntries.filter((e) => e.id !== newId)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedEntries));
  } catch (e) {
    console.warn('LocalStorage save error', e);
  }

  // Persist to Cloud Firestore
  setDoc(doc(db, COLLECTION_NAME, newId), {
    names: newEntry.names,
    attending: newEntry.attending,
    guestCount: newEntry.guestCount,
    songRequest: newEntry.songRequest || '',
    submittedAt: newEntry.submittedAt,
  }).catch((error) => {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${newId}`);
  });

  return newEntry;
}

/**
 * Updates an existing RSVP or song request entry in Firestore
 */
export function updateRsvpEntry(id: string, updates: Partial<Omit<RsvpEntry, 'id' | 'submittedAt'>>): RsvpEntry | null {
  const index = cachedEntries.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const existing = cachedEntries[index];
  const updatedEntry: RsvpEntry = {
    ...existing,
    ...updates,
  };

  cachedEntries[index] = updatedEntry;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedEntries));
  } catch (e) {
    console.warn('LocalStorage save error', e);
  }

  // Persist update to Cloud Firestore
  updateDoc(doc(db, COLLECTION_NAME, id), updates).catch((error) => {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  });

  return updatedEntry;
}

/**
 * Deletes an entry from Firestore and local cache
 */
export function deleteRsvpEntry(id: string): void {
  cachedEntries = cachedEntries.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedEntries));
  } catch (e) {
    console.warn('LocalStorage save error', e);
  }

  deleteDoc(doc(db, COLLECTION_NAME, id)).catch((error) => {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  });
}

/**
 * Resets Firestore entries to initial sample data
 */
export function resetRsvpEntries(): void {
  cachedEntries = INITIAL_SAMPLES;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLES));
  } catch (e) {
    console.warn('LocalStorage save error', e);
  }
  seedInitialSamples();
}

/**
 * Normalizes song strings for accurate duplicate detection.
 */
export function normalizeSongTitle(song: string): string {
  return song
    .toLowerCase()
    .replace(/[–—\-_/]/g, ' ')
    .replace(/[^\w\s\u00C0-\u017F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if two song titles represent the exact same track
 */
export function areSongsEquivalent(songA: string, songB: string): boolean {
  const normA = normalizeSongTitle(songA);
  const normB = normalizeSongTitle(songB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  const partsA = songA.split(/[–—\-]/).map((s) => normalizeSongTitle(s)).filter(Boolean);
  const partsB = songB.split(/[–—\-]/).map((s) => normalizeSongTitle(s)).filter(Boolean);

  if (partsA.length === 2 && partsB.length === 2) {
    if (
      (partsA[0] === partsB[0] && partsA[1] === partsB[1]) ||
      (partsA[0] === partsB[1] && partsA[1] === partsB[0])
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Returns all unique songs already present on the DJ playlist.
 */
export function getAllPlaylistSongs(): string[] {
  const entries = getRsvpEntries();
  const songs: string[] = [];

  for (const entry of entries) {
    if (!entry.songRequest) continue;
    const items = entry.songRequest.split(/\n|;;/).map((s) => s.trim()).filter(Boolean);
    for (const item of items) {
      if (!songs.some((existing) => areSongsEquivalent(existing, item))) {
        songs.push(item);
      }
    }
  }

  return songs;
}

/**
 * Checks if a song is already present in the DJ playlist.
 */
export function isSongAlreadyInPlaylist(song: string): boolean {
  if (!song || !song.trim()) return false;
  const currentSongs = getAllPlaylistSongs();
  return currentSongs.some((existing) => areSongsEquivalent(existing, song.trim()));
}

/**
 * Deletes a specific song from the DJ playlist across entries.
 */
export function deleteSongFromPlaylist(songToDelete: string): void {
  for (const entry of cachedEntries) {
    if (!entry.songRequest) continue;
    const items = entry.songRequest.split(/\n|;;/).map((s) => s.trim()).filter(Boolean);
    const filtered = items.filter((item) => !areSongsEquivalent(item, songToDelete));
    if (filtered.length !== items.length) {
      updateRsvpEntry(entry.id, {
        songRequest: filtered.join('\n'),
      });
    }
  }
}

export function exportRsvpsToCsv(entries: RsvpEntry[]): void {
  const headers = [
    'ID',
    'Name(n)',
    'Status',
    'Personenanzahl',
    'Eingetragen am'
  ];

  const realGuests = entries.filter((e) => !(e.names === 'Festival-Gast' && e.guestCount === 0));

  const rows = realGuests.map((e) => [
    `"${e.id}"`,
    `"${(e.names || '').replace(/"/g, '""')}"`,
    `"${e.attending ? 'Zusage' : 'Absage'}"`,
    e.guestCount,
    `"${new Date(e.submittedAt).toLocaleString('de-DE')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Gaesteliste_Katharina_Ole_Hochzeit_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
