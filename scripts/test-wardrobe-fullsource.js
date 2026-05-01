const { chromium } = require('playwright-core');

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function main() {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://deltarune.com/secret', { waitUntil: 'networkidle', timeout: 30000 });
  await delay(3000);
  
  // 获取所有script标签的内容
  const allScripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script')).map(s => s.textContent).join('\n');
  });
  
  // 查找wardrobe相关的代码
  const wardrobeMatch = allScripts.match(/wardrobe[^;]*/g);
  
  // 获取prize元素
  const prizes = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('[id^="prize"]'));
    return elements.map(e => ({
      id: e.id,
      className: e.className,
      html: e.outerHTML.substring(0, 500)
    }));
  });
  
  // 查找完整的点击处理逻辑
  const clickHandler = allScripts.substring(
    allScripts.indexOf('$(document).on("click", "#secret:not(.open) button"'),
    allScripts.indexOf('$(document).on("click", "#secret:not(.open) button"') + 3000
  );
  
  console.log('=== Click Handler ===');
  console.log(clickHandler);
  
  console.log('\n=== Prize Elements ===');
  prizes.forEach(p => {
    console.log(`${p.id}: ${p.className}`);
  });
  
  await browser.close();
}

main().catch(e => console.error(e));
