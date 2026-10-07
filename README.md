# Fintech Night

A dark dashboard theme for portfolio pages, plus a working CV-to-dashboard page built on it.

- `index.html` self-contained page. Upload a CV (PDF) and the dashboard rebuilds itself from it.
- `fintech-night.css` + `fintech-night.js` the theme on its own, for dropping into another site.

## Try the page

Open `index.html`. It starts with a made-up sample profile. Choose **Upload CV** (or drop a PDF on the page) and the hero, stats, skills, experience, education, activity and projects are rebuilt from the file. The PDF is read in the browser; nothing is uploaded anywhere.

**Download site** saves the current dashboard as one standalone `.html` file with the profile baked in. If the CV is under 2.5 MB it is embedded too, so **Download CV** works on the exported page.

Parsing needs a text-based PDF with headings such as Experience, Education, Projects and Skills. Scanned images won't work. Anything the parser can't find shows an empty note instead of made-up content.

## Use the theme in another page

```html
<link rel="stylesheet" href="fintech-night.css">
<script src="fintech-night.js"></script>   <!-- in <head>, no defer -->
<body class="fn" data-fn-bg>
```

| Add this | Result |
|---|---|
| `fn-card` | Glass panel that lifts on hover |
| `fn-glow` (on a card or any box) | Light travelling round the border, spotlight under the cursor |
| `data-fn-relay="3000"` on a parent | Its `fn-glow` children light up one after another |
| `data-fn-count="40" data-fn-suffix="+"` | Number counts up when scrolled into view |
| `data-fn-words` on a heading | Words appear one by one; wrap words in `<span class="fn-wipe">` for a wipe |
| `fn-reveal`, `fn-stagger` | Fade/slide in on scroll, one child after another |
| `fn-bar` with `style="--fn-pct:72"` | Bar that fills to 72% |
| `fn-chip`, `fn-btn fn-btn-solid / fn-btn-line`, `fn-hl` | Chips, buttons, text with a hover underline |

Call `FN.refresh()` after adding elements from script, and `FN.count(el, 12, '+')` to replay a counter. Light mode: `<html data-fn-mode="light">`. Colours are the `--fn-*` variables at the top of the CSS.

Everything is prefixed `fn-`, so it won't clash with the host site. Nothing is hidden when JavaScript is off, and motion stops for visitors who ask their device for reduced motion.
