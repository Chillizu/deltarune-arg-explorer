const { chromium } = require('playwright-core');

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function main() {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://deltarune.com/secret', { waitUntil: 'networkidle', timeout: 30000 });
  await delay(3000);
  
  // 获取页面源码
  const html = await page.content();
  
  // 查找JavaScript
  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script')).map(s => ({
      src: s.src,
      text: s.textContent.substring(0, 5000)
    }));
  });
  
  // 查找与wardrobe相关的代码
  const wardrobeCode = await page.evaluate(() => {
    const allHtml = document.documentElement.outerHTML;
    const wardrobeIndex = allHtml.indexOf('wardrobe');
    if (wardrobeIndex > 0) {
      return allHtml.substring(Math.max(0, wardrobeIndex - 500), wardrobeIndex + 2000);
    }
    return '';
  });
  
  // 检查localStorage和sessionStorage
  const storage = await page.evaluate(() => ({
    localStorage: Object.entries(localStorage),
    sessionStorage: Object.entries(sessionStorage)
  }));
  
  // 检查cookie
  const cookies = await page.evaluate(() => document.cookie);
  
  console.log('=== Wardrobe Code ===');
  console.log(wardrobeCode);
  console.log('\n=== Scripts ===');
  scripts.forEach((s, i) => {
    console.log(`Script ${i}: ${s.src || 'inline'}`);
    if (s.text) console.log(s.text.substring(0, 1000));
  });
  console.log('\n=== Storage ===');
  console.log('localStorage:', storage.localStorage);
  console.log('sessionStorage:', storage.sessionStorage);
  console.log('\n=== Cookies ===');
  console.log(cookies);
  
  await browser.close();
}

main().catch(e => console.error(e));
