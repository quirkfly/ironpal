#!/usr/bin/env bash
# The page's pictures of Peter: frames of the film, cropped per slot (plan §3.1-3.2).
# Crops are centred on the measured subject; gallery = square, founder = 4:5, the rest 16:9.
set -euo pipefail
C=~/job_stuff/prj/geggen/products/ironpal/clips
A=/home/quirkfly/job_stuff/prj/ironpal/web/public/assets/peter
W=/home/quirkfly/job_stuff/prj/ironpal/input/kickstarter/web
V=/home/quirkfly/job_stuff/prj/ironpal/web/public/video
mkdir -p "$A" "$V"
still(){ # still SRC T OUT [crop-filter]
  ffmpeg -loglevel error -y -ss "$2" -i "$1" -frames:v 1 -vf "${4:-null},scale='min(iw,1920)':-2" -q:v 3 "$3"
}
still "$C/web/K5.mp4" 6.5 "$A/peter-band-to-lens.jpg"
still "$C/web/K5.mp4" 3.0 "$A/peter-band-out.jpg"     "crop=1080:1080:406:0"      # square, subject centre 946
still "$C/K1.mp4"     6.5 "$A/peter-walk-in.jpg"      "crop=1080:1080:420:0"      # square, centred walk-in
still "$C/K2.mp4"     3.0 "$A/peter-talking.jpg"      "crop=864:1080:528:0"       # 4:5 portrait
still "$C/K3_composed.mp4" 4.0 "$A/peter-typing.jpg"
still "$W/k7_masked.mp4" 1.62 "$A/peter-curl.jpg"      "crop=1080:1080:50:0,eq=brightness=0.05:contrast=1.06:saturation=1.05"  # mid-curl, calm face; mild lift, the K7 plate is the darkest of the three, from the MASKED plate — the ghost at x 780-1000 sits inside this crop
still "$C/web/K8.mp4" 2.0 "$A/peter-squat.jpg"        "crop=1080:1080:526:0"      # square, subject centre 1066
still "$C/K9.mp4"     7.0 "$A/peter-close.jpg"
still "$C/K9.mp4"     4.0 "$A/peter-walk-band.jpg"
# share card 1200x630 from the close-up
ffmpeg -loglevel error -y -ss 7.0 -i "$C/K9.mp4" -frames:v 1 -vf "crop=1920:1008:0:36,scale=1200:630" -q:v 3 \
  /home/quirkfly/job_stuff/prj/ironpal/web/public/og.jpg
# poster for the hero video = band to the lens
ffmpeg -loglevel error -y -ss 6.5 -i "$C/web/K5.mp4" -frames:v 1 -q:v 4 "$V/hero-poster.jpg"
# the K8 figure for the live screen (already background-removed)
cp /home/quirkfly/job_stuff/prj/ironpal/input/kickstarter/k8/k8_figure.png /home/quirkfly/job_stuff/prj/ironpal/web/public/assets/k8-figure.png
ls -la "$A" "$V" /home/quirkfly/job_stuff/prj/ironpal/web/public/og.jpg
