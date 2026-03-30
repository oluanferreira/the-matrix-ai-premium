# Remotion Best Practices — Reference Store

**Source:** [remotion-dev/skills](https://github.com/remotion-dev/skills)
**Author:** Remotion (official)
**License:** Not explicitly declared (distributed via Agent Skills Open Standard, 186K installs/week)
**Absorbed:** 2026-03-29
**Installs:** 186.6K/week | Stars: 2.4K

## 38 Rules across ~10 Categories

| Category | Rules | Key Content |
|----------|-------|-------------|
| Core Animation | animations, timing, sequencing, trimming | `useCurrentFrame()` hook, interpolation, CSS FORBIDDEN |
| Transitions | transitions, light-leaks | TransitionSeries, fade/slide/wipe, overlays |
| Media | videos, audio, images, gifs, transparent-videos | Embed, trim, volume, speed, pitch |
| Media Inspection | get-video-duration, get-video-dimensions, get-audio-duration, extract-frames, can-decode | Mediabunny |
| Text & Typography | fonts, text-animations, measuring-text, measuring-dom-nodes | Google Fonts, text fit |
| Captions | subtitles, display-captions, import-srt-captions, transcribe-captions | Full subtitle pipeline |
| Data Viz | charts | Bar, pie, line, stock charts |
| 3D | 3d | Three.js + React Three Fiber |
| Composition | compositions, calculate-metadata, parameters | Dynamic metadata, Zod schema |
| Integrations | lottie, tailwind, maps, voiceover, ffmpeg, sfx, audio-visualization | Lottie, Mapbox, ElevenLabs TTS |

## CRITICAL Rules

1. **CSS animations FORBIDDEN** — Tailwind animate classes, CSS transitions, keyframes will NOT render. ALL animation via `useCurrentFrame()` + `interpolate()`.
2. **TransitionSeries** — Official pattern for scene transitions. Never abrupt cuts.
3. **Zod schema for parametrization** — Make videos configurable via input props.

## How Agents Use This Data

**IMPORTANT: Load ON-DEMAND by topic. NEVER read all 38 files at once.**

### @video-studio (Studio Director + Remotion Engineer)
- Building templates → read `animations.md`, `timing.md`, `compositions.md`, `parameters.md`
- Transitions → read `transitions.md`, `light-leaks.md`
- Captions → read `subtitles.md`, `display-captions.md`, `import-srt-captions.md`, `transcribe-captions.md`
- Audio → read `audio.md`, `voiceover.md`, `audio-visualization.md`, `sfx.md`
- 3D content → read `3d.md`
- Media handling → read `videos.md`, `images.md`, `gifs.md`

### @dev (Neo)
- Remotion code in projects → reference animation and composition rules
- Media inspection → `get-video-duration.md`, `extract-frames.md`
