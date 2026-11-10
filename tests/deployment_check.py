from playwright.sync_api import sync_playwright, expect
import os, json
from pathlib import Path

base = os.environ.get('GAME_URL', 'http://127.0.0.1:4321/edu/kick-keys/')
Path('outputs').mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1050})
    errors, failed = [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('response', lambda r: failed.append((r.status, r.url)) if r.status >= 400 else None)
    page.goto(base, wait_until='networkidle')
    assert page.locator('.hero-visual img').evaluate('(img)=>img.complete && img.naturalWidth > 0')
    assert '家长测试' not in page.locator('body').inner_text()
    page.get_by_role('button', name='开始今天的训练', exact=True).click()
    page.keyboard.type('a' * 12, delay=35)
    expect(page.locator('.result-page')).to_be_visible()
    saved = page.evaluate("JSON.parse(localStorage.getItem('kick-and-keys-v2:child'))")
    page.get_by_role('button', name='成长记录', exact=True).click()
    with page.expect_download() as downloaded:
        page.get_by_role('button', name='导出存档', exact=True).click()
    backup = 'outputs/test-progress.json'
    downloaded.value.save_as(backup)
    assert json.loads(Path(backup).read_text())['progress'] == saved
    page.screenshot(path='outputs/saves-desktop.png', full_page=True)
    # A fresh browser context represents the new domain/device.
    fresh = browser.new_page(viewport={'width': 1440, 'height': 1050})
    fresh.goto(base, wait_until='networkidle')
    fresh.get_by_role('button', name='成长记录', exact=True).click()
    file_input = fresh.get_by_label('选择小球员存档')
    file_input.set_input_files(backup)
    fresh.get_by_role('button', name='合并这份存档', exact=True).click()
    expect(fresh.get_by_role('status')).to_contain_text('存档导入成功')
    assert fresh.evaluate("JSON.parse(localStorage.getItem('kick-and-keys-v2:child'))") == saved
    file_input.set_input_files(backup)
    fresh.get_by_role('button', name='合并这份存档', exact=True).click()
    assert fresh.evaluate("JSON.parse(localStorage.getItem('kick-and-keys-v2:child'))") == saved
    file_input.set_input_files({'name': 'broken.json', 'mimeType': 'application/json', 'buffer': b'{}'})
    expect(fresh.get_by_role('status')).to_contain_text('不是受支持')
    assert fresh.evaluate("JSON.parse(localStorage.getItem('kick-and-keys-v2:child'))") == saved
    fresh.reload(wait_until='networkidle')
    expect(fresh.locator('.mission h3')).to_have_text('认识 B 键')
    fresh.get_by_role('button', name='打开足球护照', exact=True).click()
    expect(fresh.locator('.world-map path').first).to_be_visible()
    assert fresh.locator('.world-map path').count() > 50
    mobile = browser.new_page(viewport={'width': 390, 'height': 844})
    mobile.goto(base, wait_until='networkidle')
    mobile.get_by_role('button', name='打开导航', exact=True).click()
    mobile.get_by_role('button', name='成长记录', exact=True).click()
    expect(mobile.get_by_role('button', name='导入存档', exact=True)).to_be_visible()
    assert mobile.evaluate('document.documentElement.scrollWidth <= innerWidth')
    mobile.screenshot(path='outputs/saves-mobile.png', full_page=True)
    assert not errors, errors
    assert not failed, failed
    print(json.dumps({'base': base, 'passed': ['image and map assets', 'child-only UI', 'A lesson', 'export and import', 'duplicate import', 'invalid backup rejected', 'reload preserves progress', 'mobile backup UI'], 'errors': errors, 'failed_requests': failed}, ensure_ascii=False))
    browser.close()
