# Deltarune ARG Explorer

Deltarune.com 官方网站的深度代码级分析报告。覆盖 88 个 URL、56 个有内容页面、300+ 张截图、45 份 JSON 分析报告。

## 📊 核心发现

| 页面 | 关键发现 |
|------|---------|
| `/secret` | 16个衣柜确定性格局（非随机），5种结果（B/G/L/M赢/O跳转/其余重试） |
| `/chapter4/message/` | QWERTY键盘谜题 → **THANK YOU** |
| `/sweepstakes/` | Spamton抽奖活动，$322K慈善，11个webring隐藏链接 |
| `/thepoorchildren/` | 648个刮刮乐方块，隐藏tree→/egg链接 |
| `/dog/` | HALL OF FAME，暴力破解发现 |
| `/chair/` | 5%概率触发 `face.ogg` 稀有事件 |

### 频谱图隐写
- `face.ogg` — 13-15kHz隐藏人脸图像
- `digitalroots.mp3` — 10-15kHz嵌入 "DIGITAL ROOTS"
- `water.ogg` — 3.00s处异常频率尖峰

### 伪装文件
5个文件伪装为非HTML类型（ambulance.mp3、en_US.css、spamton.js等），实际返回 `room_dogcheck`。

## 📁 项目结构

```
├── deltarune-arg-simple.html  ← 主页：54个section的完整HTML报告
├── HANDOFF.md                 ← 上下文与工作记录
├── reports/                   ← 11份MD/TXT分析报告
├── scripts/                   ← 21个JS分析与交互测试脚本
├── screenshots/               ← 300+ PNG截图
├── audio/                     ← 33个ogg/mp3（从网站抓取）
├── page-analysis/             ← 45份JSON页面分析
├── spectrograms/              ← 频谱图图像
└── investigation/             ← 调查数据
```

## 🚀 查看报告

直接在浏览器打开 `deltarune-arg-simple.html`。需要 `screenshots/` 目录配合显示截图。

[Cloudflare Pages 在线版](https://deltarune-arg-explorer.pages.dev) — 含300+截图

## 🔧 技术栈

- HTML/CSS/JS 单文件报告
- Press Start 2P 字体（Google Fonts）
- Playwright 浏览器自动化
- Node.js 分析脚本
- ImageMagick/SoX 媒体分析
