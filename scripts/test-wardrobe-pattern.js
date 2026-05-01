const { chromium } = require('playwright-core');

const BASE_URL = 'https://deltarune.com';

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function testSequence(browser, sequence) {
  const page = await browser.newPage();
  let finalTitle = '';
  let steps = [];
  
  try {
    await page.goto(BASE_URL + '/secret', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await delay(2000);
    
    for (const letter of sequence) {
      const beforeTitle = await page.title();
      
      await page.evaluate((l) => {
        const btn = document.getElementById(`wardrobe${l}`);
        if (btn) btn.click();
      }, letter);
      
      await delay(1500);
      
      const afterTitle = await page.title();
      const afterUrl = page.url();
      
      steps.push(`${letter}:${afterTitle}`);
      finalTitle = afterTitle;
      
      if (afterUrl !== BASE_URL + '/secret/') {
        finalTitle = `${afterTitle} (URL:${afterUrl})`;
        break;
      }
    }
  } catch (err) {
    finalTitle = 'ERROR';
  }
  
  await page.close();
  return { sequence: sequence.join('-'), finalTitle, steps };
}

async function main() {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  
  const tests = [
    // 基础单衣柜
    ['B'], ['G'], ['L'], ['M'], ['O'],
    // 两两组合
    ['B', 'G'], ['G', 'B'],
    ['L', 'G'], ['G', 'L'],
    ['M', 'G'], ['G', 'M'],
    ['B', 'L'], ['L', 'B'],
    ['B', 'M'], ['M', 'B'],
    ['L', 'M'], ['M', 'L'],
    // 三衣柜组合
    ['B', 'G', 'L'],
    ['G', 'B', 'L'],
    ['B', 'L', 'G'],
    // 无反应衣柜组合
    ['A', 'B'], ['B', 'A'],
    ['A', 'G'], ['G', 'A'],
    // O跳转测试
    ['O', 'B'],
    ['B', 'O'],
    ['G', 'O'],
    // 全部won组合
    ['B', 'L', 'M'],
    ['M', 'L', 'B'],
    // 混合
    ['B', 'L', 'G', 'M'],
    ['G', 'B', 'L', 'M'],
  ];
  
  console.log('Sequence -> Final State');
  console.log('='.repeat(50));
  
  for (const seq of tests) {
    const result = await testSequence(browser, seq);
    console.log(`${result.sequence.padEnd(20)} -> ${result.finalTitle}`);
    await delay(500);
  }
  
  await browser.close();
  
  console.log('\n=== Pattern Analysis ===');
  console.log('1. First "won" wardrobe (B/L/M) sets state to "You won!"');
  console.log('2. First "lost" wardrobe (G) sets state to "You lost!"');
  console.log('3. Subsequent clicks of same type do nothing');
  console.log('4. "won" overrides "lost" and vice versa - FIRST one wins!');
  console.log('5. "O" always redirects to /chair/');
  console.log('6. "A" (no change) does not affect state');
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
