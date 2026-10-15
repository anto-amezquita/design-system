import type { LightboxImage } from './Lightbox'

// Small drawn scenes as data URIs, so stories and tests need no network.
const scene = (sky: string, land: string, sun: string, hills: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="${sky}"/><circle cx="600" cy="170" r="70" fill="${sun}"/><path d="${hills}" fill="${land}"/></svg>`,
  )}`

export const sampleImages: LightboxImage[] = [
  { src: scene('#f4d6b0', '#7a5c3e', '#f08a24', 'M0 420 Q200 330 400 410 T800 380 V600 H0Z'), alt: 'Desert dunes under a low orange sun', caption: 'Ica, Peru', width: 800, height: 600 },
  { src: scene('#cfe6f2', '#3f6e4f', '#ffffff', 'M0 450 L180 300 L320 420 L520 260 L800 440 V600 H0Z'), alt: 'Green mountains under a pale sky', caption: 'Cusco, Peru', width: 800, height: 600 },
  { src: scene('#1f2a44', '#0f1626', '#e9e2c9', 'M0 470 Q250 420 500 470 T800 460 V600 H0Z'), alt: 'A full moon over a dark lake', caption: 'Skanderborg Lake at night', width: 800, height: 600 },
  { src: scene('#e8eef0', '#9fb2b8', '#f6f1d9', 'M0 500 Q400 430 800 500 V600 H0Z'), alt: 'A flat grey coast in winter light', caption: 'Aarhus Bay', width: 800, height: 600 },
]
