# Portfolio v2 — refined build prompt

Act as a senior product designer, creative technologist and full-stack developer. Upgrade the existing static portfolio for Mital Chikhaliya (Performance Marketing Lead). The resume is the only source of truth: never invent clients, results, dates or credentials, and keep every metric's original context. Use neutral wording for pronouns that are not stated.

## 1. Characters (three supplied 3D renders)
- **Seated character (hero):** head turns toward the cursor, body leans and breathes, blinks, reacts to hover. After ~8s without activity she falls asleep: eyelids close, head droops, Z-Z-Z float up.
- **Waving character (greeter):** on any activity (move, tap, key, real scroll) after sleep, or on first load, she pops in suddenly with a burst animation and says hello. First visit: "Hi, I'm Mital! Welcome". Returning visitor (localStorage flag): the page starts with the seated character asleep, then "Welcome back!". She leaves after a few seconds and the seated character is awake again.
- **Phone character (guide, bottom-left, transparent cut-out):** always follows the cursor and comments on the section being read, with a link to the next stop. Dismissible and remembered.
- All three follow the pointer. Hovering/clicking makes them react.

## 2. New sections and widgets
- **Playbook (below Experience):** interactive funnel, Awareness (TOFU) → Engagement and Consideration (MOFU) → Purchase (BOFU), with flowing particles. Each stage: goal, how I think, first question, channels and tactics, metrics watched, link to the relevant calculator. Plus "first moves on any new project". Framed as a general approach.
- **Toolkit:** live calculators for ROAS and break-even, ROI, blended ROAS (MER), margin and break-even CAC, CTR/CPC/CPM/CVR/CPA, LTV:CAC. Verdict text, reset, copy result. Clearly labelled sample numbers.
- **Scroll-depth meter (bottom-right):** progress ring with percentage and 25/50/75/100 milestones; click returns to top.

## 3. Motion graphics
Spinning badge, floating shapes, morphing frame shape, two opposing marquees, metric count-up, section underline draws, 3D card tilt, magnetic buttons, cursor halo, timeline progress, pulsing live-role dot, drifting contact glow.

## 4. Non-negotiables
Everything works by keyboard and touch; visible focus; ARIA tabs for funnel and calculators; no horizontal overflow from 360px up; prefers-reduced-motion disables tracking, particles, halo and bursts (sleep/wake states and messages still work); no console errors; no content hidden when JS fails.
