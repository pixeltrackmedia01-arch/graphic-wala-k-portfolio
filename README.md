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

## AI resume assistant + contact (server-side)
Copy `.env.example` to `.env.local` (or set the variables in Vercel → Settings → Environment Variables):

| Variable | Needed for |
|---|---|
| `ANTHROPIC_API_KEY` | AI answers (`/api/chat`). Without it the widget says the AI isn't connected. |
| `ANTHROPIC_MODEL` | optional, default `claude-haiku-5-5` |
| `RESEND_API_KEY` | sending the contact form as email (`/api/contact`) |
| `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` | optional recipient / verified sender |

Keys are read only on the server and never reach browser JavaScript.
