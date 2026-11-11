"""Production regression: all released courses open without a preview query."""
from playwright.sync_api import sync_playwright, expect
import os

base = os.environ.get('GAME_URL', 'http://127.0.0.1:4321/edu/kick-keys/')
with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(base, wait_until='networkidle')
    expect(page.locator('.locked-tile')).to_have_count(0)
    for title in ['国内联赛 · 中文', '世界杯 · 英语']:
        page.locator('nav').get_by_role('button', name=title, exact=True).click()
        expect(page.locator('.locked-course')).to_have_count(0)
        assert page.locator('.lesson-card').count() > 0
        page.locator('.lesson-card').first.click()
        expect(page.locator('.practice-card')).to_be_visible()
        page.get_by_role('button', name='返回课程', exact=True).click()
    page.locator('nav').get_by_role('button', name='足球赛场', exact=True).click()
    page.locator('.competition-card').filter(has_text='青训联赛').click()
    page.get_by_role('button', name='键盘标点', exact=True).click()
    assert page.locator('.lesson-card').count() >= 3
    expect(page.locator('.locked-course')).to_have_count(0)
    assert not errors, errors
    print('PASS: public Chinese, English and punctuation courses open without ?unlock')
    browser.close()
