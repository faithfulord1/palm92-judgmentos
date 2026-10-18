# Decision Room: The First Five Minutes

A 42-second, square 1080p concept teaser for Maman Ibrahim's proposed **Decision Room: Authority Under Pressure** exercise. This media asset sits with the Palm92 JudgmentOS portfolio because it explores authority, escalation and accountable decisions under time pressure.

## Preview

[Watch the MP4](Decision_Room_First_Five_Minutes.mp4)

The preview contains animated text panels and an original, generated suspense pulse. It has no spoken narration. `voiceover.txt` is a narration draft for a future voiced cut.

## Contents

- `Decision_Room_First_Five_Minutes.mp4`: H.264/AAC, 1080x1080, 42 seconds
- `build_video.py`: reproducible FFmpeg and Pillow build script
- `voiceover.txt`: narration draft

## Rebuild

Install Python 3, Pillow and FFmpeg. The script uses DejaVu Sans at `/usr/share/fonts/truetype/dejavu/`. Then run:

```bash
python3 build_video.py
```

The script creates its `scenes/` working folder and writes the MP4 beside itself.

## Scope

The scenario is fictional and illustrative. The teaser is not an official exercise brief, an incident-response playbook or operational security advice. It does not prescribe containment actions or claim to describe a real incident.
