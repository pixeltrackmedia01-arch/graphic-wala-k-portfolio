# Mital Chikhaliya — Performance Marketing Portfolio

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Motion · Lucide

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Edit content
`src/lib/content.ts` — profile, LinkedIn, experience, skills, funnel copy, PDF paths.
`src/lib/knowledge.ts` — the resume knowledge base the AI assistant answers from (keep it identical to the resume).

## Campaign PDFs
`public/portfolio/d2c-campaign.pdf` and `public/portfolio/lead-generation.pdf` are the original files. The two campaign cards open them in a new tab. They must be part of every deployment.

## Hero character
Source images (two poses, same camera): `scripts/source/mital-pose-stand.webp` and `mital-pose-wave.webp`.
```bash
pip install rembg onnxruntime pymatting scipy pillow numpy
# 1) measure eyes/neck in SOURCE pixels -> scripts/character-rig.config.json
# 2) build transparent cut-out + rig data
python3 scripts/make_character.py scripts/source/mital-pose-stand.webp scripts/source/mital-pose-wave.webp
```
Outputs `public/images/character/mital.png` (master transparent PNG), `mital.webp` (what the site loads) and `src/lib/characterRig.ts`.

## Floating assistant
A small floating avatar (bottom-right) appears after the Hero is scrolled past; tapping her shows the published phone number as a `tel:` link. The earlier AI chat widget and its API routes were removed, so no environment variables are needed.
