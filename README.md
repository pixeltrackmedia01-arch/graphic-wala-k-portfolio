# Mital Chikhaliya — Portfolio

Static site (HTML + CSS + vanilla JS, no build step).

- Preview: `python3 -m http.server 8000` then open http://localhost:8000
- Portrait: save the photo as `assets/mital-portrait.jpg` (about 4:5). Until then the hero shows a labeled placeholder.
- Content lives in `index.html` (one section per resume block); styling tokens are at the top of `styles.css`.

## Interactive hero character
`character.js` drives the portrait: head and body follow the cursor, she falls asleep (closed eyes, Zzz) after 8s idle (`IDLE_MS`), and wakes with a greeting on any movement, tap or key. Returning visitors (localStorage flag `mc_seen`) start asleep and get "Welcome back". Reduced-motion users get no tracking, only the sleep/wake states.
