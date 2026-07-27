# Shader.se · original vs recreation

## Conclusion

- Complexity: **L5** — custom scroll, realtime 3D, GPU post-processing,
  project media, and non-standard transitions.
- Mode: **clean-room high-fidelity visual recreation**.
- Result: the recreation now follows the original homepage’s compositions,
  section order, typography, colors, and visual reveals instead of substituting
  an unrelated fictional studio.
- Protected production code and media remain excluded; original generated
  replacement scenes are used for the public repository.

## Comparison

| Dimension | Original | Recreation | Assessment |
|---|---|---|---|
| Information architecture | Home / Selected Work / About Us / Contact | Same one-page arc and visible copy hierarchy | High |
| Hero | Smoky workstation, four-line serif heading | Original workstation asset, matching crop and line breaks | High |
| Portfolio | Blue rounded stage and curved 3D filmstrip | Blue sticky stage and CSS perspective filmstrip | Medium-high |
| Office transition | Repeating 3D cubicles and curled paper | Original cubicle image and CSS page curl | High at keyframe |
| About | Cream annual report, clients, coupon | Same editorial grid with replacement people/marks | High structure, medium assets |
| Golden tie / phone | Original models and keyed people | New generated tie/people/phone scenes | High composition |
| Post-processing | WebGPU/TSL composite | Canvas grain + CSS CRT stack | High visual tone |
| Responsive | Fixed-canvas custom adaptation | 1440/768/390 responsive CSS | Verified |

## Evidence

- Original recon: `RECON/original-recon.json`
- Runtime/bundle-hash findings: `RECON/source-evidence.json`
- Updated recreation screenshots:
  - `RECON/screenshots/clone-1440.png`
  - `RECON/screenshots/clone-768.png`
  - `RECON/screenshots/clone-390.png`
- Current production build: zero console and page errors at all three widths
- Audit: no analytics or tracking; all original production media excluded

## Score

- Source evidence: **5/5**
- Structural fidelity: **5/5**
- Visual fidelity: **4/5**
- Motion/interaction: **4/5**
- Responsive: **4/5**
- Functional completeness: **4/5**
- Clean-room asset handling: **5/5**
- Deploy readiness: **5/5**

**Total: 36/40.**

## Known gaps

- CSS 2.5D approximates the original WebGPU film curve and mesh transitions.
- Project detail routes and Mux portfolio videos are intentionally omitted.
- Generated people, office, workstation, tie, and telephones preserve the
  composition but are not the original copyrighted assets.
