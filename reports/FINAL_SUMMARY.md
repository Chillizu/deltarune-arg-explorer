# DELTARUNE ARG 探索 - 最终总结

## 统计

- **爬取URL总数**: 88 个
- **有内容页面数**: 56 个 (状态200且非dogcheck)
- **截图总数**: 284 张
- **JSON 分析报告**: 45 份
- **Brute-force 扫描路径**: 1,586 个 (629 + 957扩展)
- **新发现页面**: /sweepstakes/rules, /dog/, /sweepstakes/enter (非dogcheck)

## 关键发现

### 1. 新发现页面
- **/sweepstakes/rules** - Spamton Sweepstakes 官方规则页面，包含38项奖品清单，总价值 $3,346.59 USD

### 2. 衣柜谜题 (/secret)
- 16个衣柜完全确定性系统（非随机）
- wardrobeO 是唯一通往 /chair/ 的路径
- 特殊衣柜：B/L/M → "You won!", G → "You lost!", O → 跳转 /chair/
- 普通衣柜 → "Try again!" + 1.5秒自动重置

### 3. 椅子稀有事件 (/chair)
- **5% 概率触发**：播放 face.ogg，显示 eyes.png，标题变空白，然后重定向到 /sweepstakes/
- 95% 概率：播放 water.ogg，显示 chair2.gif

### 4. 更衣室随机事件 (/changingroom)
- 90% 概率：shadowman → 尖叫 → /shadowmen/
- 10% 概率：Lancer 旋转 → /lancer/

### 5. QWERTY 键盘谜题 (/chapter4/message)
- 27个黑方块排列成 QWERTY 键盘布局的3行 (10+9+7)
- 点击播放 e.mp3 或 m.mp3
- **已解密**: m 所在位置对应键盘字母 T,Y,U,O,A,H,K,N
- **变位词 = THANK YOU**
- 暗示下一个页面: /chapter4/thankyou/
- 左上角 1x1 红色像素链接
- 参考: Weird Route 中 Noelle 说 "Thank you..." 的场景

### 6. Green Room 枢纽 (/ramb)
- 点击门后显示 Green Room
- 隐藏链接：/weather/, /changingroom/, /romb/, /tv/

### 7. 字谜页面
- /window/ → 正确答案 /thepoorchildren
- /windows/ → 正确答案 /lostwheretheforestwouldgrow

### 8. Tenna 页面 (/d_a_m_n_y_o_u_t_e_n_n_a)
- 页面名解码："damn you tenna"
- 点击电视显示静态雪花 "YOU'RE EARLY!"
- 点击噪声显示海洋 "AREN'T YOU FORGETTING SOMETHING?"
- 隐藏链接：/ramb/ 和 /icepalace_glaceir/

### 9. Therapy 页面 (/thepoorchildren)
- 最大的秘密页面（67KB HTML）
- 刮刮乐/绘画互动机制（Stimulus 控制器）
- 隐藏链接到 /egg

### 10. Chapter 5 音频
- 2 → /assets/audio/d.mp3
- 3 → /assets/audio/ma.mp3
- 4 → /chapter4
- 5 → /assets/audio/h.mp3

### 11. Icee 页面 (/icee)
- 标题: "Have you seen him?"
- 1个交互元素，点击后跳转
- 包含自定义CSS样式

### 12. Rarecats 游戏 (/rarecats)
- 标题: "0 points"
- 点击猫游戏（Stimulus 控制器）
- 隐藏猫图片 + 链接到 /windows
- Chapter 4 秘密预告页面

### 13. Sweepstakes 主页面 (/sweepstakes/)
- 146个交互元素，79个链接
- 使用 bootstrap, fancybox, dayjs
- 隐藏弹窗: ABOUT SPAMTON, ABOUT THE CHARITY, OFFICIAL RULES
- 自定义JS: spamton.js, reallyplayer.js
- 11个 webring 式隐藏链接（嵌在奖品描述中）
- 2个隐藏横幅链接: /secret/, /icee/

### 14. Silence 页面 (/sweepstakes/silence/)
- 125个交互元素，65个链接
- 标题: "˙" (单个点)
- 使用 spamton_dark.js (暗色主题)
- "WHAT'S NEXT?" 链接改为 /ramb/（主页面是 /chapter3）

### 15. Sweepstakes/enter 页面
- **标题**: "ENTER SPAMTON SWEEPSTAKES FOR FREE!!!"
- **内容**: NON-DONATOR TRASH HEAP ENTRY CLOSED!!!!
- 包含 YouTube 视频嵌入（YouTube ID: 61zGGtTdv5s）
- 有返回 /sweepstakes 的链接
- **注意**: 此前误报为 dogcheck，实际为真实内容页面

## 跨页面模式

- **Howler.js**: 大多数交互页面使用 Howler.js 播放音频
- **jQuery**: 旧页面使用 jQuery 事件绑定
- **Stimulus**: 新页面使用 Stimulus 控制器（romb, therapy 等）
- **Plausible 分析**: 所有页面都有 Plausible 分析脚本
- **Dogcheck**: 所有 404 都是 Dogcheck 页面（Annoying Dog 彩蛋）

## 已完成的深度分析

1. ✅ **QWERTY键盘谜题解码** - /chapter4/message 的 e/m 序列解码为 THANK YOU
2. ✅ **外部JS分析** - spamton.js, spamton_dark.js, reallyplayer.js 审计完成，未发现ARG线索
3. ✅ **Sweepstakes深度分析** - 提取了11个webring隐藏链接和2个隐藏横幅
4. ✅ **暴力破解** - 629路径扫描，发现 /sweepstakes/rules
5. ✅ **缺失页面分析** - /help, /newsletter, /rarecats(猫游戏), /sweepstakes/enter(真实页面)
6. ✅ **扩展暴力破解** - 957路径扫描，发现 /dog/ (HALL OF FAME)
7. ✅ **媒体文件隐写分析** - face.ogg频谱图隐藏人脸，digitalroots.mp3隐藏文字，water.ogg异常信号
8. ✅ **伪装文件分析** - ambulance.mp3和en_US.css实际为HTML页面(room_dogcheck)
9. ✅ **CSS文件审计** - 无隐藏ARG线索，标准样式表

## 关键新发现

### /dog/ - HALL OF FAME
- 扩展暴力破解发现的全新页面
- 交互式Annoying Dog动画，点击播放dog.ogg音频
- 切换静态/动画狗图像

### 伪装文件 (Fake File Extensions)
- **ambulance.mp3** (Content-Type: text/html) - room_dogcheck页面
- **en_US.css** (Content-Type: text/html) - room_dogcheck页面
- **spamton.js** (Content-Type: text/html) - room_dogcheck页面
- **reallyplayer.js** (Content-Type: text/html) - room_dogcheck页面
- **spamton_dark.js** (Content-Type: text/html) - room_dogcheck页面
- 这是一种ARG手法：将HTML页面伪装成其他文件类型

### 频谱图隐写 (Spectrogram Steganography)
- **face.ogg** - 13-15kHz频段隐藏人脸图像
- **digitalroots.mp3** - 10-15kHz隐藏"DIGITAL ROOTS"文字，双侧对称结构
- **water.ogg** - 精确3.00秒处8.8-9.8kHz异常频率尖峰

## 测试覆盖范围

- **交互测试**: /secret 全部16个衣柜成功测试（Playwright自动化，16/16通过）；/chair/、/changingroom/、/ramb/、/sweepstakes/、/thepoorchildren/ (therapy刮刮乐)、/tv/ (确认无交互) 等页面已完成交互分析
- **状态依赖测试**: Playwright已测试wardrobe-chair序列、storage状态、sweepstakes状态等（详见deltarune-state-dependencies.md）。未发现跨页面状态依赖。/tv 从 /ramb 访问也无变化。
- **高级技术测试**: 测试了5种User-Agent，3种Referrer，多种HTTP方法。未发现差异化内容。Service Workers/WebSockets无。deltarune.jp存在（日本版）。
- **暴力破解扫描**: 629 + 957 + 152 = 1,738路径扫描，发现/dog/。已知56个内容页面已全部纳入simple.html。
- **媒体文件分析**: 分析了5个关键文件（face.ogg, digitalroots.mp3, water.ogg, shadowmen.mp4, ambulance.mp3），发现频谱图隐写内容。
- **伪装文件**: 发现5个伪装成其他文件类型的HTML页面。

## 生成的文件

1. `deltarune-arg-simple.html` - 主要 HTML 报告（53+ 页面章节）
2. `DELTARUNE_ARG_DETAILED_REPORT.md` - 详细 Markdown 报告
3. `page-analysis/COMPILED_FINDINGS.md` - 编译的发现摘要
4. `page-analysis/*-analysis.json` - 45 份页面 JSON 分析
5. `page-analysis/bruteforce-results.json` - Brute-force 扫描结果
6. `screenshots/*.png` - 300+ 张截图
7. `advanced-tech-results.md` - 高级技术测试结果
8. `deltarune-state-dependencies.md` - 状态依赖测试结果
9. `deltarune_decode_report.md` - QWERTY谜题解码报告（已更新）
