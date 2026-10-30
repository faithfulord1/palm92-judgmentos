#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
python3 make_short_portable.py
ffmpeg -y -hide_banner -loglevel error \
  -f lavfi -i "flite=textfile=$ROOT/narration.txt:voice=slt" \
  -ar 44100 -ac 2 "$ROOT/build/narration.wav"
ffmpeg -y -hide_banner -loglevel error \
  -i "$ROOT/build/palm92_ai_safeguards_video_noaudio.mp4" \
  -i "$ROOT/build/narration.wav" -i "$ROOT/build/ambient.wav" \
  -filter_complex '[1:a]volume=1.35[n];[2:a]volume=0.22[m];[n][m]amix=inputs=2:duration=first:dropout_transition=0,alimiter=limit=0.94[a]' \
  -map 0:v:0 -map '[a]' -t 30.4 \
  -vf 'scale=720:1280:flags=lanczos,format=yuv420p' \
  -c:v libx264 -profile:v baseline -level 3.1 -preset medium -crf 22 -r 25 \
  -pix_fmt yuv420p -x264-params 'ref=1:bframes=0' \
  -c:a aac -profile:a aac_low -b:a 128k -ar 44100 -ac 2 \
  -movflags +faststart "$ROOT/palm92_ai_safeguards_video_mobile.mp4"
