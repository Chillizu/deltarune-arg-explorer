const { chromium } = require('playwright-core');

const BASE_URL = 'https://deltarune.com';

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function testSequence() {
  console.log('=== Testing wardrobe sequences ===');
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  
  const sequences = [
    ['B', 'G'],
    ['G', 'B'],
    ['B', 'L'],
    ['O', 'B'],
    ['B', 'O'],
    ['A', 'B', 'C'],
    ['B', 'G', 'L', 'M']
  ];
  
  for (const seq of sequences) {
    const page = await browser.newPage();
    try {
      await page.goto(BASE_URL + '/secret', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await delay(2000);
      
      console.log(`\nSequence: ${seq.join(' -> ')}`);
      
      for (const letter of seq) {
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
        
        console.log(`  wardrobe${letter}: "${beforeTitle}" -> "${afterTitle}"`);
        
        if (afterUrl !== BASE_URL + '/secret/') {
          console.log(`    URL changed to: ${afterUrl}`);
          break;
        }
      }
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
    }
    await page.close();
    await delay(500);
  }
  
  await browser.close();
  console.log('\nDone.');
}

testSequence().catch(err => { console.error('Fatal error:', err); process.exit(1); });
