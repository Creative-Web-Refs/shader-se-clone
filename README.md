# Shader.se — clean-room recreation

A high-fidelity, independently implemented recreation study of
[shader.se](https://www.shader.se). It follows the reference site’s visual arc:
the smoky CRT-computer hero, blue filmstrip portfolio, infinite office, paper
annual report, corporate star reveal, golden tie, telephones, and oversized
contact finale.

**Live:** [shader-se-clone.pages.dev](https://shader-se-clone.pages.dev/)

![Recreation hero](./RECON/screenshots/clone-1440.png)

> This repository is an independent technical and visual study. It is not
> affiliated with, endorsed by, or sponsored by Shader Sweden AB. The original
> site is marked “All Rights Reserved.” No production source, bundles, 3D
> models, Mux video, or original photographic assets are redistributed here.
> Publicly visible brand copy and outbound links are included only to preserve
> the reference page’s information architecture; all rights to them remain with
> Shader Sweden AB.

## What is reproduced

- The same eight-beat one-page narrative and fixed corporate-TV navigation.
- A near-matching hero composition with the headline on the left and a
  smoke-lit beige workstation on the right.
- The rounded blue portfolio stage, diagonal 35 mm filmstrip, frame
  perforations, project controls, and eleven-step indicator.
- The endless beige cubicle field and oversized `About Us` page-turn
  transition.
- The cream annual-report layout, editorial typography, two-column copy,
  client spread, and tear-off consultation form.
- The black/blue “Still Not Convinced” interlude, star aperture, golden-tie
  celebration, telephone tableau, and oversized `Good buy.` contact screen.
- CRT scanlines, analog grain, chromatic edge color, vignette, soft bloom, and
  scroll-linked motion response.
- Responsive layouts for desktop, tablet, and mobile, plus semantic HTML and a
  reduced-motion path.

The proprietary production assets are replaced with original images generated
for this repository and code-native CSS artwork. This keeps the composition and
period texture close while making the public repo independently distributable.

## Key-effect implementation analysis

### 1. Original render architecture

**Reference evidence — `SOURCE`:**

- Runtime inspection finds one fixed `<canvas>`.
- The production bundles include Three.js WebGPU/TSL code.
- The scene is rendered to an offscreen target, then composited through
  controls for bloom, noise, sepia, contrast, brightness, saturation, lens
  distortion, motion blur, vignette, and chromatic aberration.
- Seven named phases are present: `hero`, `projects`, `office`, `about-us`,
  `golden-tie-reveal`, `golden-tie`, and `contact`.
- Four transition modes are named: `fade`, `direct`, `overlay`, and `below`.

Bundle hashes and non-code findings are recorded in
[`RECON/source-evidence.json`](./RECON/source-evidence.json). The inspected
production files themselves are excluded.

**Recreation strategy:** rather than copying the private WebGPU scene graph,
this version rebuilds the same reading experience with sticky DOM stages,
original raster scenes, CSS transforms, and a small procedural noise canvas.
The technique is different; the resulting framing, section order, color, and
transition rhythm are intentionally close.

### 2. CRT / VHS composite

Two fixed, pointer-transparent layers sit above the entire page:

1. `.analog-overlay` combines a radial vignette with four-pixel scanlines and
   an inset lens shadow.
2. `#noise` is a low-resolution canvas. Every other animation frame,
   [`src/main.js`](./src/main.js) writes randomized luminance into an
   `ImageData` buffer. CSS scales the buffer with pixelated sampling and blends
   it using `soft-light`.

The source images already contain a restrained analog treatment. The runtime
overlay unifies text, CSS shapes, and images so they appear to pass through the
same display instead of looking like unrelated layers.

**Reference evidence:** original noise, lens, motion-blur, vignette, and
chromatic controls are `SOURCE`. The canvas hash noise and CSS lens stack are
this project’s independent implementation.

### 3. Hero scene and scroll lens response

The hero uses a sticky, viewport-height media layer with a separate semantic
text layer. The computer image is aligned to the right at an explicit height
rather than `cover`; this preserves the reference composition at 16:9 and
lets the headline keep its four-line break.

Scroll delta is low-pass filtered in [`src/main.js`](./src/main.js). The
normalized velocity becomes `--velocity`, which slightly scales the hero and
drives the transition interference. This recreates the original feeling that
the “camera” reacts to wheel momentum without reproducing its proprietary
camera controller.

### 4. Filmstrip portfolio

The work stage is a sticky rounded panel. The filmstrip is built from:

- a flex rail of independent project frames;
- top and bottom pseudo-elements with repeating perforation gradients;
- a rotated perspective container;
- a CSS-variable carousel index changed by the previous/next buttons;
- an eleven-dot indicator synchronized in JavaScript.

The reference bends a 3D strip through depth. This implementation keeps the
same diagonal crop, frame scale, blue lighting, and control placement using
deterministic CSS, so it remains editable without distributing the original
portfolio videos.

### 5. Office-to-paper page turn

The office is another sticky full-screen stage. `About Us` remains pinned over
the repeating cubicle field while a large cream ellipse rises from the bottom.
That ellipse has a warm multi-stop gradient and a broad shadow, producing the
reference site’s curled sheet without a mesh or displacement texture.

Once the sheet fills the viewport, the next section continues with the same
paper color and grain. The eye reads two DOM sections as one continuous
physical page transition.

### 6. Annual-report editorial system

The About section reproduces the original hierarchy rather than merely
borrowing its palette:

- centered, tightly tracked Times-style display headings;
- large cream paper fields with faint horizontal print texture;
- paired editorial columns;
- a deadpan client-logo spread;
- a dashed postal coupon with a cut-line/scissors cue;
- a heavy black call-to-action bar.

The people and marks in `public/media/clients.png` are original generated
artwork; the recognizable company logos from the reference are not copied.

### 7. Star reveal, golden tie, and telephones

The “Still Not Convinced” interlude uses a clipped ten-point star rotated by
normalized document scroll. A repeating radial gradient becomes the wavy
interference field during faster scrolling. The star bridges the black/blue
interlude into the tie celebration, approximating the original star-shaped
reveal.

The tie and telephone sections reuse the reference composition—centered hero
object, generous black negative space, oversized serif type—but use newly
generated people and product imagery:

- [`public/media/golden-tie.png`](./public/media/golden-tie.png)
- [`public/media/phones.png`](./public/media/phones.png)

### 8. Responsive and accessible structure

All important words and links remain real HTML; visual images are decorative
or have descriptive alt text. At small widths the desktop navigation collapses,
display typography reflows, the filmstrip widens beyond the viewport, and the
large scene images switch from width-driven to height-driven crops. Users who
request reduced motion receive instant navigation, no boot transition, and no
animated noise canvas.

## Project assets

The five visual assets below were generated with OpenAI’s built-in image tool
from original prompts written for this recreation, then resized and
palette-compressed locally:

- `hero-crt.png` — smoky beige CRT workstation with left-side copy space.
- `office-grid.png` — endless late-1980s cubicle field.
- `clients.png` — original annual-report people and abstract marks.
- `golden-tie.png` — symmetric corporate celebration tableau.
- `phones.png` — three beige landline phones in a dark studio.

They are located in [`public/media`](./public/media).

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Deploy to Cloudflare Pages

The repository includes [`wrangler.jsonc`](./wrangler.jsonc) and a static
security/cache policy in [`public/_headers`](./public/_headers).

```bash
npx wrangler login
npm run deploy
```

No runtime secrets or server functions are required.

## Evidence and verification

- Original/clone recon: [`RECON`](./RECON)
- Reverse-engineering notes: [`TEARDOWN.md`](./TEARDOWN.md)
- Clone assessment: [`NOTES.md`](./NOTES.md)
- Comparison report: [`CLONE_REPORT.md`](./CLONE_REPORT.md)
- Residue audit: [`CLONE_AUDIT.md`](./CLONE_AUDIT.md)

Current production build passes at 1440, 768, and 390 CSS pixels with zero
captured console or page errors.

## License

The independent implementation and generated replacement artwork in this
repository are MIT licensed. Shader Sweden AB retains all rights to the
original site, brand, and content.
