"""Generate isolated English alphabet names with the same neural voice as English courses.
Requires edge-tts. Uppercase letters are individual utterances, never a word or a
case instruction. Versioned paths prevent browsers reusing previous recordings.
"""
import asyncio, json
from pathlib import Path
import edge_tts
ROOT=Path(__file__).resolve().parents[1]/'public/audio/letters-en-v2'
VOICE='en-US-JennyNeural'
async def main():
 ROOT.mkdir(parents=True,exist_ok=True)
 semaphore=asyncio.Semaphore(4)
 async def generate(letter):
  async with semaphore:
   for attempt in range(3):
    try:
     await edge_tts.Communicate(letter.upper()+'.',VOICE,rate='-10%').save(str(ROOT/(letter+'.mp3')))
     break
    except Exception:
     if attempt==2:raise
     await asyncio.sleep(2)
 await asyncio.gather(*(generate(c) for c in 'abcdefghijklmnopqrstuvwxyz'))
 (ROOT/'source.json').write_text(json.dumps({'voice':VOICE,'language':'en-US','rate':'-10%','spokenText':{c:c.upper()+'.' for c in 'abcdefghijklmnopqrstuvwxyz'}},indent=2)+'\n')
 print('Generated 26 isolated English letter recordings')
asyncio.run(main())
