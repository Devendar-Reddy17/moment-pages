export const APP_NAME = 'MomentPages';
export const APP_DOMAIN = 'momentpages.com';

export const EVENT_TYPES = [
  { value: 'coffee', label: 'Coffee Invitation' },
  { value: 'dinner', label: 'Dinner Invitation' },
  { value: 'date', label: 'Date Invitation' },
  { value: 'birthday', label: 'Birthday Surprise' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'custom', label: 'Custom Event' },
] as const;

export const TONES = [
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'playful', label: 'Playful' },
  { value: 'romantic', label: 'Romantic' },
] as const;

export const CANVAS_DEFAULTS = {
  width: 1080,
  height: 1920,
  backgroundColor: '#ffffff',
} as const;

export const UPLOAD_LIMITS = {
  image: { maxSize: 10 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] },
  video: { maxSize: 100 * 1024 * 1024, types: ['video/mp4', 'video/webm'] },
  audio: { maxSize: 20 * 1024 * 1024, types: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'] },
} as const;

export const AUTO_SAVE_INTERVAL_MS = 30_000;
