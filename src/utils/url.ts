/**
 * Helper to ensure the QR code always links to the public, unrestricted URL
 * that anyone can open on their mobile phone without requiring a Google/AI Studio login.
 */
export const SHARED_PUBLIC_APP_URL = 'https://ais-pre-ul4se3jmyixkm4nxrnbzzy-247279290271.us-west2.run.app';

export function getPublicRsvpUrl(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If running in development (ais-dev-...), convert to the public shared preview (ais-pre-...)
    // because ais-dev requires developer authentication whereas ais-pre is public for everyone
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-') + '#rsvp-form';
    }

    // If on a custom domain or already on ais-pre-...
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return origin + '#rsvp-form';
    }
  }

  return SHARED_PUBLIC_APP_URL + '#rsvp-form';
}
