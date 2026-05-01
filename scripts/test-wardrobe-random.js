const { chromium } = require('playwright-core');

const BASE_URL = 'https://deltarune.com';

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function testWardrobeRandom(letter, times = 5) {
  console.log(`\n=== Testing wardrobe${letter} ${times} times ===`);
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const results = [];
  
  for (let i = 0; i < times; i++) {
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
      
      results.push({
        attempt: i + 1,
        beforeTitle,
        afterTitle,
        urlChanged: afterUrl !== BASE_URL + '/secret/'
      });
      
      console.log(`  Attempt ${i + 1}: "${beforeTitle}" -> "${afterTitle}"`);
      
    } catch (err) {
      console.log(`  Attempt ${i + 1}: ERROR - ${err.message}`);
      results.push({ attempt: i + 1, error: err.message });
    }
    await page.close();
    await delay(500);
  }
  
  await browser.close();
  
  // 分析结果
  const titles = results.filter(r => !r.error).map(r => r.afterTitle);
  const uniqueTitles = [...new Set(titles)];
  console.log(`  Results: ${uniqueTitles.length} unique outcomes`);
  console.log(`  Outcomes: ${uniqueTitles.join(', ')}`);
  
  return results;
}

async function main() {
  const fs = require('fs');
  const allResults = {};
  
  // 测试几个关键衣柜多次
  for (const letter of ['B', 'G', 'L', 'M', 'O']) {
    allResults[letter] = await testWardrobeRandom(letter, 5);
  }
  
  fs.writeFileSync(
    '/home/Chillizu/Projects/Deltarune/deltarune-arg-explore/pages-data/wardrobe-random-test.json',
    JSON.stringify(allResults, null, 2)
  );
  
  console.log('\n=== Summary ===');
  for (const [letter, results] of Object.entries(allResults)) {
    const titles = results.filter(r => !r.error).map(r => r.afterTitle);
    const unique = [...new Set(titles)];
    console.log(`wardrobe${letter}: ${unique.length} unique result(s) - ${unique.join(', ')}`);
  }
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
