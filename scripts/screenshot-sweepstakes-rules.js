const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const context = await browser.newContext();
  
  await context.route('**/*', route => {
    if (route.request().url().includes('sweepstakes/rules')) {
      route.continue();
    } else {
      route.continue();
    }
  });
  
  const page = await context.newPage();
  
  page.on('download', download => {
    console.log('Download started:', download.suggestedFilename());
    download.cancel();
  });
  
  try {
    await page.goto('https://deltarune.com/sweepstakes/rules', { waitUntil: 'load', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ 
      path: '/home/Chillizu/Projects/Deltarune/deltarune-arg-explore/screenshots/_sweepstakes_rules.png', 
      fullPage: true 
    });
    console.log('Screenshot saved');
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
})();
