# Palm92 AI safeguards video: Plan B

A 30.4-second vertical explainer about evidence-based AI assurance. The final MP4 is encoded for broad phone compatibility (H.264 Constrained Baseline, 720x1280, yuv420p, AAC-LC, fast-start metadata). It includes locally synthesized English narration and an original ambient tone.

## Rebuild

On Linux, install Python 3, Pillow, and FFmpeg built with the `flite` filter. Run:

```bash
./build_plan_b.sh
```

The build creates a `build/` folder and writes `palm92_ai_safeguards_video_mobile.mp4` beside this README. The synthetic voice is a system voice, not a recording or imitation of Faith Wright or Bill Gates. The video uses Palm92-designed motion cards and does not reuse the Bill Gates interview footage.

## Included files

- `make_short_portable.py`: generates the eight Palm92 visual cards and no-narration animation.
- `build_plan_b.sh`: renders the compatible MP4 and local voice track.
- `narration.txt`: voiceover text.
- `captions.srt`: caption sidecar.
- `palm92_ai_safeguards_video_mobile.mp4`: finished video.
- `palm92_ai_assurance_checklist.pdf`: companion practical checklist.
- `palm92_ai_safeguards_evidence.png` and `palm92_ai_safeguards_video_poster.png`: companion visuals.

## Note

This is an educational assurance aid, not a certification or legal opinion. Adapt the checks to the system, context, applicable law, and risk level.
