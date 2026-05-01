const { chromium } = require('playwright-core');

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function main() {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://deltarune.com/secret', { waitUntil: 'networkidle', timeout: 30000 });
  await delay(3000);
  
  // 获取所有script的完整内容
  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script')).map((s, i) => ({
      index: i,
      src: s.src,
      text: s.textContent
    }));
  });
  
  // 找到包含wardrobe逻辑的script
  const wardrobeScript = scripts.find(s => s.text && s.text.includes('wardrobe'));
  
  if (wardrobeScript) {
    console.log('=== Complete Wardrobe Script ===');
    console.log(wardrobeScript.text);
  }
  
  // 获取所有prize元素的HTML
  const prizesHtml = await page.evaluate(() => {
    const prizes = Array.from(document.querySelectorAll('[id^="prize"]'));
    return prizes.map(p => p.outerHTML);
  });
  
  console.log('\n=== Prize Elements ===');
  prizesHtml.forEach((html, i) => {
    console.log(`Prize ${i}: ${html.substring(0, 200)}`);
  });
  
  await browser.close();
}

main().catch(e => console.error(e));
