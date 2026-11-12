import os
from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 page=b.new_page();errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('GAME_URL','http://127.0.0.1:4321/edu/kick-keys/'))
 page.get_by_role('button',name='进入推荐训练').click()
 # Enter exactly the displayed task; A's lesson includes several short rounds.
 for _ in range(20):
  if page.locator('.result-page').count():break
  target=page.locator('.target-text').inner_text().replace('␣',' ')
  page.keyboard.type(target,delay=50)
  page.wait_for_timeout(80)
 expect(page.locator('.result-page')).to_be_visible()
 expect(page.get_by_role('button',name='今日已完成 · 明天再来',exact=True)).to_be_disabled()
 points=page.evaluate("JSON.parse(localStorage.getItem('kick-and-keys-v2:child')).points")
 page.get_by_role('button',name='返回课程',exact=True).click()
 expect(page.get_by_role('button',name='认识 A 键',exact=True)).to_be_disabled()
 page.reload()
 page.locator('nav').get_by_role('button',name='足球赛场',exact=True).click()
 page.locator('.competition-card').filter(has_text='青训联赛').click()
 page.get_by_role('button',name='字母 A–Z',exact=True).click()
 expect(page.get_by_role('button',name='认识 A 键',exact=True)).to_be_disabled()
 assert page.evaluate("JSON.parse(localStorage.getItem('kick-and-keys-v2:child')).points")==points
 page.locator('nav').get_by_role('button',name='足球环游记').click()
 expect(page.locator('.team-tabs button')).to_have_count(5)
 assert '中国' not in page.locator('.team-tabs').inner_text()
 assert '日本' not in page.locator('.team-tabs').inner_text()
 assert '中国' not in page.locator('.country-picker').inner_text()
 assert '字母 A–Z 1/26' in page.locator('.stamp-row').inner_text()
 assert not errors,errors
 print('PASS daily completion locks after reload, points unchanged, five teams, module passport progress')
 b.close()
