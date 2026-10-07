"""Blur every screen in the founder's lab photo so Flow gets the room without legible text.

The original (input/kickstarter/k5k6/lab_reference.jpg, A52, 2026-10-07 18:17) shows code, a terminal
and the landing page. Flow either garbles legible text into pseudo-text or paints a fake app, so the
reference it gets has each screen blurred to a glow, then cropped to 16:9 at 1920x1080.
Masks are in 1600-px-wide preview coordinates, scaled to the source. See
docs/K5_K6_build_clips_design_plan.md §2.1.
"""
import os
D = os.path.join(os.path.dirname(__file__), "../../input/kickstarter/k5k6")
IN = os.path.join(D, "lab_reference.jpg")
OUT_BLUR = os.path.join(D, "lab_reference_screens_blurred.jpg")
OUT_FLOW = os.path.join(D, "lab_reference_flow_16x9.jpg")
from PIL import Image, ImageOps, ImageFilter, ImageDraw
im=ImageOps.exif_transpose(Image.open(IN)).convert('RGB')
W,H=im.size; s=W/1600
# masks for the 2026-10-07 18:17 photo (20261007_181724.jpg); re-measure if the photo changes
rects=[(405,305,785,520),(1000,270,1305,565),(500,535,855,750),(852,540,1260,835)]
lap=[(0,795),(300,728),(368,935),(130,1060),(0,1070)]
blur=im.filter(ImageFilter.GaussianBlur(int(40*s)))
mask=Image.new('L',im.size,0); d=ImageDraw.Draw(mask)
for r in rects: d.rectangle([int(v*s) for v in r],fill=255)
d.polygon([(int(x*s),int(y*s)) for x,y in lap],fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(int(6*s)))
out=Image.composite(blur,im,mask); out.save(OUT_BLUR,quality=92)
ch=int(W*9/16); top=min(int(230*s),H-ch)
fl=out.crop((0,top,W,top+ch)).resize((1920,1080),Image.LANCZOS); fl.save(OUT_FLOW,quality=92)

# The B-roll still for K6 shot 1b: the ORIGINAL room, real screens kept, with only the wall
# terminal (local paths, another project's logs) and the laptop session blurred for privacy.
OUT_BROLL = os.path.join(D, "lab_broll_still.jpg")
m2 = Image.new('L', im.size, 0); d2 = ImageDraw.Draw(m2)
d2.rectangle([int(v*s) for v in rects[1]], fill=255)
d2.polygon([(int(x*s), int(y*s)) for x, y in lap], fill=255)
m2 = m2.filter(ImageFilter.GaussianBlur(int(6*s)))
Image.composite(blur, im, m2).save(OUT_BROLL, quality=92)
