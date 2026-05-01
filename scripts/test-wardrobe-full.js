const { chromium } = require('playwright-core');

const BASE_URL = 'https://deltarune.com';

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function testAllCombinations() {
  console.log('=== Testing all wardrobe combinations ===');
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
  const results = {};
  
  // 测试每个衣柜单独点击的结果
  for (const letter of letters) {
    const page = await browser.newPage();
    try {
      await page.goto(BASE_URL + '/secret', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await delay(2000);
      
      const beforeTitle = await page.title();
      
      try {
        const btn = await page.$(`#wardrobe${letter}`);
        if (btn) await btn.click();
      } catch (e) {
        await page.evaluate((l) => {
          const btn = document.getElementById(`wardrobe${l}`);
          if (btn) btn.click();
        }, letter);
      }
      
      await delay(2000);
      
      const afterTitle = await page.title();
      const afterUrl = page.url();
      
      results[letter] = {
        result: afterTitle,
        urlChanged: afterUrl !== BASE_URL + '/secret/',
        afterUrl: afterUrl !== BASE_URL + '/secret/' ? afterUrl : null
      };
      
      console.log(`wardrobe${letter}: "${beforeTitle}" -> "${afterTitle}"${afterUrl !== BASE_URL + '/secret/' ? ' [URL: ' + afterUrl + ']' : ''}`);
    } catch (err) {
      console.log(`wardrobe${letter}: ERROR`);
      results[letter] = { error: err.message };
    }
    await page.close();
    await delay(300);
  }
  
  await browser.close();
  
  // 分析结果
  console.log('\n=== Wardrobe Result Map ===');
  for (const [letter, data] of Object.entries(results)) {
    if (data.error) {
      console.log(`${letter}: ERROR`);
    } else if (data.urlChanged) {
      console.log(`${letter}: LINK -> ${data.afterUrl}`);
    } else if (data.result === "What's behind door number one?") {
      console.log(`${letter}: NO CHANGE`);
    } else {
      console.log(`${letter}: ${data.result}`);
    }
  }
  
  // 分类统计
  const noChange = Object.entries(results).filter(([l, d]) => !d.error && d.result === "What's behind door number one?").map(([l]) => l);
  const won = Object.entries(results).filter(([l, d]) => !d.error && d.result === "You won!").map(([l]) => l);
  const lost = Object.entries(results).filter(([l, d]) => !d.error && d.result === "You lost!").map(([l]) => l);
  const link = Object.entries(results).filter(([l, d]) => !d.error && d.urlChanged).map(([l]) => l);
  
  console.log('\n=== Classification ===');
  console.log(`NO CHANGE (${noChange.length}): ${noChange.join(', ')}`);
  console.log(`YOU WON! (${won.length}): ${won.join(', ')}`);
  console.log(`YOU LOST! (${lost.length}): ${lost.join(', ')}`);
  console.log(`LINK (${link.length}): ${link.join(', ')}`);
}

testAllCombinations().catch(err => { console.error('Fatal error:', err); process.exit(1); });
