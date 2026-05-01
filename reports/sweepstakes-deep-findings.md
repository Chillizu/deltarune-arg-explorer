# Sweepstakes Deep Analysis Findings

**Analysis Date:** 2026-04-30
**Pages Analyzed:**
- `https://deltarune.com/sweepstakes/` (73 internal links)
- `https://deltarune.com/sweepstakes/silence/` (61 internal links)

---

## NEW Pages Discovered (NOT in known pages list)

| Page | Link Text | Source | Notes |
|------|-----------|--------|-------|
| `/enter` | "deltarune.com/enter" | Rules modal | Referenced inside official rules text |
| `/sweepstakes/rules` | "Official Rules" | Footer | Real page, linked in both versions |

**Note:** `/sweepstakes/credits` IS already known (has analysis file).

---

## Hidden Banner Links (CSS-hidden on /sweepstakes/)

Found **2 hidden banner links** with class `banner hidden` (display:none, visibility:hidden):

1. `/secret/` - Hidden banner
2. `/icee/` - Hidden banner

These sit alongside the **visible** banners:
- `/secretpipis/` (visible)
- `/code/` (visible on both pages)

---

## Secret Webring Links (embedded in prize modal text)

Both pages contain **11 hidden page links** disguised as Spamton-flavored text inside prize description modals:

| Link Text | URL | Found In Modal |
|-----------|-----|----------------|
| `[scrap heap]` | `/ramb` | Fangamer Gift Cards, Shirtwear (x2) |
| `[$#*] YOURSELF` | `/sighting/` | Toilet Paper |
| `[cute li'l guys!]` | `/lancer/` | Cookie of Boy |
| `[frosted cereal box]` | `/catpetterz/` | Cardboard Box |
| `[Fluff] SELLS.` | `/shadowmen/` | Nurse Costume |
| `YOUR BEST` | `/kris_dreemurr_kris/` | Heart Locket |
| `[they're multiplying...!]` | `/bluecircle/` | Bath Rug |
| `THERE LIES THE NAME OF` | `/the_n3w3st_g1rl_g1rl/` | Wristwatch |
| `[Blink]` | `/blink/` | Photo Cube |
| `[It hurts! It Hurts!]` | `/d_a_m_n_y_o_u_t_e_n_n_a/` | Wedding Ring |
| `What's next?` | `/chapter3` | Footer (main page only) |

**Key difference:** On the silence page, the footer "WHAT'S NEXT?" links to `/ramb` instead of `/chapter3`.

---

## /sweepstakes/ vs /sweepstakes/silence/ Differences

| Feature | Main | Silence |
|---------|------|---------|
| Title | "SPAMTON SWEEPSTAKES!!!" | "˙" (just a dot) |
| Marquee text | "IT'S OVER!!!!!" | "" (empty) |
| JavaScript | `spamton.js` | `spamton_dark.js` |
| Color scheme | Full color | Grayscale (#909090 overrides) |
| Auction section | Yes (Berdly + Mona) | **Removed entirely** |
| About/Charity/Rules buttons | Visible | **Removed** |
| Hidden elements | 139 | 207 |
| "What's next?" link | `/chapter3` | `/ramb` |
| Meta description | Normal | " " (single space) |
| Meta robots | (not set) | `noindex` |

---

## Hidden Modals & Conditional Content

### Prize Modals with NULL Video Data
The following modals have `data-mp4="null"` / `data-webm="null"`, suggesting potential unlockable/placeholder content:

- **Shirtwear Update Patch** modal
- **Spamton's Old Socks** modal
- **Worm from the String** modal
- **Pipis Bath Rug** modal
- **Embroidered Bathrobe** modal

### SPAMTON'S FATE Modal
- **Price:** `$???` (unknown/unlockable)
- **Text preview:** "Spamton... Aren't you just sick of him? Why does he get all the attention? Why should he be so special? He wasn't any better than any of us. What do you think...? Let's buy Spamton'..."
- **Visibility:** Hidden by default, triggered via button
- **No video data attached**

### Standard Hidden Modals (both pages)
- `about_modal` - About Spamton
- `charity_modal` - About Child's Play charity
- `rules_modal` - Official sweepstakes rules

---

## Audio Assets Referenced

### /sweepstakes/ (main page)
- `midi-bigshot_byShinkoNetCavy.mp3`
- `midi-cybers-world_byShinkoNetCavy.mp3`
- `midi-pandora-palace_byShinkoNetCavy.mp3`
- `midi-spamton.mp3`
- `midi-spamton-battle.mp3`

### /sweepstakes/silence/
- `midi-dialtone.mp3` (single eerie tone instead of music)

---

## YouTube Embeds

- **Main page:** `youtube-nocookie.com/embed/61zGGtTdv5s`
- **Silence page:** `youtube-nocookie.com/embed/lkuzNFoVz_w`

Different videos for each version.

---

## Summary of All Unique Page Links Found

### From /sweepstakes/ (non-asset links only)
```
#donate
/sweepstakes/silence/
/secretpipis/
/secret/          [HIDDEN BANNER]
/icee/            [HIDDEN BANNER]
/code/
/enter            [NEW - in rules text]
/ramb
/sighting/
/lancer/
/catpetterz/
/shadowmen/
/kris_dreemurr_kris/
/bluecircle/
/the_n3w3st_g1rl_g1rl/
/blink/
/d_a_m_n_y_o_u_t_e_n_n_a/
/chapter3
/sweepstakes/rules   [NEW]
/sweepstakes/credits
```

### From /sweepstakes/silence/ (non-asset links only)
```
#donate
/code/
/enter            [NEW - in rules text]
/ramb             [x2 - one in text, one as footer link]
/sighting/
/lancer/
/catpetterz/
/shadowmen/
/kris_dreemurr_kris/
/bluecircle/
/the_n3w3st_g1rl_g1rl/
/blink/
/d_a_m_n_y_o_u_t_e_n_n_a/
/sweepstakes/rules   [NEW]
/sweepstakes/credits
```

---

## Recommendations

1. **Probe `/enter`** - Referenced in official rules but not yet discovered. May be a redirect or entry gate.
2. **Probe `/sweepstakes/rules`** - Explicitly linked as "Official Rules" footer. Likely contains full legal text.
3. **Investigate `/ramb`** - Linked twice in silence version and replaces `/chapter3` as the "what's next" destination.
4. **Check for donation milestone triggers** - The `bar-full.gif` / `bar-freedom.gif` images and null video data suggest the page may have had dynamic/unlockable content based on campaign progress.
5. **The silence page is a dark alternate** - Grayscale, `noindex`, empty marquee, dialtone audio, and `spamton_dark.js` all indicate this is an intentional "bad ending" or alternate timeline version of the sweepstakes page.
