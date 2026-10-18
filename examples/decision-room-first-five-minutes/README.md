# Decision Room: The First Five Minutes

A 42-second, 1080 × 1080 LinkedIn teaser for Maman Ibrahim's proposed **Decision Room: Authority Under Pressure** exercise.

The teaser stages a privileged-account incident with incomplete evidence, conflicting recommendations, and an unavailable CISO. It asks who has authority, what can happen now, when to escalate, and who owns the remaining risk. It is a discussion prompt, not an official exercise brief or incident-response instruction.

## Files

- `build_video.py`: reproducible FFmpeg and Pillow build script
- `voiceover.txt`: narration script for a later voiced version

The rendered MP4 and generated scene frames are delivery artifacts and are kept out of normal Git history.

## Build

Requires Python 3, Pillow, FFmpeg, and DejaVu Sans fonts at `/usr/share/fonts/truetype/dejavu/`.

From this directory, run:

```bash
python3 build_video.py
```

The script creates `scenes/`, its intermediate clips, and `Decision_Room_First_Five_Minutes.mp4` beside the source file.

The film is a concept teaser. It does not prescribe containment actions or claim to represent a real incident.
