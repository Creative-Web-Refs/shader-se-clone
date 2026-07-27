# Shader.se · original vs clean-room recreation

## Conclusion

- Complexity: **L5** — realtime 3D, GPU post-processing, custom scroll
  timeline, project media, and interactive carousel.
- Mode: **clean-room visual recreation**.
- Result: the recreation preserves the single-canvas storytelling model,
  analog corporate-video finish, and scroll-driven scene rhythm without
  redistributing proprietary source or assets.
- Best use: deployed technical reference and an editable starting point for
  original WebGL work—not a drop-in copy of Shader Sweden’s website.

## Comparison

| Dimension | Original | Recreation | Assessment |
|---|---|---|---|
| Information architecture | Hidden semantic home/work/about/contact layer plus project routes | Visible semantic home/work/about/contact narrative | Same core arc; project detail routes intentionally omitted |
| Visual language | 1980s corporate training tape, 3D scenes, strong CRT finish | Original Circuit Office brand, procedural scenes, CRT composite | Visual grammar retained; art and copy replaced |
| Rendering | Next.js + Three.js WebGPU/TSL | Vite + Three.js WebGL/GLSL | Same render-to-texture principle, broader runtime |
| Motion | Seven configured phases, four transition modes | Six phases, smoothstep crossfade | Core scroll coupling retained; proprietary transitions simplified |
| Responsive | Custom fixed-canvas experience | 1440/768/390 verified | No layout break observed |
| Content | Shader Sweden portfolio and contact data | Fictional work and contact copy | Fully replaced |
| Tracking | First-party analytics request observed | No analytics or tracking | Removed |

## Evidence

- Original recon: `RECON/original-recon.json`
- Clone recon: `RECON/clone-recon.json`
- Runtime and bundle-hash findings: `RECON/source-evidence.json`
- Clone interaction probe: 16 automated actions; no console/page errors
- Original interaction probe: unavailable after repeated tunnel failures; this
  gap is not represented as a successful test
- Clone console: **0 errors, 0 page errors** at 1440, 768, and 390
- Route maps: original 2 public routes discovered; recreation 1 route

The automated pixel diff reports a 0.985 changed-pixel ratio, but it is not a
meaningful fidelity score: the original capture is its 900px loading viewport
while the recreation capture is a 7605px full-page image, and the recreation is
intentionally rebranded. It is preserved only as raw evidence.

## Score

- Source evidence: **4/5** — runtime signals and production-bundle hashes;
  no public source repository/source map.
- Structural fidelity: **3/5** — core single-page arc retained; detail routes
  omitted.
- Visual fidelity: **3/5** — analog grammar and scene composition retained;
  assets/layout are intentionally original.
- Motion/interaction: **4/5** — scroll scenes, DOM synchronization, post
  interpolation, and navigation work; carousel/route transitions simplified.
- Responsive: **4/5** — three widths captured and browser-tested.
- Functional completeness: **4/5** — core browsing path is complete; fictional
  mail contact and no project details.
- Content replacement: **5/5** — brand, copy, geometry, media, and contact
  content are original.
- Legal/deploy risk: **4/5** — original code/media excluded, attribution and
  non-affiliation statement included; visual-study status remains explicit.

**Total: 31/40.**

## Known gaps

- No faithful recreation of the original project carousel, Prismic content,
  Mux video surfaces, or project detail pages.
- WebGL is used instead of the original WebGPU/TSL path.
- Bloom/sepia/saturation are approximated within a compact single composite
  instead of rebuilding the original multi-node graph.
- Synthetic interaction probing could not reach the original site reliably;
  original scroll behavior is supported by runtime inspection and configuration
  evidence rather than a completed automated interaction trace.
