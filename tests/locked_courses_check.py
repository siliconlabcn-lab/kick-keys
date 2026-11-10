from playwright.sync_api import sync_playwright, expect
import os
import json, re

base=os.environ.get('GAME_URL', 'http://127.0.0.1:4321/edu/kick-keys/')
record={'id':'pinyin-one','title':'你好，小球员','accuracy':100,'correct':12,'mistakes':0,'seconds':30,'cpm':24,'date':'2026-11-10T00:00:00Z','points':24}
saved={'records':[record],'completed':['pinyin-one'],'points':24}
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 page=b.new_page(viewport={'width':1440,'height':1000})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(base,wait_until='networkidle')
 page.evaluate('(s)=>localStorage.setItem("kick-and-keys-v2:child",JSON.stringify(s))',saved)
 page.reload(wait_until='networkidle')
 page.get_by_role('button',name='训练学院',exact=True).click()
 expect(page.locator('.course-tab.locked')).to_have_count(5)
 for title in ['拼音训练','英语选修','符号加练','成长测试','足球游戏']:
  page.get_by_role('button',name=title+' · 已锁定',exact=True).click()
  expect(page.locator('.locked-course h2')).to_contain_text(title)
  expect(page.locator('.lesson-card')).to_have_count(0)
  expect(page.locator('.practice-card')).to_have_count(0)
  page.keyboard.type('mafootball123fj')
 assert page.evaluate("JSON.parse(localStorage.getItem('kick-and-keys-v2:child'))")==saved
 page.screenshot(path='outputs/locked-training-desktop.png',full_page=True,animations='disabled')
 page.get_by_role('button',name='去练字母',exact=True).click()
 expect(page.locator('.key-lesson')).to_have_count(26)
 page.get_by_role('button',name='🔢 数字 0–9',exact=True).click()
 expect(page.locator('.key-lesson')).to_have_count(10)
 page.get_by_role('button',name='⌨️ 指法巩固',exact=True).click()
 expect(page.locator('.lesson-card')).to_have_count(6)
 # Home tiles, the game banner, map and story buttons must respect the same gate.
 for i,title in [(0,'拼音训练'),(1,'英语选修')]:
  page.get_by_role('button',name='我的主场',exact=True).click()
  page.locator('.locked-tile').nth(i).click()
  expect(page.locator('.locked-course h2')).to_contain_text(title)
 page.get_by_role('button',name='我的主场',exact=True).click()
 page.get_by_role('button',name='足球游戏 · 已锁定',exact=True).click()
 expect(page.locator('.locked-course h2')).to_contain_text('足球游戏')
 page.get_by_role('button',name=re.compile('^足球环游记')).click()
 page.get_by_role('button',name='拼音训练 · 已锁定',exact=True).click()
 expect(page.locator('.locked-course h2')).to_contain_text('拼音训练')
 for title,button in [('拼音训练','拼音练习 · 已锁定'),('英语选修','英语短句 · 已锁定')]:
  page.get_by_role('button',name='足球小百科',exact=True).click()
  page.get_by_role('button',name=button,exact=True).click()
  expect(page.locator('.locked-course h2')).to_contain_text(title)
 assert page.evaluate("JSON.parse(localStorage.getItem('kick-and-keys-v2:child'))")==saved
 # The last open course must not offer the closed pinyin course as its next lesson.
 page.get_by_role('button',name='⌨️ 指法巩固',exact=True).click()
 page.get_by_role('button').filter(has=page.get_by_role('heading',name='后场好搭档',exact=True)).click()
 page.keyboard.type(''.join('v m c n b x z fvf jmj dcd jnj fbf'.split()),delay=35)
 expect(page.locator('.result-page')).to_be_visible()
 expect(page.get_by_role('button',name=re.compile('^下一课'))).to_have_count(0)
 current=page.evaluate("JSON.parse(localStorage.getItem('kick-and-keys-v2:child'))")
 assert current['records'][1]==record
 page.reload(wait_until='networkidle')
 expect(page.locator('.mission h3')).to_have_text('认识 A 键')
 page.get_by_role('button',name='成长记录',exact=True).click()
 expect(page.locator('tbody')).to_contain_text('你好，小球员')
 mobile=b.new_page(viewport={'width':390,'height':844})
 mobile.goto(base,wait_until='networkidle')
 mobile.get_by_role('button',name='打开导航',exact=True).click()
 mobile.get_by_role('button',name='训练学院',exact=True).click()
 mobile.get_by_role('button',name='成长测试 · 已锁定',exact=True).click()
 expect(mobile.locator('.locked-course')).to_be_visible()
 assert mobile.evaluate('document.documentElement.scrollWidth<=innerWidth')
 mobile.screenshot(path='outputs/locked-training-mobile.png',full_page=True,animations='disabled')
 assert not errors,errors
 print(json.dumps({'passed':['five locked tabs','no exercises in locked sections','letter/number/finger courses remain open','home shortcuts locked','world and story shortcuts locked','last open course cannot advance into pinyin','old progress retained','mobile lock preview'],'js_errors':errors},ensure_ascii=False))
 b.close()
