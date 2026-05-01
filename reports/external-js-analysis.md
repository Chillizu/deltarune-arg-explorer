# Deltarune.com External JavaScript Analysis

## Files Analyzed
- `spamton.js` - Spamton character page script
- `spamton_dark.js` - Dark variant of spamton page script  
- `reallyplayer.js` - Audio player component

## Analysis Date: 2026-04-30

---

## 1. spamton.js

### Key Findings
- **Framework**: Uses jQuery + Fancybox + dayjs
- **Purpose**: Handles GIF animations, banner rotation, side image cycling, and video lazy-loading

### Notable Components

#### Marquee System
```javascript
createOrUpdateMarquee() // Creates "IT'S OVER!!!!!" text banner
```
- Displays "IT'S OVER!!!!!" in 24px yellow text
- Only shown on initial page load

#### GIF Randomizer
- Array of 18 GIF files from `/assets/images/coolgifs/`:
  - `cash1.gif`, `cash2.gif`, `cash3.gif`, `email1.gif`, `email2.gif`, `email3.gif`
  - `free1.gif` through `free5.gif`, `freemoney.gif`
  - `thanks1.gif`, `thanks2.gif`, `thanks3.gif`
  - `cool.gif`, `new.gif`
- Random positioning (top: 0-80%, left: 0-50%)
- Random rotation (-20 to +20 degrees)

#### Banner/Side Image Shuffle
- Randomly shows/hides banner elements
- Cycles through side images (`#big_money`, `#big_money_flip`)

#### Video Lazy Loading
```javascript
$(document).on('show.bs.modal', '.modal', function() {
  // Loads video sources from data attributes:
  // data-webm and data-mp4
})
```

### Secrets/Triggers Found
**NONE** - No hidden URLs, passwords, base64, localStorage, or conditional triggers

---

## 2. spamton_dark.js

### Key Findings
- **99% identical to spamton.js**
- **Only difference**: Empty marquee text instead of "IT'S OVER!!!!!"
  ```javascript
  // spamton.js: "IT'S OVER!!!!!"
  // spamton_dark.js: "" (empty string)
  ```

### Secrets/Triggers Found
**NONE** - No hidden features beyond the visual difference

---

## 3. reallyplayer.js

### Key Findings
- **Purpose**: Custom audio player with multiple track support
- **Framework**: jQuery

### Behavior
1. **Play**: Randomly selects one audio track from available `<audio>` elements
   ```javascript
   var playerToPlay = Math.floor( Math.random() * ( 1 + players.length - 1 ) );
   ```
2. **Pause**: Stops all playing audio
3. **Volume**: Controls all tracks simultaneously
4. **Exclusive Play**: Only one player can play at a time

### Event Listeners
- `play` event: Adds `.playing` class, pauses other players
- `pause` event: Removes `.playing` class
- Click handlers for `.play-button`
- Input/change handlers for `.volume` slider

### Secrets/Triggers Found
**NONE** - Straightforward audio player implementation

---

## Summary

### Hidden URLs
**0 found** - No hardcoded URLs beyond standard asset paths

### Conditional Logic/Easter Eggs
**0 found** - No secret triggers, password checks, or conditional reveals

### Base64 Encoded Strings
**0 found** - No encoded data

### Obfuscated Code
**0 found** - All code is clean and readable

### localStorage/Cookies
**0 found** - No state persistence

### Timed Events/Countdowns
**0 found** - No timers or date-based logic

### Console Messages
**0 found** - No console.log statements

### Undiscovered Pages
**0 found** - No references to other pages

---

## Assets Worth Investigating Further

Based on the JavaScript references:
- `/assets/images/coolgifs/` - Directory with 18 GIF files
- `/assets/images/coolgifs/cool.gif`
- `/assets/images/coolgifs/new.gif`
- Video files referenced via `data-webm` and `data-mp4` attributes in HTML

## Conclusion

These JavaScript files are **standard frontend utility scripts** without hidden ARG content. The actual secrets likely exist in:
- HTML source code (inline scripts, hidden elements)
- CSS files (hidden content, hover states)
- Server-side rendered content
- Other JavaScript files on different pages

**Recommendation**: Analyze the HTML source of secret pages for inline scripts and hidden DOM elements.
