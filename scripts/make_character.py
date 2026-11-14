#!/usr/bin/env python3
"""
Builds the hero character assets from one or two pose images (same camera / same body):
  1. Removes the background (rembg / isnet-general-use) -> genuine transparent cutout, keeps hair, hands, dress, legs and shoes.
  2. Cleans edge halos, trims to the character (with padding, nothing cropped).
  3. Writes public/images/character/mital.png  (master transparent PNG)
            public/images/character/mital.webp (optimised alpha WebP actually loaded by the site)
            src/lib/characterRig.ts            (eye / head rig coordinates for the interactive layers)
Usage:  python3 scripts/make_character.py <stand-pose-image> [<wave-pose-image>]
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public/images/character")
PAD = 8

def cutout(img: Image.Image, use_rembg: bool) -> Image.Image:
    if img.mode == "RGBA" and (np.array(img)[..., 3] < 250).mean() > 0.05:
        return img  # already transparent
    rgb = img.convert("RGB")
    if not use_rembg:
        raise SystemExit("source has no alpha and --no-rembg was given")
    from rembg import remove, new_session
    out = remove(rgb, session=new_session("isnet-general-use"))
    a = np.array(out)[..., 3].astype(np.float32) / 255
    # keep only the main body (drop specks / floor remnants), fill pin-holes
    lab, n = ndi.label(a > 0.5)
    if n > 1:
        sizes = ndi.sum(a > 0.5, lab, range(1, n + 1))
        keep = [i + 1 for i, s in enumerate(sizes) if s > 0.02 * sizes.max()]
        mask = np.isin(lab, keep)
        a = a * ndi.binary_dilation(mask, iterations=3)
    # fill only tiny pin-holes; large enclosed gaps (arm/torso, hair) must stay transparent
    holes = ndi.binary_fill_holes(a > 0.5) & ~(a > 0.5)
    hl, hn = ndi.label(holes)
    if hn:
        areas = ndi.sum(holes, hl, range(1, hn + 1))
        small = np.isin(hl, [i + 1 for i, ar in enumerate(areas) if ar < 60])
        a = np.where(small, 1.0, a)
    # background-coloured pixels (white studio backdrop seen through gaps between arms/torso/hair)
    # that the model left semi-opaque -> fully transparent
    arr = np.array(rgb).astype(np.int16)
    light = (arr.min(axis=2) > 218) & ((arr.max(axis=2) - arr.min(axis=2)) < 16)
    a = np.where(light & (a < 0.97), 0.0, a)
    # leftovers of a baked-in grey/white checkerboard: neutral (no colour cast) mid-light pixels that are still semi-transparent
    neutral = ((arr.max(axis=2) - arr.min(axis=2)) < 10) & (arr.min(axis=2) > 140)
    a = np.where(neutral & (a < 0.97), 0.0, a)
    # tighten soft alpha so no pale haze survives, then 1px inward trim + soften
    t = np.clip((a - 0.14) / 0.72, 0, 1)
    a = t * t * (3 - 2 * t)
    a = ndi.grey_erosion(a, size=(3, 3))
    a = ndi.gaussian_filter(a, 0.6)
    # replace edge colours with estimated pure foreground colours
    try:
        from pymatting import estimate_foreground_ml
        fg = estimate_foreground_ml(np.array(rgb, dtype=np.float64) / 255, a.astype(np.float64))
        rgb_arr = (np.clip(fg, 0, 1) * 255).astype(np.uint8)
    except Exception as e:
        print("foreground estimation skipped:", e)
        rgb_arr = np.array(rgb)
    res = np.dstack([rgb_arr, (np.clip(a, 0, 1) * 255).astype(np.uint8)])
    return Image.fromarray(res, "RGBA")

def avg(img, xy, r=1):
    x, y = int(round(xy[0])), int(round(xy[1]))
    px = np.array(img.convert("RGB"))[y - r:y + r + 1, x - r:x + r + 1].reshape(-1, 3)
    return px.mean(axis=0)

def brightest(img, xy, r=3):
    """brightest (sclera-like) colour near a point"""
    x, y = int(round(xy[0])), int(round(xy[1]))
    px = np.array(img.convert("RGB"))[y - r:y + r + 1, x - r:x + r + 1].reshape(-1, 3).astype(float)
    return px[px.sum(axis=1).argsort()[-max(3, len(px) // 8):]].mean(axis=0)

def hexc(c):
    return "#%02x%02x%02x" % tuple(int(max(0, min(255, v))) for v in c)

def poly_mask(size, poly, feather_bottom=0, bottom_y=None):
    from PIL import ImageDraw
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).polygon([tuple(p) for p in poly], fill=255)
    a = np.array(m).astype(np.float32) / 255
    if feather_bottom and bottom_y is not None:
        ys = np.arange(size[1])[:, None]
        a = a * np.clip(1 - (ys - bottom_y) / feather_bottom, 0, 1)
    return a

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        raise SystemExit(__doc__)
    cfg = json.load(open(os.path.join(ROOT, "scripts/character-rig.config.json")))
    stand_src = Image.open(args[0])
    wave_src = Image.open(args[1]) if len(args) > 1 else None
    stand = cutout(stand_src, True)
    wave = cutout(wave_src, True) if wave_src is not None else None
    # one shared crop box so both poses stay pixel-aligned
    def bb(im): return im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    boxes = [bb(stand)] + ([bb(wave)] if wave is not None else [])
    x0 = max(0, min(b[0] for b in boxes) - PAD); y0 = max(0, min(b[1] for b in boxes) - PAD)
    x1 = min(stand.width, max(b[2] for b in boxes) + PAD); y1 = min(stand.height, max(b[3] for b in boxes) + PAD)
    crop = lambda im: im.crop((x0, y0, x1, y1))
    stand_c = crop(stand); W, H = stand_c.size
    os.makedirs(OUT, exist_ok=True)
    stand_c.save(os.path.join(OUT, "mital.png"), optimize=True)           # master transparent PNG (standing)
    stand_c.save(os.path.join(OUT, "mital.webp"), quality=90, alpha_quality=95, method=6)
    print("crop", (x0, y0, x1, y1), "->", W, "x", H)
    rig = {"src": "/images/character/mital.webp", "w": W, "h": H}

    if wave is not None:
        wave_c = crop(wave)
        wave_c.save(os.path.join(OUT, "mital-wave.png"), optimize=True)    # master transparent PNG (waving)
        hp = cfg["hand"]; poly = [[px - x0, py - y0] for px, py in hp["polygon"]]
        pv = [hp["pivot"][0] - x0, hp["pivot"][1] - y0]
        m = poly_mask((W, H), poly, hp["fade"], pv[1])
        arr = np.array(wave_c).astype(np.float32)
        body = arr.copy(); hand = arr.copy()
        # body keeps a few px of wrist ABOVE the pivot so the rotating hand never exposes a gap
        keep = hp.get("keepWrist", 8)
        erase_poly = [[px, min(py, pv[1] - keep)] for px, py in poly]
        hard = poly_mask((W, H), erase_poly)
        body[..., 3] = arr[..., 3] * (1 - hard)          # body layer: hand region erased
        hand[..., 3] = arr[..., 3] * m                   # hand layer: hand + short feather below the wrist
        ys, xs = np.where(hand[..., 3] > 2); hx0, hy0, hx1, hy1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        Image.fromarray(body.astype(np.uint8), "RGBA").save(os.path.join(OUT, "mital-wave-body.webp"), quality=90, alpha_quality=95, method=6)
        Image.fromarray(hand.astype(np.uint8), "RGBA").crop((hx0, hy0, hx1, hy1)).save(os.path.join(OUT, "mital-wave-hand.webp"), quality=92, alpha_quality=98, method=6)
        rig["waveBody"] = "/images/character/mital-wave-body.webp"
        rig["waveHand"] = {"src": "/images/character/mital-wave-hand.webp", "x": int(hx0), "y": int(hy0), "w": int(hx1 - hx0), "h": int(hy1 - hy0), "pivot": [round(pv[0], 1), round(pv[1], 1)]}

    src_rgb = stand_src.convert("RGB")
    def p(x, y): return [round(x - x0, 2), round(y - y0, 2)]
    eyes = {}
    for k, e in cfg["eyes"].items():
        ix, iy, ir = e["iris"]; ox, oy, rx, ry, rot = e["open"]
        fold = avg(src_rgb, e["lidSample"], 1); cheek = avg(src_rgb, e["cheekSample"], 1); scl = brightest(src_rgb, e["scleraSample"], 3)
        eyes[k] = {
            "iris": {"cx": p(ix, iy)[0], "cy": p(ix, iy)[1], "r": ir},
            "open": {"cx": p(ox, oy)[0], "cy": p(ox, oy)[1], "rx": rx, "ry": ry, "rot": rot},
            "lidTop": hexc(fold * 0.78 + cheek * 0.22), "lidBottom": hexc(cheek), "lash": hexc(cheek * 0.4),
            "scleraTop": hexc(scl * 0.78), "scleraBottom": hexc(np.minimum(scl * 0.9, 255)),
        }
    n = cfg["neck"]
    rig.update({"cutTop": round(n["cutTop"] - y0, 1), "cutBottom": round(n["cutBottom"] - y0, 1), "pivot": p(n["pivotX"], n["pivotY"]), "eyes": eyes})
    with open(os.path.join(ROOT, "src/lib/characterRig.ts"), "w") as f:
        f.write("// GENERATED by scripts/make_character.py — do not edit by hand.\nexport const RIG = " + json.dumps(rig, indent=2) + " as const;\n")
    for fn in sorted(os.listdir(OUT)): print(" ", fn, os.path.getsize(os.path.join(OUT, fn)) // 1024, "KB")

main()
