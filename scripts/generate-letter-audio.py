"""Generate fixed US-English letter names with macOS Samantha, never capital glyphs."""
from pathlib import Path
import subprocess,tempfile,json,concurrent.futures
NAMES=dict(zip('abcdefghijklmnopqrstuvwxyz',['ay','bee','see','dee','ee','eff','gee','aitch','eye','jay','kay','ell','em','en','oh','pee','cue','ar','ess','tee','you','vee','double you','ex','why','zee']))
ROOT=Path(__file__).resolve().parents[1]/'public/audio/letters'
ROOT.mkdir(parents=True,exist_ok=True)
def generate(item):
 letter,name=item
 with tempfile.TemporaryDirectory() as folder:
  source=Path(folder)/'letter.aiff'
  subprocess.run(['say','-v','Samantha','-r','155','-o',str(source),name],check=True)
  subprocess.run(['afconvert','-f','WAVE','-d','LEI16',str(source),str(ROOT/(letter+'.wav'))],check=True)
 return letter
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 print('Generated: '+''.join(pool.map(generate,NAMES.items())))
(ROOT/'source.json').write_text(json.dumps({'voice':'macOS Samantha (en-US)','rate':155,'spokenNames':NAMES},indent=2)+'\n')
