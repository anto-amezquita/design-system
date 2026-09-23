# Media Player Library Recommendations

The design system does not ship `VideoPlayer` or `AudioPlayer` components. Consumers bring their own player library and theme it with design tokens. This doc tracks which libraries to recommend and their current maturity — revisit periodically, don't treat as permanent.

## Video

**Default: Video.js**

As of Sept 2026, Plyr, Vidstack, and Media Chrome have merged into Video.js v10 (built at Mux). Plyr is already deprecated in favor of it. Video.js v10 is currently at release-candidate stage; its official React package (`@videojs/react`) is still in beta.

Vidstack remains the closer philosophical fit — architecturally described by its own creator as "a Radix-like component library for video" (hooks, compound components, accessibility baked in). But flag clearly: `@vidstack/react`'s last stable release was 2 years ago, and it does not yet support React 19 (requires downgrading to React 18 or using a community-patched fork).

**Recommendation:** default to Video.js's React wrapper despite the beta status — it's the actively-converging future path. Revisit once Video.js v10 goes stable (expected ~end of 2026).

## Audio

**Default: wavesurfer.js**

Essentially the only serious waveform player library — built on Web Audio API + Canvas. Its official React wrapper, `@wavesurfer/react`, is maintained directly by wavesurfer's own author and was updated 8 months ago — notably healthier than Vidstack's wrapper.

**Caveat to document for consumers:** wavesurfer decodes audio entirely in-browser, so large files can fail to decode due to memory constraints. Use pre-decoded peaks for anything long (full songs vs. short clips).

## Revisit triggers

- Video.js v10 goes stable
- Vidstack ships React 19 support
