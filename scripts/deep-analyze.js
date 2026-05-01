const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://deltarune.com';
const OUTPUT_DIR = '/home/Chillizu/Projects/Deltarune/deltarune-arg-explore';
const ANALYSIS_DIR = path.join(OUTPUT_DIR, 'page-analysis');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

if (!fs.existsSync(ANALYSIS_DIR)) fs.mkdirSync(ANALYSIS_DIR, { recursive: true });

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const PAGES_TO_ANALYZE = [
  '/', '/secret', '/sweepstakes/', '/sweepstakes/silence/', '/sweepstakes/credits',
  '/ramb/', '/romb/', '/code/', '/code/comments/', '/chair/',
  '/chapter4/message/', '/chapter4/thankyou/', '/chapter5/',
  '/bluecircle/', '/catpetterz/', '/egg/', '/icepalace_glaceir/',
  '/kris_dreemurr_kris/', '/rain/', '/the_n3w3st_g1rl_g1rl/',
  '/blink/', '/changingroom/', '/d_a_m_n_y_o_u_t_e_n_n_a/', '/dess/',
  '/dog/', '/lancer/', '/man/', '/sighting/', '/tv/',
  '/icee/', '/lostwheretheforestwouldgrow/', '/thepoorchildren/',
  '/shadowmen/', '/weather/', '/window/', '/windows/', '/december/',
  '/secretpipis/', '/chapter1/', '/chapter2/', '/chapter3/', '/chapter4/',
  '/update-092020/', '/update-092021/', '/update-092022/',
  '/help', '/newsletter'
];

async function analyzePage(browser, urlPath) {
  const fullUrl = urlPath.startsWith('http') ? urlPath : BASE_URL + urlPath;
  const safeName = urlPath.replace(/[^a-zA-Z0-9]/g, '_') || 'root';
  const pageFile = path.join(ANALYSIS_DIR, `${safeName}-analysis.json`);
  
  console.log(`\n=== Analyzing: ${fullUrl} ===`);
  
  const page = await browser.newPage();
  const consoleLogs = [];
  const networkRequests = [];
  

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text(), location: msg.location() });
  });
  

  page.on('pageerror', error => {
    consoleLogs.push({ type: 'pageerror', text: error.message });
  });
  

  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType()
    });
  });
  
  try {
    const response = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(3000);
    
    const status = response ? response.status() : 'unknown';
    const title = await page.title().catch(() => '');
    
  
    const pageSource = await page.content();
    
  
    const inlineScripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script:not([src])')).map((s, i) => ({
        index: i,
        content: s.textContent.substring(0, 10000)
      }));
    });
    
  
    const externalScripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).map(s => ({
        src: s.src,
        async: s.async,
        defer: s.defer
      }));
    });
    
  
    const eventInfo = await page.evaluate(() => {
      const results = [];
      const allElements = document.querySelectorAll('*');
      
    
      const inlineEvents = ['onclick', 'ondblclick', 'onmousedown', 'onmouseup', 
        'onmouseover', 'onmouseout', 'onmousemove', 'onkeydown', 'onkeyup', 'onkeypress',
        'onfocus', 'onblur', 'onchange', 'onsubmit', 'onload', 'onerror'];
      
      for (const el of allElements) {
        const handlers = {};
        for (const event of inlineEvents) {
          if (el[event]) {
            handlers[event] = el[event].toString().substring(0, 500);
          }
        }
        if (Object.keys(handlers).length > 0) {
          results.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            handlers
          });
        }
      }
      return results;
    });
    
  
    const hiddenElements = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      return all.filter(el => {
        const style = window.getComputedStyle(el);
        return (style.display === 'none' || style.visibility === 'hidden' || 
                style.opacity === '0' || el.classList.contains('hidden')) &&
               (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE');
      }).map(el => ({
        tag: el.tagName,
        id: el.id,
        className: el.className,
        text: el.textContent.trim().substring(0, 200),
        display: window.getComputedStyle(el).display,
        visibility: window.getComputedStyle(el).visibility,
        opacity: window.getComputedStyle(el).opacity
      }));
    });
    
  
    const interactiveElements = await page.evaluate(() => {
      const elements = [];
      document.querySelectorAll('a, button, input, select, textarea, [onclick], [role="button"]').forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        elements.push({
          index: i,
          tag: el.tagName,
          id: el.id,
          className: el.className,
          text: el.textContent.trim().substring(0, 100),
          href: el.href || '',
          type: el.type || '',
          visible: rect.width > 0 && rect.height > 0,
          x: rect.x, y: rect.y, width: rect.width, height: rect.height
        });
      });
      return elements;
    });
    
  
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.href,
        text: a.textContent.trim(),
        title: a.title,
        className: a.className
      }));
    });
    
  
    const metaTags = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('meta')).map(m => ({
        name: m.getAttribute('name') || '',
        property: m.getAttribute('property') || '',
        content: m.getAttribute('content') || ''
      }));
    });
    
  
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });
    
  
    const cookies = await page.context().cookies();
    
  
    const dataAttributes = await page.evaluate(() => {
      const results = [];
      const all = document.querySelectorAll('*');
      for (const el of all) {
        const attrs = {};
        for (const attr of el.attributes) {
          if (attr.name.startsWith('data-')) {
            attrs[attr.name] = attr.value;
          }
        }
        if (Object.keys(attrs).length > 0) {
          results.push({ tag: el.tagName, id: el.id, className: el.className, attrs });
        }
      }
      return results.slice(0, 100); // Limit
    });
    
  
    const interactionResults = [];
    const visibleInteractive = interactiveElements.filter(el => el.visible && el.width > 5 && el.height > 5);
    
    if (visibleInteractive.length > 0 && visibleInteractive.length < 50) {
      console.log(`  Testing ${visibleInteractive.length} interactive elements...`);
      
      for (const el of visibleInteractive.slice(0, 20)) { // Test max 20
        try {
          const beforeUrl = page.url();
          const beforeTitle = await page.title();
          
          let selector = '';
          if (el.id) selector = `#${el.id}`;
          else if (el.className) selector = `.${el.className.split(' ')[0]}`;
          else selector = el.tag.toLowerCase();
          
          if (el.tag === 'A' && el.href) {
            const links = await page.$$(`a[href="${el.href}"]`);
            if (links.length > 0) await links[0].click({ timeout: 3000 });
          } else if (selector) {
            const elem = await page.$(selector);
            if (elem) await elem.click({ timeout: 3000 });
          }
          
          await delay(1500);
          
          const afterUrl = page.url();
          const afterTitle = await page.title();
          
        
          const clickScreenshot = path.join(SCREENSHOTS_DIR, `${safeName}_click_${el.index}.png`);
          await page.screenshot({ path: clickScreenshot, fullPage: true });
          
          interactionResults.push({
            element: el,
            beforeUrl,
            beforeTitle,
            afterUrl,
            afterTitle,
            urlChanged: beforeUrl !== afterUrl,
            titleChanged: beforeTitle !== afterTitle,
            screenshot: clickScreenshot
          });
          
        
          if (beforeUrl !== afterUrl) {
            await page.goto(fullUrl, { waitUntil: 'networkidle' });
            await delay(2000);
          }
        } catch (err) {
          interactionResults.push({ element: el, error: err.message });
        }
      }
    }
    
    const analysis = {
      url: fullUrl,
      urlPath,
      status,
      title,
      analyzedAt: new Date().toISOString(),
      html: {
        length: pageSource.length,
        hasHiddenContent: hiddenElements.length > 0,
        hiddenElementsCount: hiddenElements.length,
        hiddenElements: hiddenElements.slice(0, 50)
      },
      scripts: {
        inline: inlineScripts,
        external: externalScripts
      },
      events: {
        inlineHandlers: eventInfo.slice(0, 50),
        inlineHandlersCount: eventInfo.length
      },
      interactive: {
        total: interactiveElements.length,
        visible: visibleInteractive.length,
        elements: interactiveElements.slice(0, 30)
      },
      links: {
        total: links.length,
        internal: links.filter(l => l.href.includes('deltarune.com')).length,
        external: links.filter(l => l.href.startsWith('http') && !l.href.includes('deltarune.com')).length,
        list: links.slice(0, 50)
      },
      meta: metaTags,
      localStorage: localStorageData,
      cookies: cookies,
      dataAttributes: dataAttributes.slice(0, 30),
      consoleLogs: consoleLogs.slice(0, 100),
      networkRequests: networkRequests.slice(0, 100),
      interactionResults
    };
    
    fs.writeFileSync(pageFile, JSON.stringify(analysis, null, 2));
    console.log(`  Saved analysis to ${pageFile}`);
    console.log(`  Interactive: ${interactiveElements.length}, Hidden: ${hiddenElements.length}, Links: ${links.length}`);
    console.log(`  Console logs: ${consoleLogs.length}, Network: ${networkRequests.length}`);
    console.log(`  Interactions tested: ${interactionResults.length}`);
    
    await page.close();
    return analysis;
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    fs.writeFileSync(pageFile, JSON.stringify({ url: fullUrl, error: err.message }, null, 2));
    await page.close();
    return null;
  }
}

async function main() {
  console.log('=== Deltarune ARG Deep Page Analysis ===');
  console.log(`Pages to analyze: ${PAGES_TO_ANALYZE.length}`);
  
  const browser = await chromium.launch({ 
    executablePath: '/usr/bin/chromium', 
    headless: true 
  });
  
  const results = [];
  for (const urlPath of PAGES_TO_ANALYZE) {
    const result = await analyzePage(browser, urlPath);
    if (result) results.push(result);
    await delay(1000);
  }
  
  await browser.close();
  

  const summary = {
    totalPages: PAGES_TO_ANALYZE.length,
    analyzed: results.length,
    pages: results.map(r => ({
      urlPath: r.urlPath,
      title: r.title,
      interactiveCount: r.interactive.total,
      hiddenCount: r.html.hiddenElementsCount,
      linkCount: r.links.total,
      consoleLogs: r.consoleLogs.length,
      networkRequests: r.networkRequests.length,
      interactionsTested: r.interactionResults.length
    }))
  };
  
  fs.writeFileSync(
    path.join(ANALYSIS_DIR, 'analysis-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log(`\n=== Analysis Complete ===`);
  console.log(`Analyzed ${results.length} pages`);
  console.log(`Results saved to ${ANALYSIS_DIR}`);
}

main().catch(console.error);
