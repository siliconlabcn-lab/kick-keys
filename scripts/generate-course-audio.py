"""Generate local course recordings. Requires edge-tts and a JSON export of LESSONS.
Usage: python scripts/generate-course-audio.py /tmp/speech-curriculum.json
Existing completed clips are reused; failures do not replace the manifest.
"""
import asyncio, hashlib, json, pathlib, sys
import edge_tts
ROOT = pathlib.Path(__file__).resolve().parents[1]
VOICES = {'en': 'en-US-JennyNeural', 'zh': 'zh-CN-XiaoxiaoNeural'}
RATE = '-10%'
async def main():
    lessons = json.loads(pathlib.Path(sys.argv[1]).read_text())
    entries = {}
    for lesson in lessons:
        if lesson['kind'] == 'english' and lesson.get('stage') != 'letters':
            lang = 'en'
        elif lesson['kind'] == 'pinyin' and lesson.get('ime'):
            lang = 'zh'
        else:
            continue
        for task in lesson['tasks']:
            text = task['input']
            key = f'{lang}|{text}'
            digest = hashlib.sha256(key.encode()).hexdigest()[:20]
            entries[key] = {'text': text, 'language': lang, 'voice': VOICES[lang],
                            'rate': RATE, 'file': f'audio/courses/{lang}-{digest}.mp3'}
    semaphore = asyncio.Semaphore(5)
    done = 0
    async def generate(entry):
        nonlocal done
        target = ROOT / 'public' / entry['file']
        target.parent.mkdir(parents=True, exist_ok=True)
        async with semaphore:
            if not target.exists() or target.stat().st_size < 1000:
                temporary = target.with_suffix('.part.mp3')
                for attempt in range(4):
                    try:
                        await edge_tts.Communicate(entry['text'], entry['voice'], rate=RATE).save(str(temporary))
                        if temporary.stat().st_size < 1000:
                            raise ValueError('Empty audio')
                        temporary.replace(target)
                        break
                    except Exception:
                        temporary.unlink(missing_ok=True)
                        if attempt == 3:
                            raise
                        await asyncio.sleep(2 * (attempt + 1))
            done += 1
            if done % 20 == 0 or done == len(entries):
                print(f'{done}/{len(entries)} recordings ready', flush=True)
    await asyncio.gather(*(generate(entry) for entry in entries.values()))
    (ROOT / 'lib/course-audio.json').write_text(json.dumps(entries, ensure_ascii=False, indent=2) + '\n')
    (ROOT / 'public/audio/courses/SOURCE.txt').write_text(
        'Fixed neural speech generated from the project curriculum using edge-tts.\n'
        'English: en-US-JennyNeural; Mandarin: zh-CN-XiaoxiaoNeural. Rate: -10%.\n'
        'Exact spoken text and file mapping: lib/course-audio.json.\n'
        'No browser/system speech synthesis is used during gameplay.\n')
asyncio.run(main())
