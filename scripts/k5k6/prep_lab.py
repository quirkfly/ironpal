"""Prepare the founder's lab photo for K5/K6: upright and cropped to 16:9, NOT blurred.

The founder's direction (2026-10-07): use the photo as it is, screens and all. The only changes are
the EXIF rotation and a 16:9 crop at 1920x1080 for Flow's frame reference and the K6 still.
See docs/K5_K6_build_clips_design_plan.md §2.1.
"""
import os
from PIL import Image, ImageOps

D = os.path.join(os.path.dirname(__file__), "../../input/kickstarter/k5k6")
im = ImageOps.exif_transpose(Image.open(os.path.join(D, "lab_reference.jpg"))).convert("RGB")
W, H = im.size
ch = int(W * 9 / 16)
top = min(int(230 * W / 1600), H - ch)  # keeps all five screens and the desk front in frame
frame = im.crop((0, top, W, top + ch)).resize((1920, 1080), Image.LANCZOS)
frame.save(os.path.join(D, "lab_reference_flow_16x9.jpg"), quality=95)
im.save(os.path.join(D, "lab_broll_still.jpg"), quality=95)
