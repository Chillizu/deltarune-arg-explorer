const { chromium } = require('playwright-core');

const BASE_URL = 'https://deltarune.com';

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function testSequence(browser, sequence) {
  const page = await browser.newPage();
  const results = [];
  
  try {
    await page.goto(BASE_URL + '/secret', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await delay(2000);
    
    for (const letter of sequence) {
      const beforeTitle = await page.title();
      const beforeUrl = page.url();
      
      try {
        const btn = await page.$(`#wardrobe${letter}`);
        if (btn) await btn.click();
      } catch (e) {
        await page.evaluate((l) => {
          const btn = document.getElementById(`wardrobe${l}`);
          if (btn) btn.click();
        }, letter);
      }
      
      await delay(1500);
      
      const afterTitle = await page.title();
      const afterUrl = page.url();
      
      results.push({
        letter,
        beforeTitle,
        afterTitle,
        urlChanged: afterUrl !== beforeUrl
      });
      
      if (afterUrl !== BASE_URL + '/secret/') {
        break;
      }
    }
  } catch (err) {
    results.push({ error: err.message });
  }
  
  await page.close();
  return results;
}

async function main() {
  console.log('=== Wardrobe Brute Force Test ===');
  const fs = require('fs');
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  
  // 只测试有意义的衣柜（有反应的）
  const meaningful = ['B', 'G', 'L', 'M', 'O'];
  const allResults = [];
  
  // 1. 单衣柜（已知结果）
  console.log('\n--- Single wardrobes ---');
  for (const letter of meaningful) {
    const results = await testSequence(browser, [letter]);
    const final = results[results.length - 1];
    console.log(`${letter}: ${final.afterTitle}`);
  }
  
  // 2. 两两组合（5*4=20种）
  console.log('\n--- Two-wardrobe combinations ---');
  for (let i = 0; i < meaningful.length; i++) {
    for (let j = 0; j < meaningful.length; j++) {
      if (i === j) continue;
      const seq = [meaningful[i], meaningful[j]];
      const results = await testSequence(browser, seq);
      const final = results[results.length - 1];
      const changed = results.some(r => r.beforeTitle !== r.afterTitle);
      console.log(`${seq.join('-')}: ${final.afterTitle}${changed ? ' [CHANGED]' : ''}`);
      
      allResults.push({
        sequence: seq,
        results: results.map(r => ({ letter: r.letter, title: r.afterTitle, urlChanged: r.urlChanged })),
        finalTitle: final.afterTitle
      });
    }
  }
  
  // 3. 三三组合（选取一些关键组合）
  console.log('\n--- Three-wardrobe combinations (selected) ---');
  const tripleCombos = [
    ['B', 'G', 'L'],
    ['G', 'B', 'L'],
    ['B', 'L', 'M'],
    ['G', 'L', 'M'],
    ['B', 'G', 'O'],
    ['L', 'M', 'O'],
    ['B', 'L', 'O'],
    ['G', 'M', 'O']
  ];
  
  for (const seq of tripleCombos) {
    const results = await testSequence(browser, seq);
    const final = results[results.length - 1];
    console.log(`${seq.join('-')}: ${final.afterTitle}`);
    
    allResults.push({
      sequence: seq,
      results: results.map(r => ({ letter: r.letter, title: r.afterTitle, urlChanged: r.urlChanged })),
      finalTitle: final.afterTitle
    });
  }
  
  // 4. 测试所有16个衣柜按顺序点击
  console.log('\n--- All 16 wardrobes in order ---');
  const allLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
  const allResults16 = await testSequence(browser, allLetters);
  const final16 = allResults16[allResults16.length - 1];
  console.log(`A-P sequence: ${final16.afterTitle}`);
  console.log('Step by step:');
  for (const r of allResults16) {
    if (r.beforeTitle !== r.afterTitle) {
      console.log(`  ${r.letter}: "${r.beforeTitle}" -> "${r.afterTitle}"`);
    }
  }
  
  allResults.push({
    sequence: allLetters,
    results: allResults16.map(r => ({ letter: r.letter, title: r.afterTitle, urlChanged: r.urlChanged })),
    finalTitle: final16.afterTitle
  });
  
  await browser.close();
  
  fs.writeFileSync(
    '/home/Chillizu/Projects/Deltarune/deltarune-arg-explore/pages-data/wardrobe-bruteforce.json',
    JSON.stringify(allResults, null, 2)
  );
  
  console.log('\n=== Analysis ===');
  const uniqueFinals = [...new Set(allResults.map(r => r.finalTitle))];
  console.log(`Unique final states: ${uniqueFinals.length}`);
  console.log(`States: ${uniqueFinals.join(', ')}`);
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
