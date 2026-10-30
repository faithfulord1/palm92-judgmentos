# Palm92 AI safeguards film — Google Flow cut

A 34.7-second, vertical 9:16 short film about evidence-based AI assurance. This refreshed Plan B cut uses four Google Flow-generated documentary-style scenes, Palm92 captions, ambient scene sound and a closing card. It has **no synthetic narration**; the message is delivered in clear on-screen English.

## Story

1. An analyst notices a possible warning: AI capabilities are advancing; can safeguards keep up?
2. A controlled research setting introduces the stakes and the need to test before release.
3. An independent reviewer challenges test evidence.
4. A risk lead monitors the system and remains ready to pause it.
5. Palm92 asks what organisations should prove before high-risk AI goes live.

The generated people, workplaces and events are illustrative and do not depict actual organisations or incidents. The film is an educational assurance aid, not a certification or legal opinion.

## Project files

The complete downloadable project package contains the finished MP4, Google Flow source clips, captioned scene renders, captions, poster, storyboard and assembly scripts. Video binaries are kept in the project package.

- `captions.srt`: timed on-screen text.
- `flow_prompts_and_storyboard.md`: story arc and visual prompt summaries.
- `finish_cinematic.py`: FFmpeg final assembly from the captioned scene renders.
- Earlier local motion-card Plan B assets remain in this folder as an alternate fallback; they are not the current finished cut.

## Rebuild

Requires Python 3 and FFmpeg with libx264 and AAC support. Put the four `scene_XX_captioned.mp4` files and `endcard.mp4` beside `finish_cinematic.py`, then run:

```bash
python3 finish_cinematic.py
```

The script writes `palm92_ai_safeguards_cinematic.mp4` in the same directory. The full project package includes the generated media and rendered intermediates.
