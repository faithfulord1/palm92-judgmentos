# Decision Room: The First Five Minutes

A 42-second square LinkedIn teaser for Maman Ibrahim's proposed **Decision Room: Authority Under Pressure** exercise.

## Files

- `Decision_Room_First_Five_Minutes.mp4`: playable 1080 × 1080 video with on-screen captions and an original low-volume suspense pulse. It has no recorded voice narration.
- `voiceover.txt`: narration script for a future voiced cut.
- `build_video.py`: reproducible FFmpeg/Pillow build script. It creates its `scenes/` working directory automatically.

## Build

Requires Python 3, Pillow, and FFmpeg. From this directory, run:

```bash
python3 build_video.py
```

The script writes the MP4 beside itself and uses `scenes/` for generated images, clips, and audio. It uses DejaVu Sans fonts at `/usr/share/fonts/truetype/dejavu/`; change `font_path` and `bold_path` in the script if those fonts are installed elsewhere.

This is a concept teaser, not an official exercise brief or incident-response instruction. It raises discussion questions and does not prescribe containment actions.
