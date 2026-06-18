import fs from 'fs';

const IPTV_STREAMS_URL = 'https://iptv-org.github.io/api/streams.json';

function isUsableStreamUrl(url) {
  const lower = url.toLowerCase().trim();
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) return false;
  return !(
    lower.endsWith('.woff2') ||
    lower.endsWith('.woff') ||
    lower.endsWith('.ttf') ||
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.css') ||
    lower.includes('jmp2.uk') ||
    lower.includes('pages.dev')
  );
}

function scoreStream(stream) {
  let score = 0;
  if (stream.url.startsWith('https://')) score += 2;
  if (stream.url.includes('.m3u8')) score += 3;
  if (stream.quality === '1080p') score += 2;
  if (stream.quality === '720p') score += 1;
  if (stream.url.includes('cors-proxy')) score -= 1;

  if (stream.url.toLowerCase().includes('hevc') || stream.url.toLowerCase().includes('h265') || (stream.quality && stream.quality.toLowerCase().includes('hevc'))) {
    score -= 5;
  }
  return score;
}

async function main() {
    const res = await fetch(IPTV_STREAMS_URL);
    const streams = await res.json();
    const candidates = streams.filter(s => s.channel === 'RTBGo.bn' && isUsableStreamUrl(s.url)).sort((a, b) => scoreStream(b) - scoreStream(a));
    console.log("Filtered Candidates: ", candidates.length);
    console.log(candidates);
}
main();
