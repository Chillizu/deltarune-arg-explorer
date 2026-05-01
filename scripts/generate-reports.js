const fs = require('fs');
const path = require('path');

const ANALYSIS_DIR = '/home/Chillizu/Projects/Deltarune/deltarune-arg-explore/page-analysis';
const OUTPUT_DIR = '/home/Chillizu/Projects/Deltarune/deltarune-arg-explore';

function loadAnalysis(filename) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ANALYSIS_DIR, filename), 'utf-8'));
  } catch (e) {
    return null;
  }
}

function generateHTMLReport() {
  const files = fs.readdirSync(ANALYSIS_DIR).filter(f => f.endsWith('-analysis.json') && !f.startsWith('bruteforce'));
  
  let sections = [];
  
  for (const fname of files.sort()) {
    const data = loadAnalysis(fname);
    if (!data || data.error) continue;
    
    const pagePath = data.urlPath || '/';
    const title = data.title || '?';
    const safeName = pagePath.replace(/[^a-zA-Z0-9]/g, '_') || 'root';
    
    let html = `    <section class="page-section" id="${safeName}">\n`;
    html += `        <div class="page-title">${pagePath} - ${title}</div>\n`;
    html += `        <div class="page-path">${data.url}</div>\n`;
    html += `        <div class="content-row">\n`;
    html += `            <div class="text-side">\n`;
    html += `                <div class="description">\n`;
    

    html += `                    <p>状态: ${data.status} | HTML长度: ${data.html?.length || 0}</p>\n`;
    html += `                    <p>交互元素: ${data.interactive?.total || 0} | 隐藏元素: ${data.html?.hiddenElementsCount || 0} | 链接: ${data.links?.total || 0}</p>\n`;
    

    if (data.html?.hiddenElementsCount > 0) {
      const meaningfulHidden = data.html.hiddenElements.filter(h => 
        !['HEAD', 'META', 'TITLE', 'LINK', 'SCRIPT', 'STYLE'].includes(h.tag) &&
        h.text?.length > 0
      );
      if (meaningfulHidden.length > 0) {
        html += `                    <p style="color:#ffeb3b">隐藏元素:</p>\n`;
        for (const h of meaningfulHidden.slice(0, 5)) {
          html += `                    <p>- ${h.tag}${h.id ? '#' + h.id : ''}${h.className ? '.' + h.className.split(' ').slice(0,2).join('.') : ''}: ${h.text.substring(0, 100)}</p>\n`;
        }
      }
    }
    

    if (data.scripts?.inline?.length > 0) {
      html += `                    <p style="color:#69f0ae">内联脚本: ${data.scripts.inline.length} 个</p>\n`;
      for (const s of data.scripts.inline.slice(0, 2)) {
        const preview = s.content.substring(0, 200).replace(/[\n\r]/g, ' ');
        html += `                    <div class="code-block">${preview}${s.content.length > 200 ? '...' : ''}</div>\n`;
      }
    }
    

    if (data.interactionResults?.length > 0) {
      const interesting = data.interactionResults.filter(i => 
        i.urlChanged || i.titleChanged || i.error
      );
      if (interesting.length > 0) {
        html += `                    <p style="color:#ffab40">交互测试结果:</p>\n`;
        for (const inter of interesting.slice(0, 5)) {
          const el = inter.element || {};
          html += `                    <p>[${el.tag}] "${el.text?.substring(0, 30) || ''}" -> `;
          if (inter.urlChanged) html += `URL变为: ${inter.afterUrl} `;
          if (inter.titleChanged) html += `标题变为: "${inter.afterTitle}" `;
          if (inter.error) html += `错误: ${inter.error}`;
          html += `</p>\n`;
        }
      }
    }
    

    if (data.links?.list?.length > 0) {
      const internal = data.links.list.filter(l => l.href?.includes('deltarune.com'));
      if (internal.length > 0) {
        html += `                    <p style="color:#64b5f6">内部链接:</p>\n`;
        for (const link of internal.slice(0, 8)) {
          html += `                    <p>- <a href="${link.href}">${link.text?.substring(0, 50) || link.href}</a></p>\n`;
        }
      }
    }
    
    html += `                </div>\n`;
    html += `            </div>\n`;
    

    const screenshotPath = path.join(OUTPUT_DIR, 'screenshots', `${safeName}.png`);
    if (fs.existsSync(screenshotPath)) {
      html += `            <div class="image-side"><img src="screenshots/${safeName}.png" class="screenshot" alt="${pagePath}"></div>\n`;
    }
    
    html += `        </div>\n`;
    html += `    </section>\n`;
    
    sections.push({ path: pagePath, html });
  }
  
  // Sort sections
  sections.sort((a, b) => a.path.localeCompare(b.path));
  
  // Generate full HTML
  let html = `<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n`;
  html += `    <meta charset="UTF-8">\n`;
  html += `    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
  html += `    <title>Deltarune ARG 深度分析报告</title>\n`;
  html += `    <style>\n`;
  html += `        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');\n`;
  html += `        * { margin: 0; padding: 0; box-sizing: border-box; }\n`;
  html += `        body { background-color: #000011; color: #ffffff; font-family: 'Press Start 2P', monospace; font-size: 11px; line-height: 1.8; }\n`;
  html += `        .navbar { background-color: #1a237e; padding: 15px; text-align: center; position: sticky; top: 0; z-index: 100; }\n`;
  html += `        .navbar a { color: #ffffff; text-decoration: none; margin: 0 15px; font-size: 10px; }\n`;
  html += `        .navbar a:hover { text-decoration: underline; }\n`;
  html += `        .page-section { max-width: 1200px; margin: 0 auto; padding: 40px 20px; border-bottom: 1px solid #1a237e; }\n`;
  html += `        .page-title { font-size: 16px; color: #ffeb3b; margin-bottom: 20px; }\n`;
  html += `        .page-path { font-size: 10px; color: #64b5f6; margin-bottom: 20px; }\n`;
  html += `        .content-row { display: flex; gap: 30px; align-items: flex-start; }\n`;
  html += `        .text-side { flex: 1; min-width: 0; }\n`;
  html += `        .image-side { flex: 1; min-width: 0; }\n`;
  html += `        .screenshot { max-width: 100%; border: 2px solid #283593; display: block; }\n`;
  html += `        .description p { margin-bottom: 12px; color: #e0e0e0; }\n`;
  html += `        .code-block { background: #0a0e27; border: 1px solid #283593; padding: 15px; margin: 15px 0; font-family: monospace; font-size: 9px; overflow-x: auto; white-space: pre-wrap; color: #bbdefb; max-height: 200px; overflow-y: auto; }\n`;
  html += `        .wardrobe-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 10px; }\n`;
  html += `        .wardrobe-table th, .wardrobe-table td { border: 1px solid #283593; padding: 8px; text-align: left; }\n`;
  html += `        .wardrobe-table th { background: #1a237e; color: #ffeb3b; }\n`;
  html += `        .wardrobe-table td { color: #e0e0e0; }\n`;
  html += `        .won { color: #69f0ae; } .lost { color: #ff5252; } .link { color: #ffeb3b; } .retry { color: #ffab40; }\n`;
  html += `        .footer { text-align: center; padding: 40px 20px; color: #546e7a; font-size: 9px; }\n`;
  html += `        .hidden-detail { display: none; }\n`;
  html += `        .toggle-btn { background: #1a237e; color: #ffeb3b; border: 1px solid #283593; padding: 5px 10px; cursor: pointer; margin: 10px 0; font-family: 'Press Start 2P', monospace; font-size: 9px; }\n`;
  html += `        .toggle-btn:hover { background: #283593; }\n`;
  html += `        @media (max-width: 768px) { .content-row { flex-direction: column; } .navbar a { display: block; margin: 5px 0; } }\n`;
  html += `    </style>\n`;
  html += `</head>\n<body>\n`;
  
  // Navbar
  html += `    <nav class="navbar">\n`;
  html += `        <a href="#home">首页</a>\n`;
  html += `        <a href="#secret">衣柜</a>\n`;
  html += `        <a href="#sweepstakes">Sweepstakes</a>\n`;
  html += `        <a href="#silence">Silence</a>\n`;
  html += `        <a href="#pages">其他</a>\n`;
  html += `    </nav>\n`;
  
  // Header
  html += `    <section class="page-section" id="home">\n`;
  html += `        <div class="page-title">DELTARUNE ARG 深度分析报告</div>\n`;
  html += `        <div class="page-path">https://deltarune.com</div>\n`;
  html += `        <div class="content-row">\n`;
  html += `            <div class="text-side">\n`;
  html += `                <div class="description">\n`;
  html += `                    <p>本次深度分析覆盖 ${sections.length} 个页面。</p>\n`;
  html += `                    <p>包含完整 HTML 结构分析、JavaScript 行为分析、隐藏元素探测、交互测试。</p>\n`;
  html += `                </div>\n`;
  html += `            </div>\n`;
  html += `            <div class="image-side"><img src="screenshots/_.png" class="screenshot" alt="首页"></div>\n`;
  html += `        </div>\n`;
  html += `    </section>\n`;
  
  // Sections
  for (const section of sections) {
    html += section.html;
  }
  
  // Footer
  html += `    <div class="footer"><p>Deltarune ARG 深度分析报告</p><p>Generated: ${new Date().toISOString()}</p></div>\n`;
  html += `</body>\n</html>`;
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'deltarune-arg-detailed.html'), html);
  console.log(`Generated detailed HTML report with ${sections.length} sections`);
}

function generateMDReport() {
  const files = fs.readdirSync(ANALYSIS_DIR).filter(f => f.endsWith('-analysis.json') && !f.startsWith('bruteforce'));
  
  let md = '# DELTARUNE ARG 深度分析报告\n\n';
  md += `生成时间: ${new Date().toISOString()}\n\n`;
  md += `分析页面数: ${files.length}\n\n`;
  
  for (const fname of files.sort()) {
    const data = loadAnalysis(fname);
    if (!data || data.error) {
      md += `## ${fname.replace('-analysis.json', '')} - 错误\n\n`;
      md += `错误: ${data?.error || '无法加载'}\n\n`;
      continue;
    }
    
    const pagePath = data.urlPath || '/';
    md += `## ${pagePath}\n\n`;
    md += `- **标题**: ${data.title || 'N/A'}\n`;
    md += `- **状态**: ${data.status || 'N/A'}\n`;
    md += `- **URL**: ${data.url}\n`;
    md += `- **HTML长度**: ${data.html?.length || 0}\n`;
    md += `- **交互元素数**: ${data.interactive?.total || 0}\n`;
    md += `- **隐藏元素数**: ${data.html?.hiddenElementsCount || 0}\n`;
    md += `- **链接数**: ${data.links?.total || 0}\n\n`;
    

    if (data.html?.hiddenElementsCount > 0) {
      const meaningful = data.html.hiddenElements.filter(h => 
        !['HEAD', 'META', 'TITLE', 'LINK', 'SCRIPT', 'STYLE'].includes(h.tag)
      );
      if (meaningful.length > 0) {
        md += '### 隐藏元素\n\n';
        for (const h of meaningful) {
          md += `- **${h.tag}**${h.id ? ' #' + h.id : ''}${h.className ? ' .' + h.className : ''}: ${h.text?.substring(0, 100) || '(无文本)'}\n`;
        }
        md += '\n';
      }
    }
    

    if (data.scripts?.inline?.length > 0) {
      md += `### JavaScript\n\n`;
      md += `内联脚本数: ${data.scripts.inline.length}\n\n`;
      for (const s of data.scripts.inline.slice(0, 2)) {
        md += '```javascript\n';
        md += s.content.substring(0, 500) + (s.content.length > 500 ? '\n...' : '') + '\n';
        md += '```\n\n';
      }
    }
    

    if (data.scripts?.external?.length > 0) {
      md += '### 外部脚本\n\n';
      for (const s of data.scripts.external) {
        md += `- ${s.src}\n`;
      }
      md += '\n';
    }
    

    if (data.events?.inlineHandlersCount > 0) {
      md += `### 事件处理器\n\n`;
      for (const h of data.events.inlineHandlers.slice(0, 5)) {
        md += `- **${h.tag}**${h.id ? ' #' + h.id : ''}: ${Object.keys(h.handlers).join(', ')}\n`;
      }
      md += '\n';
    }
    

    if (data.interactionResults?.length > 0) {
      const interesting = data.interactionResults.filter(i => 
        i.urlChanged || i.titleChanged || i.error
      );
      if (interesting.length > 0) {
        md += '### 交互测试结果\n\n';
        for (const inter of interesting) {
          const el = inter.element || {};
          md += `- [${el.tag}] "${el.text?.substring(0, 30) || 'N/A'}"\n`;
          if (inter.urlChanged) md += `  - URL变化: ${inter.afterUrl}\n`;
          if (inter.titleChanged) md += `  - 标题变化: "${inter.afterTitle}"\n`;
          if (inter.error) md += `  - 错误: ${inter.error}\n`;
        }
        md += '\n';
      }
    }
    

    if (data.links?.list?.length > 0) {
      const internal = data.links.list.filter(l => l.href?.includes('deltarune.com'));
      if (internal.length > 0) {
        md += '### 内部链接\n\n';
        for (const link of internal.slice(0, 10)) {
          md += `- [${link.text?.substring(0, 50) || 'Link'}](${link.href})\n`;
        }
        md += '\n';
      }
    }
    

    if (data.consoleLogs?.length > 0) {
      const errors = data.consoleLogs.filter(l => l.type === 'error' || l.type === 'pageerror');
      if (errors.length > 0) {
        md += '### 控制台错误\n\n';
        for (const log of errors.slice(0, 5)) {
          md += `- ${log.type}: ${log.text?.substring(0, 100)}\n`;
        }
        md += '\n';
      }
    }
    
    md += '---\n\n';
  }
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'DELTARUNE_ARG_DETAILED_REPORT.md'), md);
  console.log(`Generated detailed MD report`);
}

// Main
console.log('=== Generating Reports ===');
generateHTMLReport();
generateMDReport();
console.log('Done!');
