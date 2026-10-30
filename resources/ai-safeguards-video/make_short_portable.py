from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import subprocess, math, wave, struct

out=Path(__file__).resolve().parent / 'build'
out.mkdir(parents=True, exist_ok=True)
W,H=1080,1920
NAVY=(13,26,49); NAVY2=(19,39,69); TEAL=(78,213,191); GOLD=(238,187,96); WHITE=(246,248,250); MUTED=(174,190,211); CARD=(26,47,77); LINE=(53,76,109)
font_path='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
bold_path='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def font(size,bold=False): return ImageFont.truetype(bold_path if bold else font_path,size)

def bg(seed=0):
    im=Image.new('RGB',(W,H)); p=im.load()
    for y in range(H):
        t=y/H
        c=tuple(int(NAVY[i]*(1-t)+NAVY2[i]*t) for i in range(3))
        for x in range(W): p[x,y]=c
    d=ImageDraw.Draw(im,'RGBA')
    # abstract orbit accents, deliberately low contrast
    d.ellipse((690+seed*13,-210,1310+seed*13,410),fill=(55,110,140,30),outline=(78,213,191,42),width=3)
    d.ellipse((-390,1230-seed*7,330,1950-seed*7),outline=(78,213,191,30),width=3)
    d.line((0,1580,1080,1580),fill=(78,213,191,18),width=2)
    return im

def roundrect(d,box,r,fill,outline=None,width=1): d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=width)
def wrap(text,f,maxw,draw):
    lines=[]; current=''
    for word in text.split():
        trial=(current+' '+word).strip()
        if draw.textbbox((0,0),trial,font=f)[2] <= maxw: current=trial
        else:
            if current: lines.append(current)
            current=word
    if current: lines.append(current)
    return lines

def text_block(d,text,y,size=62,color=WHITE,bold=False,maxw=900,spacing=1.18,center=False):
    f=font(size,bold); lines=wrap(text,f,maxw,d); lh=int(size*spacing)
    for i,line in enumerate(lines):
        x=(W-d.textbbox((0,0),line,font=f)[2])//2 if center else 82
        d.text((x,y+i*lh),line,font=f,fill=color)
    return y+len(lines)*lh

def header(im,section='RESPONSIBLE AI'):
    d=ImageDraw.Draw(im)
    d.text((82,95),'PALM92   /   '+section,font=font(28,True),fill=TEAL)
    d.rounded_rectangle((82,164,220,174),radius=5,fill=TEAL)

def footer(im,idx):
    d=ImageDraw.Draw(im)
    d.text((82,1805),'GOVERNANCE YOU CAN EVIDENCE',font=font(22,True),fill=MUTED)
    d.text((940,1805),f'{idx:02d} / 08',font=font(22,True),fill=TEAL)

def card(im, y, n, title, desc, accent):
    d=ImageDraw.Draw(im)
    roundrect(d,(74,y,1006,y+300),34,CARD,LINE,2)
    d.ellipse((112,y+70,242,y+200),fill=accent)
    d.text((144,y+108),f'{n:02d}',font=font(48,True),fill=NAVY)
    d.text((286,y+76),title.upper(),font=font(38,True),fill=WHITE)
    lines=wrap(desc,font(29),650,d)
    for j,line in enumerate(lines): d.text((286,y+145+j*42),line,font=font(29),fill=MUTED)

slides=[]
# 1 Hook
im=bg(1); header(im)
d=ImageDraw.Draw(im)
d.text((82,300),'AI SAFEGUARDS',font=font(70,True),fill=WHITE)
d.text((82,392),'NEED EVIDENCE.',font=font(78,True),fill=TEAL)
roundrect(d,(82,590,998,1000),34,(24,45,75),LINE,2)
d.text((128,660),'A promise is not',font=font(54,True),fill=WHITE)
d.text((128,732),'proof of safety.',font=font(64,True),fill=GOLD)
for i,lab in enumerate(['TEST','VERIFY','MONITOR']):
    x=130+i*290; d.ellipse((x,850,x+42,892),fill=TEAL if i!=1 else GOLD); d.text((x+56,849),lab,font=font(27,True),fill=MUTED)
text_block(d,'Before high-risk AI goes live, leaders need answers they can show.',1120,38,MUTED,False,850,1.3)
footer(im,1); slides.append(im)
# 2 evidence setup
im=bg(2); header(im)
d=ImageDraw.Draw(im); d.text((82,300),'Start with',font=font(66,True),fill=WHITE); d.text((82,388),'the evidence.',font=font(72,True),fill=TEAL)
for i,(a,b) in enumerate([('WHAT','was tested?'),('WHO','checked it?'),('WHO','owns the risk?')]):
    y=650+i*260; roundrect(d,(82,y,998,y+190),28,CARD,LINE,2)
    d.text((124,y+35),a,font=font(28,True),fill=GOLD)
    d.text((124,y+82),b,font=font(43,True),fill=WHITE)
footer(im,2); slides.append(im)
# 3-6 cycle cards
steps=[('HUMAN JUDGEMENT','Set the purpose, boundaries and accountable owner.',TEAL),('AI ACCELERATION','Use AI to support work within agreed limits.',GOLD),('HUMAN VERIFICATION','Test important outputs. Review results. Keep records.',TEAL),('LEARNING','Monitor outcomes, report incidents and improve controls.',GOLD)]
for idx,(title,desc,accent) in enumerate(steps,3):
    im=bg(idx); header(im)
    d=ImageDraw.Draw(im)
    d.text((82,285),'THE PRACTICAL CYCLE',font=font(27,True),fill=MUTED)
    d.text((82,365),f'{idx-2:02d}',font=font(140,True),fill=accent)
    d.text((82,600),title,font=font(52,True),fill=WHITE)
    text_block(d,desc,735,42,MUTED,False,850,1.25)
    # an understated progress rail
    y=1170; roundrect(d,(82,y,998,y+18),9,(37,61,91))
    roundrect(d,(82,y,82+229*(idx-2),y+18),9,accent)
    labels=['JUDGEMENT','AI','VERIFY','LEARN']
    for j,lab in enumerate(labels):
        xx=82+j*229
        d.ellipse((xx,y+78,xx+28,y+106),fill=TEAL if j==idx-3 else (68,90,117))
        d.text((xx,y+135),lab,font=font(20,True),fill=MUTED)
    footer(im,idx); slides.append(im)
# 7 decision questions
im=bg(7); header(im)
d=ImageDraw.Draw(im); d.text((82,290),'Before launch,',font=font(61,True),fill=WHITE); d.text((82,372),'ask three things.',font=font(61,True),fill=TEAL)
for i,q in enumerate(['What was tested?','Who independently verified it?','Who is accountable if it fails?']):
    y=600+i*250; roundrect(d,(82,y,998,y+180),28,CARD,LINE,2)
    d.ellipse((122,y+61,180,y+119),fill=TEAL if i!=1 else GOLD)
    d.text((138,y+69),str(i+1),font=font(32,True),fill=NAVY)
    lines=wrap(q,font(36,True),730,d)
    for j,line in enumerate(lines): d.text((220,y+50+j*48),line,font=font(36,True),fill=WHITE)
footer(im,7); slides.append(im)
# 8 close
im=bg(8); header(im,'PALM92 / RESPONSIBLE AI')
d=ImageDraw.Draw(im)
d.text((82,420),'TRUST FOLLOWS',font=font(64,True),fill=WHITE)
d.text((82,510),'EVIDENCE.',font=font(80,True),fill=TEAL)
roundrect(d,(82,760,998,1080),34,CARD,LINE,2)
text_block(d,'Human judgement → AI acceleration → Human verification → Learning',820,37,WHITE,True,820,1.3,True)
text_block(d,'What should organisations have to prove before using AI in high-risk settings?',1190,35,MUTED,False,850,1.25)
d.text((82,1630),'FOLLOW PALM92',font=font(30,True),fill=GOLD)
d.text((82,1685),'Practical AI assurance. Evidence first.',font=font(28),fill=WHITE)
footer(im,8); slides.append(im)

for i,im in enumerate(slides,1): im.save(out/f'scene_{i:02d}.png')

# Gentle, original ambient tonal bed. No external or licensed track used.
# Create a soft three-note pad with slow amplitude movement.
sr=44100; duration=30.4
with wave.open(str(out/'ambient.wav'),'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(sr)
    frames=[]
    freqs=(196.0,246.94,293.66)
    for n in range(int(sr*duration)):
        t=n/sr
        fade=min(1.0,t/1.2,(duration-t)/1.5)
        swell=0.72+0.14*math.sin(2*math.pi*t/8.5)
        val=sum(math.sin(2*math.pi*f*t) for f in freqs)/3
        val*=0.055*max(0,fade)*swell
        sample=max(-32767,min(32767,int(val*32767)))
        frames.append(struct.pack('<hh',sample,sample))
    wf.writeframes(b''.join(frames))

segments=[]
for i in range(1,9):
    seg=out/f'segment_{i:02d}.mp4'; src=out/f'scene_{i:02d}.png'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-loop','1','-framerate','25','-i',str(src),'-t','3.8','-vf',"zoompan=z='min(1.0+0.00013*on,1.012)':d=1:s=1080x1920:fps=25,format=yuv420p",'-an','-c:v','libx264','-preset','veryfast','-crf','21',str(seg)],check=True)
    segments.append(seg)
concat=out/'segments.txt'
concat.write_text(''.join(f"file '{p.name}'\n" for p in segments))
raw=out/'palm92_ai_safeguards_video_noaudio.mp4'
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(concat),'-c','copy',str(raw)],check=True)
final=out/'palm92_ai_safeguards_video.mp4'
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(raw),'-i',str(out/'ambient.wav'),'-t','30.4','-c:v','copy','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',str(final)],check=True)
print(final)
