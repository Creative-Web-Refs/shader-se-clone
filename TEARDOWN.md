# Shader.se technical teardown

## 0. One-sentence essence

A long semantic scroll timeline drives several realtime 3D scenes into one
fixed canvas, then a configurable WebGPU/TSL composite makes the output feel
like a curved, noisy 1980s corporate display.

## A. Evidence-backed architecture

### Rendering

- `SOURCE` — Response headers identify a statically prerendered Next.js page.
- `SOURCE` — Runtime recon finds one fixed `<canvas>`; at a 1280×720 CSS
  viewport its backing store is 1920×1080.
- `SOURCE` — The inspected vendor/application bundle contains Three.js WebGPU
  renderer code and TSL node construction.
- `SOURCE` — Scene configuration names `hero`, `projects`, `office`,
  `about-us`, `golden-tie-reveal`, `golden-tie`, and `contact`.

### Composition

- `SOURCE` — The application renders the active scene into an FBO before its
  final composition call.
- `SOURCE` — The composition accepts bloom intensity/threshold/radius,
  sepia, brightness, contrast, chromatic-aberration strength, motion-blur
  strength, lens-distortion controls, UI textures, time/noise, and vignette.
- `SOURCE` — Separate effect presets exist per section and are interpolated
  during section/sub-page transitions.
- `PARTIAL` — Bundle-level evidence confirms the controls and graph wiring but
  not friendly original module names, because source maps were unavailable.

### Interaction

- `SOURCE` — Runtime inspection measures a 17,452px custom scroll container on
  desktop while the body itself stays viewport-height.
- `SOURCE` — Configuration encodes four transition types: `fade`, `direct`,
  `overlay`, and `below`.
- `SOURCE` — The accessibility layer provides semantic navigation, hero,
  selected-work carousel, about, contact, and project controls separately from
  the canvas.
- `GUESS` — Exact easing curves, camera paths, and all proprietary model
  animation details were not reconstructed.

### Assets and data

- `SOURCE` — The homepage HTML includes Prismic project data and Mux playback
  identifiers.
- `SOURCE` — Network capture observed 67 requests across the primary host,
  `www.gstatic.com`, and the site’s analytics host.
- `SOURCE` — The loading screen declares the original work “All Rights
  Reserved.”

All hash-linked findings are recorded in
[`RECON/source-evidence.json`](./RECON/source-evidence.json). No production
bundle or original media is redistributed.

## B. Clean-room reconstruction choices

| Reference behavior | Independent implementation | Evidence |
|---|---|---|
| Fixed WebGPU/TSL render surface | Fixed Three.js WebGL canvas | `src/main.js` |
| FBO then multi-effect composite | WebGLRenderTarget then one GLSL pass | `src/main.js` |
| Seven configured phases | Six original geometric scenes | `src/main.js` |
| Four proprietary transition modes | One smoothstep crossfade | `src/main.js` |
| Original models/video/brand | Procedural primitives and fictional Circuit Office brand | `index.html`, `src/main.js` |
| Configurable analog effects | Independent barrel/RGB/noise/scanline/vignette shader | `src/main.js` |
| Hidden semantic accessibility layer | Visible semantic DOM over decorative canvas | `index.html` |

## C. Transferable method

1. Keep meaning in HTML and mark the canvas decorative.
2. Normalize scroll once, then drive scene visibility, camera state, UI
   opacity, and post settings from the same value.
3. Render the 3D world offscreen so analog treatment is a final, isolated pass.
4. Make post effects section-aware; changing the “lens” with the scene is more
   convincing than one static filter.
5. Cap pixel ratio and keep geometry procedural for predictable Pages delivery.
6. When the reference is proprietary, preserve only evidence metadata and
   rebuild visual principles—not code or assets.
