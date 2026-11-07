# Mital Chikhaliya — Portfolio

Static site (HTML + CSS + vanilla JS, no build step).

- Preview: `python3 -m http.server 8000` then open http://localhost:8000
- Characters: `assets/char-seated.jpg`, `assets/char-wave.jpg` (hero scenes) and `assets/guide-phone.png` (transparent cut-out for the corner guide).
- Content lives in `index.html`; funnel copy is in `fx.js`, calculators in `tools.js`, characters and guide tips in `characters.js`. Design tokens are at the top of `styles.css`; new components are in `extras.css`.
- The refined build prompt is in `docs/PROMPT-v2.md`.

## Interactive characters
`characters.js` drives three layered characters: the seated hero follows the cursor and falls asleep after 8s idle (`IDLE_MS`, Zzz); any activity makes the waving character pop in with a greeting; the phone character is a section-aware guide bottom-left. Returning visitors (localStorage `mc_seen`) start asleep. Reduced-motion users get no tracking, only the sleep/wake states.
