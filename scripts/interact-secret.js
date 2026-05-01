const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://deltarune.com';
const OUTPUT_DIR = '/home/Chillizu/Projects/Deltarune/deltarune-arg-explore';
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function testSecretPage() {
  console.log('=== Testing /secret page interactions ===');
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const page = await browser.newPage();

  await page.goto(BASE_URL + '/secret', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await delay(3000);

  const elements = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    return all.filter(el => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return rect.width > 10 && rect.height > 10 &&
        (el.tagName === 'A' || el.tagName === 'BUTTON' || el.onclick ||
         style.cursor === 'pointer' || el.getAttribute('role') === 'button');
    }).map((el, i) => ({
      index: i,
      tag: el.tagName,
      id: el.id,
      className: el.className,
      text: el.textContent.trim().substring(0, 50),
      rect: el.getBoundingClientRect(),
      href: el.href || ''
    }));
  });

  console.log(`Found ${elements.length} interactive elements`);

  const interactions = [];
  for (const el of elements) {
    try {
      const selector = el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : `body *:nth-of-type(${el.index + 1})`;
      console.log(`Clicking element: ${el.tag} ${el.id || el.className || ''} (${el.text})`);

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `secret_before_${el.index}.png`), fullPage: true });

      const beforeUrl = page.url();
      const beforeTitle = await page.title();

      try {
        if (el.href) {
          await page.click(`a[href="${el.href}"]`, { timeout: 5000 });
        } else {
          await page.click(selector, { timeout: 5000 });
        }
      } catch (clickErr) {
        await page.evaluate((idx) => {
          const all = Array.from(document.querySelectorAll('*'));
          const clickable = all.filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 10 && rect.height > 10;
          });
          if (clickable[idx]) clickable[idx].click();
        }, el.index);
      }

      await delay(2000);

      const afterUrl = page.url();
      const afterTitle = await page.title();

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `secret_after_${el.index}.png`), fullPage: true });

      interactions.push({
        elementIndex: el.index,
        elementTag: el.tag,
        elementId: el.id,
        elementClass: el.className,
        elementText: el.text,
        beforeUrl,
        beforeTitle,
        afterUrl,
        afterTitle,
        changed: beforeUrl !== afterUrl || beforeTitle !== afterTitle
      });

      if (beforeUrl !== afterUrl) {
        console.log(`  URL changed: ${beforeUrl} -> ${afterUrl}`);
        await page.goBack({ waitUntil: 'domcontentloaded' });
        await delay(2000);
      }
    } catch (err) {
      console.log(`  Error clicking element ${el.index}: ${err.message}`);
      interactions.push({
        elementIndex: el.index,
        error: err.message
      });
    }
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pages-data', 'secret-interactions.json'),
    JSON.stringify(interactions, null, 2)
  );

  await browser.close();
  console.log(`Tested ${interactions.length} interactions on /secret`);
}

testSecretPage().catch(err => { console.error('Fatal error:', err); process.exit(1); });
