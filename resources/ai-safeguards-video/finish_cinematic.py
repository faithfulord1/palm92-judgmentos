from pathlib import Path
import subprocess
root=Path(__file__).resolve().parent
inputs=[root/f"scene_{i:02d}_captioned.mp4" for i in range(1,5)]+[root/"endcard.mp4"]
args=[]
for p in inputs: args += ["-i",str(p)]
filters=[
"[0:v][1:v]xfade=transition=fade:duration=0.35:offset=7.58[v1]",
"[v1][2:v]xfade=transition=fade:duration=0.35:offset=15.16[v2]",
"[v2][3:v]xfade=transition=fade:duration=0.35:offset=22.74[v3]",
"[v3][4:v]xfade=transition=fade:duration=0.45:offset=30.22,format=yuv420p[vout]",
"[0:a][1:a]acrossfade=d=0.35:c1=tri:c2=tri[a1]",
"[a1][2:a]acrossfade=d=0.35:c1=tri:c2=tri[a2]",
"[a2][3:a]acrossfade=d=0.35:c1=tri:c2=tri[a3]",
"[a3][4:a]acrossfade=d=0.45:c1=tri:c2=tri,apad=pad_dur=1.0,afade=t=out:st=33.4:d=1.1,alimiter=limit=0.94[aout]"
]
out=root/"palm92_ai_safeguards_cinematic.mp4"
subprocess.run(["ffmpeg","-y","-hide_banner","-loglevel","error",*args,"-filter_complex",";".join(filters),"-map","[vout]","-map","[aout]","-t","34.72","-c:v","libx264","-profile:v","baseline","-level:v","3.1","-preset","medium","-crf","21","-r","25","-pix_fmt","yuv420p","-x264-params","ref=1:bframes=0","-c:a","aac","-profile:a","aac_low","-b:a","128k","-ar","44100","-ac","2","-movflags","+faststart",str(out)],check=True)
print(out)
