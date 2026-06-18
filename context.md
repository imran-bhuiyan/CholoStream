### Current App Context to Improve:
- My current prototype runs on an .m3u playlist parsing system and a hardcoded array (`CHANNELS` in `app.js`) that defines standard HLS (`.m3u8`) streams, along with proxied MPEG-TS streams.
- It features 18 channels, mostly focused on sports (such as FIFA World Cup broadcasts, Bein Sports, TSN, Win Sports, Fussball TV, Caze TV, TyC Sports, and D Sports) along with select news (Somoy TV) and entertainment (Z Bangla) channels.
- **Major pain points to fix:**
  1. **Black Screen on Chrome/Firefox due to HEVC (H.265) Codec**: Several streams default to HEVC-encoded video layers. Standard browsers without native hardware/software decoding support for HEVC in HLS render a black screen (while audio might play).
  2. **Disabled Audio for Raw MPEG-TS Streams**: Raw TS playback is routed through `mpegts.js`, where audio is explicitly hardcoded to disabled (`hasAudio: false`) to bypass crashing/unsupported codec issues.
  3. **Broken/Placeholder Stream Configurations**: Certain channels have invalid or fallback URLs (e.g., TSN Sports pointing to a `.woff2` font file, and others relying on fragile cloudfront/pages.dev proxy layers).
  4. **Unoptimized Mobile UI & Performance**: The sidebar channel selection, heavy schedule list (104 matches), and live scoreboard grid elements do not scale elegantly on mobile screens, leading to slow rendering and messy layouts.
