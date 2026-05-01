const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://deltarune.com';
const OUTPUT_DIR = '/home/Chillizu/Projects/Deltarune/deltarune-arg-explore';
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function testSweepstakesInteractions() {
  console.log('=== Testing /sweepstakes/ interactions ===');
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const page = await browser.newPage();
  
  await page.goto(BASE_URL + '/sweepstakes/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await delay(5000);
  
  const title = await page.title();
  console.log(`Title: "${title}"`);
  
  const elements = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    return all.filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 5 && rect.height > 5 &&
        (el.tagName === 'A' || el.tagName === 'BUTTON' || el.onclick ||
         el.getAttribute('role') === 'button' || window.getComputedStyle(el).cursor === 'pointer');
    }).map((el, i) => ({
      index: i,
      tag: el.tagName,
      id: el.id,
      className: el.className,
      text: el.textContent.trim().substring(0, 80),
      href: el.href || '',
      src: el.src || ''
    }));
  });
  
  console.log(`Found ${elements.length} interactive elements`);
  
  const results = [];
  const tested = elements.slice(0, 20);
  
  for (const el of tested) {
    try {
      const beforeUrl = page.url();
      const beforeTitle = await page.title();
      
      console.log(`Clicking [${el.index}] ${el.tag} "${el.text.substring(0, 40)}"`);
      
      try {
        if (el.href) {
          const links = await page.$$(`a[href="${el.href}"]`);
          if (links.length > 0) await links[0].click({ timeout: 3000 });
        } else if (el.id) {
          await page.click(`#${el.id}`, { timeout: 3000 });
        } else {
          await page.evaluate((idx) => {
            const all = Array.from(document.querySelectorAll('*'));
            const clickable = all.filter(e => {
              const r = e.getBoundingClientRect();
              return r.width > 5 && r.height > 5;
            });
            if (clickable[idx]) clickable[idx].click();
          }, el.index);
        }
      } catch (e) {}
      
      await delay(2000);
      
      const afterUrl = page.url();
      const afterTitle = await page.title();
      
      const screenshotPath = path.join(SCREENSHOTS_DIR, `sweepstakes_click_${el.index}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      results.push({
        elementIndex: el.index,
        tag: el.tag,
        id: el.id,
        text: el.text,
        href: el.href,
        beforeUrl,
        beforeTitle,
        afterUrl,
        afterTitle,
        urlChanged: beforeUrl !== afterUrl,
        titleChanged: beforeTitle !== afterTitle,
        screenshot: screenshotPath
      });
      
      if (beforeUrl !== afterUrl) {
        console.log(`  -> URL changed: ${afterUrl}`);
        await page.goto(BASE_URL + '/sweepstakes/', { waitUntil: 'domcontentloaded' });
        await delay(3000);
      } else if (beforeTitle !== afterTitle) {
        console.log(`  -> Title changed: "${afterTitle}"`);
      }
    } catch (err) {
      results.push({ elementIndex: el.index, error: err.message });
    }
  }
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pages-data', 'sweepstakes-interactions.json'),
    JSON.stringify(results, null, 2)
  );
  
  await browser.close();
  console.log(`Tested ${results.length} interactions on /sweepstakes/`);
}

async function testSilenceInteractions() {
  console.log('\n=== Testing /sweepstakes/silence/ interactions ===');
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const page = await browser.newPage();
  
  await page.goto(BASE_URL + '/sweepstakes/silence/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await delay(5000);
  
  const title = await page.title();
  console.log(`Title: "${title}"`);
  
  const elements = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    return all.filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 5 && rect.height > 5 &&
        (el.tagName === 'A' || el.tagName === 'BUTTON' || el.onclick ||
         el.getAttribute('role') === 'button');
    }).map((el, i) => ({
      index: i,
      tag: el.tagName,
      id: el.id,
      className: el.className,
      text: el.textContent.trim().substring(0, 80),
      href: el.href || ''
    }));
  });
  
  console.log(`Found ${elements.length} interactive elements`);
  
  const results = [];
  const tested = elements.slice(0, 15);
  
  for (const el of tested) {
    try {
      const beforeUrl = page.url();
      const beforeTitle = await page.title();
      
      console.log(`Clicking [${el.index}] ${el.tag} "${el.text.substring(0, 40)}"`);
      
      try {
        if (el.href) {
          const links = await page.$$(`a[href="${el.href}"]`);
          if (links.length > 0) await links[0].click({ timeout: 3000 });
        } else if (el.id) {
          await page.click(`#${el.id}`, { timeout: 3000 });
        } else {
          await page.evaluate((idx) => {
            const all = Array.from(document.querySelectorAll('*'));
            const clickable = all.filter(e => {
              const r = e.getBoundingClientRect();
              return r.width > 5 && r.height > 5;
            });
            if (clickable[idx]) clickable[idx].click();
          }, el.index);
        }
      } catch (e) {}
      
      await delay(2000);
      
      const afterUrl = page.url();
      const afterTitle = await page.title();
      
      results.push({
        elementIndex: el.index,
        tag: el.tag,
        text: el.text,
        beforeUrl,
        beforeTitle,
        afterUrl,
        afterTitle,
        urlChanged: beforeUrl !== afterUrl,
        titleChanged: beforeTitle !== afterTitle
      });
      
      if (beforeUrl !== afterUrl) {
        console.log(`  -> URL changed: ${afterUrl}`);
        await page.goto(BASE_URL + '/sweepstakes/silence/', { waitUntil: 'domcontentloaded' });
        await delay(3000);
      } else if (beforeTitle !== afterTitle) {
        console.log(`  -> Title changed: "${afterTitle}"`);
      }
    } catch (err) {
      results.push({ elementIndex: el.index, error: err.message });
    }
  }
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pages-data', 'silence-interactions.json'),
    JSON.stringify(results, null, 2)
  );
  
  await browser.close();
  console.log(`Tested ${results.length} interactions on /sweepstakes/silence/`);
}

async function testRarecatsGame() {
  console.log('\n=== Testing /rarecats/ game ===');
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const page = await browser.newPage();
  
  await page.goto(BASE_URL + '/rarecats/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await delay(3000);
  
  const title = await page.title();
  console.log(`Title: "${title}"`);
  
  const initialScreenshot = path.join(SCREENSHOTS_DIR, 'rarecats_initial.png');
  await page.screenshot({ path: initialScreenshot, fullPage: true });
  
  const pageSource = await page.content();
  
  const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'));
  console.log(`Has canvas: ${hasCanvas}`);
  
  const clickResults = [];
  const positions = [
    { x: 100, y: 100 }, { x: 200, y: 200 }, { x: 300, y: 300 },
    { x: 400, y: 400 }, { x: 500, y: 500 }, { x: 600, y: 300 }
  ];
  
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    try {
      const beforeTitle = await page.title();
      await page.mouse.click(pos.x, pos.y);
      await delay(1000);
      const afterTitle = await page.title();
      
      const screenshotPath = path.join(SCREENSHOTS_DIR, `rarecats_click_${i}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      clickResults.push({
        position: pos,
        beforeTitle,
        afterTitle,
        titleChanged: beforeTitle !== afterTitle,
        screenshot: screenshotPath
      });
      
      if (beforeTitle !== afterTitle) {
        console.log(`  Click at (${pos.x},${pos.y}): "${beforeTitle}" -> "${afterTitle}"`);
      }
    } catch (e) {
      clickResults.push({ position: pos, error: e.message });
    }
  }
  
  const result = {
    url: BASE_URL + '/rarecats/',
    title,
    hasCanvas,
    initialScreenshot,
    clicks: clickResults,
    pageSourcePreview: pageSource.substring(0, 5000)
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pages-data', 'rarecats-deep.json'),
    JSON.stringify(result, null, 2)
  );
  
  await browser.close();
  console.log(`Rarecats test complete. ${clickResults.filter(c => c.titleChanged).length} title changes detected.`);
}

async function testRombDeep() {
  console.log('\n=== Deep testing /romb/ ===');
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const page = await browser.newPage();
  
  await page.goto(BASE_URL + '/romb/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await delay(3000);
  
  const title = await page.title();
  console.log(`Title: "${title}"`);
  
  const allElements = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    return all.map((el, i) => ({
      index: i,
      tag: el.tagName,
      id: el.id,
      className: el.className,
      text: el.textContent.trim().substring(0, 100),
      rect: el.getBoundingClientRect(),
      hasOnClick: !!el.onclick,
      href: el.href || ''
    }));
  });
  
  const interactive = allElements.filter(el =>
    el.rect.width > 5 && el.rect.height > 5 &&
    (el.tag === 'A' || el.tag === 'BUTTON' || el.hasOnClick || el.href)
  );
  
  console.log(`Total elements: ${allElements.length}`);
  console.log(`Interactive elements: ${interactive.length}`);
  
  for (const el of interactive) {
    console.log(`  [${el.index}] ${el.tag} id=${el.id} class=${el.className} "${el.text.substring(0, 50)}"`);
  }
  
  const results = [];
  for (const el of interactive) {
    try {
      const beforeTitle = await page.title();
      
      try {
        if (el.id) {
          await page.click(`#${el.id}`, { timeout: 3000 });
        } else {
          await page.evaluate((idx) => {
            const all = Array.from(document.querySelectorAll('*'));
            if (all[idx]) all[idx].click();
          }, el.index);
        }
      } catch (e) {}
      
      await delay(1500);
      const afterTitle = await page.title();
      
      const screenshotPath = path.join(SCREENSHOTS_DIR, `romb_click_${el.index}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      results.push({
        elementIndex: el.index,
        tag: el.tag,
        id: el.id,
        className: el.className,
        text: el.text,
        beforeTitle,
        afterTitle,
        titleChanged: beforeTitle !== afterTitle
      });
      
      if (beforeTitle !== afterTitle) {
        console.log(`  -> Title changed: "${afterTitle}"`);
      }
    } catch (err) {
      results.push({ elementIndex: el.index, error: err.message });
    }
  }
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pages-data', 'romb-deep.json'),
    JSON.stringify(results, null, 2)
  );
  
  await browser.close();
  console.log(`Romb deep test complete. ${results.filter(r => r.titleChanged).length} title changes.`);
}

async function main() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  
  await testSweepstakesInteractions();
  await testSilenceInteractions();
  await testRarecatsGame();
  await testRombDeep();
  
  console.log('\n=== All deep interaction tests complete ===');
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
