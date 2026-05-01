const { chromium } = require('playwright-core');
const fs = require('fs');

async function analyze() {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://deltarune.com/sweepstakes/rules', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  const title = await page.title();
  const html = await page.content();
  
  const links = await page.evaluate(() => 
    Array.from(document.querySelectorAll('a')).map(a => ({
      href: a.href,
      text: a.textContent.trim()
    }))
  );
  
  const images = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt
    }))
  );
  
  const scripts = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script:not([src])')).map(s => s.textContent.substring(0, 500))
  );
  
  const result = {
    url: 'https://deltarune.com/sweepstakes/rules',
    title,
    htmlLength: html.length,
    links,
    images,
    scripts
  };
  
  fs.writeFileSync('/home/Chillizu/Projects/Deltarune/deltarune-arg-explore/page-analysis/_sweepstakes_rules-analysis.json', JSON.stringify(result, null, 2));
  console.log('Saved analysis for /sweepstakes/rules');
  console.log(`Title: ${title}`);
  console.log(`Links: ${links.length}`);
  console.log(`Images: ${images.length}`);
  
  await browser.close();
}

analyze().catch(console.error);
