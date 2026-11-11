"""Exercise actual decoded-audio playback, mute recovery, and cancellation."""
import os
from playwright.sync_api import sync_playwright, expect
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 page=b.new_page()
 page.add_init_script('''window.played=[];window.stopped=0;
 const start=AudioBufferSourceNode.prototype.start,stop=AudioBufferSourceNode.prototype.stop;
 AudioBufferSourceNode.prototype.start=function(...args){played.push({duration:this.buffer.duration});return start.apply(this,args)};
 AudioBufferSourceNode.prototype.stop=function(...args){stopped++;return stop.apply(this,args)};
 speechSynthesis.speak=()=>{throw Error('System speech is forbidden')};''')
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('GAME_URL','http://127.0.0.1:4321/edu/kick-keys/'))
 page.locator('nav').get_by_role('button',name='世界杯 · 英语').click()
 page.locator('.lesson-card').first.click()
 page.wait_for_function('played.length===1')
 page.get_by_role('button',name='关闭音效',exact=True).click()
 assert page.evaluate('stopped')>=1
 # Manual replay is available even while muted and enables sound again.
 page.get_by_role('button',name='朗读当前词语').click()
 page.wait_for_function('played.length===2')
 expect(page.get_by_role('button',name='关闭音效',exact=True)).to_be_visible()
 page.keyboard.type('a')
 page.wait_for_function('played.length===3')
 page.get_by_role('button',name='暂停',exact=True).click()
 count=page.evaluate('played.length')
 page.wait_for_timeout(1800)
 assert page.evaluate('played.length')==count
 assert not page.locator('.speech-error').count()
 assert not errors,errors
 print('PASS: automatic audio, manual mute recovery, next letter and pause cancellation')
 b.close()
