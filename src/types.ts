export interface RsvpEntry {
  id: string;
  names: string;
  attending: boolean;
  guestCount: number;
  songRequest?: string;
  submittedAt: string;
}

export interface QrCodeConfig {
  targetUrl: string;
  posX: number;      // percentage or pixel coordinate
  posY: number;
  size: number;
  margin: number;
  darkColor: string;
  lightColor: string;
  correctLevel: 'L' | 'M' | 'Q' | 'H';
}
