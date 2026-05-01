const { chromium } = require('playwright-core');

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function main() {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  
  const tests = [
    ['B'], ['G'], ['L'], ['M'],
    ['B', 'G'], ['G', 'B'],
    ['L', 'G'], ['M', 'G'],
    ['B', 'L'], ['L', 'B'],
    ['B', 'L', 'G'],
    ['G', 'L', 'B'],
    ['A', 'B'], ['B', 'A'],
  ];
  
  for (const seq of tests) {
    const page = await browser.newPage();
    try {
      await page.goto('https://deltarune.com/secret', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await delay(1000);
      
      for (const l of seq) {
        await page.evaluate((x) => { const b = document.getElementById(`wardrobe${x}`); if (b) b.click(); }, l);
        await delay(800);
      }
      
      const title = await page.title();
      console.log(`${seq.join('-').padEnd(15)} -> ${title}`);
    } catch (e) {
      console.log(`${seq.join('-').padEnd(15)} -> ERROR`);
    }
    await page.close();
    await delay(300);
  }
  
  await browser.close();
}

main().catch(e => console.error(e));
