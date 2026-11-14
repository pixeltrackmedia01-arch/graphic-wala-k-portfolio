#!/usr/bin/env python3
"""
Builds the hero character from the 3 pose renders (white-background PNG/WebP).
 - hello  (pose-10): RIG BASE -> body (hand removed) + hand layer (pivots at wrist) + head layer + eye rig
 - think  (pose-6), point (pose-9): full-figure cut-outs, aligned to the base by eye-midpoint/inter-eye distance
Outputs public/images/character/*.webp + masters *.png, and src/lib/characterRig.ts
Usage: python3 scripts/make_poses.py
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_character import cutout, avg, brightest, hexc, poly_mask  # noqa

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/source"); OUT = os.path.join(ROOT, "public/images/character")
cfg = json.load(open(os.path.join(ROOT, "scripts/pose-rig.config.json")))
os.makedirs(OUT, exist_ok=True)

def eye_mid(p): (a, b) = p["eyeCentres"]; return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), float(np.hypot(b[0] - a[0], b[1] - a[1]))
cuts = {}
for name, p in cfg["poses"].items():
    cuts[name] = cutout(Image.open(os.path.join(SRC, p["file"])), True)

# --- common canvas in BASE-pose pixel space -------------------------------------------------
base = cfg["base"]; bm, bd = eye_mid(cfg["poses"][base])
placed = {}  # name -> (RGBA image scaled, offset x, y in base space)
for name, p in cfg["poses"].items():
    m, d = eye_mid(p); s = bd / d
    im = cuts[name]; im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    ox, oy = bm[0] - m[0] * s, bm[1] - m[1] * s
    placed[name] = (im, ox, oy, s)
def bb(im): return im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
x0 = y0 = 1e9; x1 = y1 = -1e9
for name, (im, ox, oy, s) in placed.items():
    b = bb(im); x0 = min(x0, ox + b[0]); y0 = min(y0, oy + b[1]); x1 = max(x1, ox + b[2]); y1 = max(y1, oy + b[3])
PAD = 6; x0 = int(x0 - PAD); y0 = int(y0 - PAD); x1 = int(x1 + PAD); y1 = int(y1 + PAD); W, H = x1 - x0, y1 - y0
def on_canvas(name):
    im, ox, oy, s = placed[name]; c = Image.new("RGBA", (W, H), (0, 0, 0, 0)); c.alpha_composite(im, (int(round(ox - x0)), int(round(oy - y0)))); return c
def P(x, y): return [round(x - x0, 2), round(y - y0, 2)]
print("canvas", W, "x", H)

rig = {"w": W, "h": H, "poses": {}}
base_c = on_canvas(base); base_c.save(os.path.join(OUT, "mital.png"), optimize=True)
# other poses: whole-figure layers
for name in cfg["poses"]:
    if name == base: continue
    c = on_canvas(name); c.save(os.path.join(OUT, f"mital-{name}.png"), optimize=True)
    c.save(os.path.join(OUT, f"mital-{name}.webp"), quality=88, alpha_quality=95, method=6)
    bbx = bb(c); rig["poses"][name] = {"src": f"/images/character/mital-{name}.webp", "fadeBottom": bool(cfg["poses"][name].get("cropped", False)), "bottom": bbx[3]}

# base: hand layer + body-without-hand + full image (head source)
hp = cfg["hand"]; poly = [[px - x0, py - y0] for px, py in hp["polygon"]]; pv = [hp["pivot"][0] - x0, hp["pivot"][1] - y0]
arr = np.array(base_c).astype(np.float32); body = arr.copy(); hand = arr.copy()
m = poly_mask((W, H), poly, hp["fade"], pv[1])
erase = [[px, min(py, pv[1] - hp.get("keepWrist", 8))] for px, py in poly]
body[..., 3] = arr[..., 3] * (1 - poly_mask((W, H), erase)); hand[..., 3] = arr[..., 3] * m
ys, xs = np.where(hand[..., 3] > 2); hx0, hy0, hx1, hy1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
base_c.save(os.path.join(OUT, "mital.webp"), quality=90, alpha_quality=95, method=6)
Image.fromarray(body.astype(np.uint8), "RGBA").save(os.path.join(OUT, "mital-body.webp"), quality=90, alpha_quality=95, method=6)
Image.fromarray(hand.astype(np.uint8), "RGBA").crop((hx0, hy0, hx1, hy1)).save(os.path.join(OUT, "mital-hand.webp"), quality=92, alpha_quality=98, method=6)
rig.update({"src": "/images/character/mital.webp", "body": "/images/character/mital-body.webp",
            "hand": {"src": "/images/character/mital-hand.webp", "x": int(hx0), "y": int(hy0), "w": int(hx1 - hx0), "h": int(hy1 - hy0), "pivot": [round(pv[0], 1), round(pv[1], 1)]}})

# eyes (colours sampled from the source render)
src = Image.open(os.path.join(SRC, cfg["poses"][base]["file"])).convert("RGB"); eyes = {}
for k, e in cfg["eyes"].items():
    ix, iy, ir = e["iris"]; ox, oy, rx, ry, rot = e["open"]
    fold = avg(src, e["lidSample"], 1); cheek = avg(src, e["cheekSample"], 1); scl = brightest(src, e["scleraSample"], 3)
    eyes[k] = {"iris": {"cx": P(ix, iy)[0], "cy": P(ix, iy)[1], "r": ir}, "open": {"cx": P(ox, oy)[0], "cy": P(ox, oy)[1], "rx": rx, "ry": ry, "rot": rot},
               "lidTop": hexc(fold * 0.8 + cheek * 0.2), "lidBottom": hexc(cheek), "lash": hexc(cheek * 0.35),
               "scleraTop": hexc(scl * 0.86), "scleraBottom": hexc(np.minimum(scl * 0.96, 255))}
n = cfg["neck"]
rig.update({"cutTop": round(n["cutTop"] - y0, 1), "cutBottom": round(n["cutBottom"] - y0, 1), "pivot": P(n["pivotX"], n["pivotY"]), "eyes": eyes,
            "face": P(*cfg["faceCentre"])})
open(os.path.join(ROOT, "src/lib/characterRig.ts"), "w").write("// GENERATED by scripts/make_poses.py — do not edit by hand.\nexport const RIG = " + json.dumps(rig, indent=2) + " as const;\n")
for f in sorted(os.listdir(OUT)): print(" ", f, os.path.getsize(os.path.join(OUT, f)) // 1024, "KB")
