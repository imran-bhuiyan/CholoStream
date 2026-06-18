import type { StreamSource } from '@/types/stream';

export function isValidStreamSource(source: StreamSource): boolean {
  if (!source?.url) return false;
  const lowerUrl = source.url.toLowerCase().trim();
  return (
    (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')) &&
    !lowerUrl.endsWith('.woff2') &&
    !lowerUrl.endsWith('.woff') &&
    !lowerUrl.endsWith('.ttf') &&
    !lowerUrl.endsWith('.png') &&
    !lowerUrl.endsWith('.jpg') &&
    !lowerUrl.endsWith('.css')
  );
}

export { MATCH_SCHEDULE } from './worldCup2026Schedule';
