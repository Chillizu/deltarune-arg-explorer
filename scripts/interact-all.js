const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://deltarune.com';
const OUTPUT_DIR = '/home/Chillizu/Projects/Deltarune/deltarune-arg-explore';
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function testSecretWardrobes() {
  console.log('=== Testing /secret wardrobes (16 total) ===');
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const results = [];

  for (let i = 0; i < 16; i++) {
    const letter = String.fromCharCode(65 + i);
    const page = await browser.newPage();
    try {
      await page.goto(BASE_URL + '/secret', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await delay(2000);

      const beforeTitle = await page.title();
      console.log(`Wardrobe ${letter}: before="${beforeTitle}"`);

      const beforeScreenshot = path.join(SCREENSHOTS_DIR, `secret_before_${letter}.png`);
      await page.screenshot({ path: beforeScreenshot, fullPage: true });

      try {
        const btn = await page.$(`#wardrobe${letter}`);
        if (btn) {
          await btn.click();
          await delay(2000);
        }
      } catch (e) {
        await page.evaluate((l) => {
          const btn = document.getElementById(`wardrobe${l}`);
          if (btn) btn.click();
        }, letter);
        await delay(2000);
      }

      const afterTitle = await page.title();
      const afterUrl = page.url();
      const afterScreenshot = path.join(SCREENSHOTS_DIR, `secret_after_${letter}.png`);
      await page.screenshot({ path: afterScreenshot, fullPage: true });

      console.log(`  after="${afterTitle}" URL=${afterUrl}`);

      results.push({
        wardrobe: letter,
        beforeTitle,
        afterTitle,
        urlChanged: afterUrl !== BASE_URL + '/secret/',
        afterUrl,
        beforeScreenshot,
        afterScreenshot
      });
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
      results.push({ wardrobe: letter, error: err.message });
    }
    await page.close();
    await delay(500);
  }

  await browser.close();

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pages-data', 'secret-wardrobes-v2.json'),
    JSON.stringify(results, null, 2)
  );
  console.log(`\nSaved results for ${results.length} wardrobes`);
}

async function testPageInteractions(pagePath, pageName) {
  console.log(`\n=== Testing ${pagePath} ===`);
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const page = await browser.newPage();
  const results = [];

  try {
    await page.goto(BASE_URL + pagePath, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await delay(3000);

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
        text: el.textContent.trim().substring(0, 50),
        href: el.href || ''
      }));
    });

    console.log(`Found ${elements.length} interactive elements`);

    const screenshotPath = path.join(SCREENSHOTS_DIR, `${pageName}_initial.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    for (const el of elements.slice(0, 10)) {
      try {
        const beforeUrl = page.url();
        const beforeTitle = await page.title();

        try {
          if (el.href) {
            await page.click(`a[href="${el.href}"]`, { timeout: 3000 });
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

        await delay(1500);
        const afterUrl = page.url();
        const afterTitle = await page.title();

        const afterScreenshot = path.join(SCREENSHOTS_DIR, `${pageName}_after_${el.index}.png`);
        await page.screenshot({ path: afterScreenshot, fullPage: true });

        results.push({
          elementIndex: el.index,
          tag: el.tag,
          id: el.id,
          text: el.text,
          beforeTitle,
          afterTitle,
          urlChanged: beforeUrl !== afterUrl,
          afterUrl,
          titleChanged: beforeTitle !== afterTitle
        });

        if (beforeUrl !== afterUrl) {
          console.log(`  [${el.tag} ${el.id || ''}] URL: ${beforeUrl} -> ${afterUrl}`);
          await page.goto(BASE_URL + pagePath, { waitUntil: 'domcontentloaded' });
          await delay(2000);
        } else if (beforeTitle !== afterTitle) {
          console.log(`  [${el.tag} ${el.id || ''}] Title: "${beforeTitle}" -> "${afterTitle}"`);
        }
      } catch (err) {
        results.push({ elementIndex: el.index, error: err.message });
      }
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }

  await browser.close();

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pages-data', `${pageName}-interactions.json`),
    JSON.stringify(results, null, 2)
  );
  console.log(`Saved ${results.length} interactions for ${pagePath}`);
}

async function main() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  await testSecretWardrobes();
  await testPageInteractions('/chair/', 'chair');
  await testPageInteractions('/ramb/', 'ramb');
  await testPageInteractions('/romb/', 'romb');
  await testPageInteractions('/secretpipis/', 'secretpipis');

  console.log('\n=== All interaction tests complete ===');
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
