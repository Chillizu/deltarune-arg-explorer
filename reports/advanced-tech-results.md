# DELTARUNE Advanced Technique Test Results

**Date:** 2026-05-01
**Target:** https://deltarune.com

---

## 1. User-Agent Testing

### Commands Used
```bash
curl -s -L -o /dev/null -w "%{size_download}" -A "<USER_AGENT>" https://deltarune.com<PATH>
```

### User-Agents Tested (5)
1. `Mozilla/5.0 (compatible; Googlebot/2.1)`
2. `Mozilla/5.0 (Nintendo Switch; WebApplet)`
3. `Mozilla/5.0 (compatible; bingbot/2.0)`
4. `curl/7.68.0`
5. `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`

### Paths Tested
| Path | Status | Size | Notes |
|------|--------|------|-------|
| `/` | 200 | 25240 | No UA differences |
| `/secret/` | 200 | 9319 | No UA differences |
| `/tv/` | 200 | 2389 | No UA differences |
| `/chapter5/` | 200 | 2602 | No UA differences |
| `/thepoorchildren/` | 200 | 66302 | No UA differences |

### Result
**All User-Agents returned identical content sizes for all paths.**
No User-Agent-based content differentiation detected.

> Note: Initial tests without `-L` showed size=0 because paths without trailing slashes return **308 Permanent Redirect** to the slashed version.

---

## 2. Referrer-Based Content Testing

### Commands Used
```bash
curl -s -L -e "https://deltarune.com/secret" https://deltarune.com/chair/
curl -s -L -e "https://deltarune.com/chair/" https://deltarune.com/sweepstakes/
curl -s -L -e "https://deltarune.com/chapter4/message/" https://deltarune.com/chapter4/thankyou/
```

### Results
| Target | Referrer | Status | Size |
|--------|----------|--------|------|
| `/chair/` | `deltarune.com/secret` | 200 | 3926 |
| `/sweepstakes/` | `deltarune.com/chair/` | 200 | 128744 |
| `/chapter4/thankyou/` | `deltarune.com/chapter4/message/` | 200 | 2386 |

### Comparison (with vs without referrer)
| Path | With Referrer | Without Referrer | Diff? |
|------|---------------|------------------|-------|
| `/chair/` | 3926 bytes | 3926 bytes | **Identical** |
| `/sweepstakes/` | 128744 bytes | 128744 bytes | **Identical** |
| `/chapter4/thankyou/` | 2386 bytes | 2386 bytes | **Identical** |

### Result
**No referrer-based content differentiation detected.** All pages served identical content regardless of Referrer header.

---

## 3. HTTP Method Testing

### Commands Used
```bash
curl -I https://deltarune.com/<path>    # HEAD
curl -X POST https://deltarune.com/<path>
curl -X PUT https://deltarune.com/<path>
curl -X DELETE https://deltarune.com/<path>
```

### Results
| Method | /secret | /tv | /code |
|--------|---------|-----|-------|
| HEAD | 308 | 308 | 308 |
| POST | 405 | 405 | 405 |
| PUT | 405 | 405 | 405 |
| DELETE | 405 | 405 | 405 |

### Result
- **HEAD** returns `308 Permanent Redirect` (redirects to trailing-slash version)
- **POST, PUT, DELETE** all return `405 Method Not Allowed`
- **No unusual responses detected.**

---

## 4. Time-Based Content Testing

### Findings

#### `/` (Homepage)
- No `setTimeout` or `setInterval` found
- Only time-related content: CSS `transition-duration` values (e.g., `duration-150`)

#### `/secret/`
```javascript
setTimeout(function() {
  ouch.play();
}, 500);
setTimeout(function() {
  resetWardrobes();
}, 1500);
```
**Analysis:** Audio/visual feedback delays for a click-based game. Not time-gated content.

#### `/chair/`
```javascript
setTimeout(function() {
  window.location.href = "/sweepstakes/";
}, 100);
```
**Analysis:** 100ms redirect after clicking a chair element. Not time-gated content.

#### `/tv/`, `/sweepstakes/`, `/chapter4/thankyou/`, `/thepoorchildren/`
- No `setTimeout` or `setInterval` found

### Result
**No time-gated or time-based hidden content detected.** All setTimeout calls are for UI/audio feedback, not content gating.

---

## 5. Japanese Version Check

### Command
```bash
curl -s https://deltarune.com/jp
```

### Result
**Status: 404** (Not Found)

However, the homepage (`/`) contains a link to:
- **https://deltarune.jp** (separate domain)

### deltarune.jp
**Status: 200, Size: 25804 bytes**
- Full Japanese localization exists on separate domain
- Title: `DELTARUNE - 『UNDERTALE』シリーズの新たな冒険、新章が登場！`
- Uses `/assets/css/ja.css` instead of `/assets/css/en_US.css`

---

## 6. Service Workers / WebSockets

### Commands Used
```bash
curl -s https://deltarune.com/service-worker.js
curl -s https://deltarune.com/sw.js
grep -i "websocket\|WebSocket\|EventSource\|navigator.serviceWorker" https://deltarune.com/
```

### Results
| Check | Status | Result |
|-------|--------|--------|
| `/service-worker.js` | 404 | Not found |
| `/sw.js` | 404 | Not found |
| Service Worker registration | - | None found in any page source |
| WebSocket usage | - | None found in any page source |
| EventSource usage | - | None found in any page source |

### Result
**No Service Workers or WebSockets detected.**

---

## 7. Additional Discoveries

### Hidden Page Chain (ARG Trail)

While analyzing `/thepoorchildren/`, a hidden link was discovered, leading to a chain of secret pages:

| Page | Status | Size | Title | Hidden? |
|------|--------|------|-------|---------|
| `/thepoorchildren/` | 200 | 66302 | `Therapy` | No |
| `/egg/` | 200 | 4629 | `Welcome to holidaygirl1225's game secrets, glitches, and theories blog!` | Yes (hidden `<a>` tag) |
| `/rain/` | 200 | 4745 | Same as above | Yes (linked from `/egg/`) |
| `/rarecats/` | 200 | 2805 | `0 points` | Yes (linked from `/rain/`) |
| `/windows/` | 200 | 10733 | `Aren't you forgetting something?` | Yes (linked from `/rarecats/`) |

### The Windows Puzzle (`/windows/`)
This page contains **53 links** that are permutations of the words:
- `the`, `where`, `would`, `forest`, `lost`, `grow`

All tested permutations returned **404 Not Found**.

Examples of permutations:
- `/wherewouldforestlostgrowthe`
- `/thegrowlostwouldforestwhere`
- `/forestwheregrowwouldlostthe`

This appears to be an interactive puzzle requiring the correct word order (likely solved by clicking the correct windows in the right sequence).

### Noindex Pages
The following secret pages include `<meta name="robots" content="noindex">`:
- `/egg/`
- `/rain/`
- `/rarecats/`
- `/windows/`

This confirms these pages are intentionally hidden from search engines.

---

## Summary

| Technique | Result |
|-----------|--------|
| User-Agent differentiation | **Negative** - No differences found |
| Referrer-based content | **Negative** - No differences found |
| Unusual HTTP methods | **Negative** - Only 308/405 responses |
| Time-gated content | **Negative** - No time-based gating |
| Japanese version (`/jp`) | **404** - But `deltarune.jp` exists |
| Service Workers/WebSockets | **Negative** - None found |
| Hidden content discovery | **POSITIVE** - Found ARG trail: `/thepoorchildren/` → `/egg/` → `/rain/` → `/rarecats/` → `/windows/` |

### Key Finding
The most significant discovery is the **hidden ARG page chain** starting from `/thepoorchildren/` (titled "Therapy"), leading through a series of `noindex` blog posts to the `/windows/` permutation puzzle.
