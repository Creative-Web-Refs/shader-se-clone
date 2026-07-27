# clone interaction probe

- URL: http://127.0.0.1:4173/
- Actions: 16
- Console errors: 0
- Network events: 0

## Actions
| # | Type | Target | Changed | URL after | Screenshot |
|---:|---|---|---:|---|---|
| 1 | scroll | middle | yes | http://127.0.0.1:4173/ | screenshots/01-scroll-middle-b04a45f075.png |
| 2 | scroll | bottom | yes | http://127.0.0.1:4173/ | screenshots/02-scroll-bottom-7297e0cbea.png |
| 3 | hover | Skip to content | no | http://127.0.0.1:4173/ |  |
| 4 | hover | CIRCUIT OFFICE | no | http://127.0.0.1:4173/ | screenshots/04-hover-CIRCUIT-OFFICE-0c102713c1.png |
| 5 | hover | WORK | no | http://127.0.0.1:4173/ | screenshots/05-hover-WORK-a0ea0d6ded.png |
| 6 | hover | ABOUT | no | http://127.0.0.1:4173/ | screenshots/06-hover-ABOUT-f50e057b68.png |
| 7 | hover | CONTACT | no | http://127.0.0.1:4173/ | screenshots/07-hover-CONTACT-2e5ccfffe7.png |
| 8 | hover | OPEN A LINE ↗ | no | http://127.0.0.1:4173/ | screenshots/08-hover-OPEN-A-LINE-63fa7d377a.png |
| 9 | hover | GENERAL ENQUIRIES studio@example.com | yes | http://127.0.0.1:4173/ | screenshots/09-hover-GENERAL-ENQUIRIES-studio-example.com-b902bb7921.png |
| 10 | hover | SOURCE ARCHIVE Creative-Web-Refs ↗ | yes | http://127.0.0.1:4173/ | screenshots/10-hover-SOURCE-ARCHIVE-Creative-Web-Refs-e9dff9a3af.png |
| 11 | click | Skip to content | no | http://127.0.0.1:4173/ |  |
| 12 | click | CIRCUIT OFFICE | yes | http://127.0.0.1:4173/#home | screenshots/12-click-CIRCUIT-OFFICE-1268aa0511.png |
| 13 | click | WORK | yes | http://127.0.0.1:4173/#work | screenshots/13-click-WORK-d817b74087.png |
| 14 | click | ABOUT | yes | http://127.0.0.1:4173/#about | screenshots/14-click-ABOUT-fbc7ea9fac.png |
| 15 | click | CONTACT | yes | http://127.0.0.1:4173/#contact | screenshots/15-click-CONTACT-ccc1a4f10b.png |
| 16 | canvas-drag | #scene | no | http://127.0.0.1:4173/ | screenshots/16-canvas-drag--scene-0826edc8e9.png |

## Findings
- 8 visible interactive candidates discovered
- 1 visible canvas targets discovered
- 8/16 actions changed DOM, URL, scroll, or visible overlay counts
- Canvas drag evidence exists; inspect screenshots before simplifying WebGL/Canvas behavior.
