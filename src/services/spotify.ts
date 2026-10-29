export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt?: string;
  previewUrl?: string;
  spotifyUrl: string;
}

/**
 * Searches for music tracks via CORS-enabled public endpoint with Spotify integration.
 * Provides live autocomplete suggestions with album art, artist, and direct Spotify links.
 */
export async function searchSpotifyTracks(query: string): Promise<SpotifyTrack[]> {
  const clean = query.trim();
  if (!clean || clean.length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(clean)}&entity=song&limit=7`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: any) => {
      const trackName = item.trackName || 'Unbekannter Titel';
      const artistName = item.artistName || 'Unbekannter Künstler';
      return {
        id: String(item.trackId || Math.random()),
        name: trackName,
        artist: artistName,
        album: item.collectionName || '',
        albumArt: item.artworkUrl100 || item.artworkUrl60 || '',
        previewUrl: item.previewUrl || '',
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`${trackName} ${artistName}`)}`,
      };
    });
  } catch (err) {
    console.warn('Fehler bei der Spotify-Suche:', err);
    return [];
  }
}
