const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://deltarune.com';
const OUTPUT_DIR = '/home/Chillizu/Projects/Deltarune/deltarune-arg-explore';
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');
const DATA_FILE = path.join(OUTPUT_DIR, 'pages-data', 'all-pages.json');

const MISSING = ['/dog/', '/dess/', '/sweepstakes/enter/'];

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); } catch (e) { return {}; }
  }
  return {};
}

function saveData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function explorePage(browser, urlPath, pageData) {
  let page = null;
  const fullUrl = urlPath.startsWith('http') ? urlPath : BASE_URL + urlPath;
  const safeName = urlPath.replace(/[^a-zA-Z0-9]/g, '_') || 'root';

  try {
    page = await browser.newPage();
    console.log(`Exploring: ${fullUrl}`);
    const response = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await delay(3000);

    const status = response ? response.status() : 'unknown';
    const title = await page.title().catch(() => '');
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${safeName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.href, text: a.textContent.trim(), title: a.title, className: a.className
      }))
    );
    const images = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src, alt: img.alt, className: img.className
      }))
    );
    const interactiveElements = await page.evaluate(() => {
      const elements = [];
      document.querySelectorAll('button, [onclick], [role="button"], input[type="submit"], input[type="button"]').forEach(el => {
        elements.push({ tag: el.tagName, text: el.textContent.trim().substring(0, 100), className: el.className, id: el.id });
      });
      return elements;
    });

    const pageSource = await page.content();
    const hasHiddenContent = pageSource.includes('display:none') || pageSource.includes('visibility:hidden');
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) { data[localStorage.key(i)] = localStorage.getItem(localStorage.key(i)); }
      return data;
    });

    pageData[urlPath] = {
      url: fullUrl, status, title, screenshot: screenshotPath,
      links: links.filter(l => l.href.includes('deltarune.com') || !l.href.startsWith('http')),
      externalLinks: links.filter(l => l.href.startsWith('http') && !l.href.includes('deltarune.com')),
      images, interactiveElements, hasHiddenContent, localStorage: localStorageData,
      visitedAt: new Date().toISOString()
    };
    console.log(`  OK: Status ${status}, Title: "${title}", Links: ${links.length}`);
    await page.close();
  } catch (err) {
    console.log(`  FAIL: ${err.message}`);
    pageData[urlPath] = { url: fullUrl, status: 'error', error: err.message, visitedAt: new Date().toISOString() };
    if (page) await page.close().catch(() => {});
  }
}

async function main() {
  console.log('=== Missing Pages Explorer ===');
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const pageData = loadData();
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });

  try {
    for (const urlPath of MISSING) {
      if (pageData[urlPath] && pageData[urlPath].status !== 'error') continue;
      await explorePage(browser, urlPath, pageData);
      saveData(pageData);
      await delay(2000);
    }
  } finally { await browser.close(); }

  saveData(pageData);
  console.log('Done.');
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
