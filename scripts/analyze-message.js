const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://deltarune.com';
const OUTPUT_DIR = '/home/Chillizu/Projects/Deltarune/deltarune-arg-explore';

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function analyzeChapter4Message() {
  console.log('=== Analyzing /chapter4/message/ ===');
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const page = await browser.newPage();

  await page.goto(BASE_URL + '/chapter4/message/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await delay(3000);

  const title = await page.title();
  console.log(`Title: "${title}"`);

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map((a, i) => ({
      index: i,
      href: a.href,
      text: a.textContent.trim(),
      className: a.className,
      id: a.id
    }))
  );

  console.log(`Found ${links.length} links:`);
  const internalLinks = [];
  for (const link of links) {
    const href = link.href;
    const text = link.text.substring(0, 60);
    if (href.includes('deltarune.com')) {
      console.log(`  [${link.index}] ${href} | "${text}"`);
      internalLinks.push(link);
    }
  }

  const pageSource = await page.content();
  const bodyText = await page.evaluate(() => document.body.innerText);

  const result = {
    url: BASE_URL + '/chapter4/message/',
    title,
    totalLinks: links.length,
    internalLinks,
    bodyTextPreview: bodyText.substring(0, 2000),
    pageSourcePreview: pageSource.substring(0, 3000)
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pages-data', 'chapter4-message-analysis.json'),
    JSON.stringify(result, null, 2)
  );

  await browser.close();
  console.log(`\nSaved analysis with ${internalLinks.length} internal links`);
}

async function testRarecats() {
  console.log('\n=== Testing /rarecats/ game ===');
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const page = await browser.newPage();

  await page.goto(BASE_URL + '/rarecats/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await delay(3000);

  const title = await page.title();
  console.log(`Title: "${title}"`);

  const images = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      className: img.className
    }))
  );
  console.log(`Images: ${images.length}`);

  const elements = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    return all.filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 10 && rect.height > 10 &&
        (el.tagName === 'A' || el.tagName === 'BUTTON' || el.onclick);
    }).map((el, i) => ({
      index: i, tag: el.tagName, id: el.id, className: el.className,
      text: el.textContent.trim().substring(0, 50)
    }));
  });
  console.log(`Interactive elements: ${elements.length}`);

  const pageSource = await page.content();

  const result = {
    url: BASE_URL + '/rarecats/',
    title,
    images,
    elements,
    pageSourcePreview: pageSource.substring(0, 3000)
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pages-data', 'rarecats-analysis.json'),
    JSON.stringify(result, null, 2)
  );

  await browser.close();
  console.log('Saved rarecats analysis');
}

async function main() {
  await analyzeChapter4Message();
  await testRarecats();
  console.log('\nDone.');
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
