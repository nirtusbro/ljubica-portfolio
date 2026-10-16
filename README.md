# Ljubica Sijan — portfolio site

Static site built from the Figma file "Portfolio" (page `ljubi.ca`). No framework, no build
dependencies: plain HTML, CSS and a little JavaScript.

## Files

```
index.html            home (work grid)          ← generated
about/index.html      about + experience        ← generated  (served as /about/)
work/<slug>/index.html  one page per project    ← generated  (served as /work/<slug>/)
assets/css/style.css  all styling
assets/js/main.js     card hover on touch, horizontal rows, video play/pause, light/dark toggle
assets/img/           thumbnails, hover artwork, portrait, project images
assets/video/         project videos (mp4) with poster frames (jpg)
assets/svg/           logo (logo-short.svg = "Ljubica" only, shown on phones) and LinkedIn icon
favicon.ico, favicon-*.png, apple-touch-icon.png,
android-chrome-*.png, site.webmanifest   favicon set (pink "Љ" circle)
og-image.png          1200x630 preview shown when a link is shared (Telegram, Discord, X…)
data/site.json        name, intro text, email, LinkedIn URL, site URL, nav, experience
data/projects.json    the 12 projects (title, tags, thumbnail, hover art, page content)
build.js              regenerates the HTML from the data files
```

## Editing content

1. Change text or add images in `data/site.json` / `data/projects.json`.
2. Run `node build.js` (needs Node.js; nothing to install).
3. Upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, cPanel…).

Do not edit the generated `.html` files by hand; the next build overwrites them.

### About page

`experience` in `data/site.json` is the list under the portrait: `company`, `role`, `period`.
The older `services` key is kept in the file but no longer shown (the Figma About page replaced
it with Experience on 2026-10-12).

### Project page fields

```json
{
  "slug": "velnea-hand-cream",
  "title": "Velnea Hand Cream",
  "tags": "Packaging Design, Art Direction",
  "year": "2025",
  "thumb": "assets/img/card-velnea.jpg",
  "hover": { "src": "assets/img/hover/hover-velnea.svg" },
  "hero": { "type": "image", "src": "assets/img/velnea/hero.jpg" },
  "about": ["First paragraph.", "Second paragraph."],
  "credits": ["Agency: …", "Photography: …"],
  "gallery": [
    { "src": "assets/img/velnea/01.jpg", "alt": "" },
    [ { "src": "assets/img/velnea/02.jpg" }, { "src": "assets/img/velnea/03.jpg" } ],
    { "type": "video", "src": "assets/video/velnea/clip.mp4", "poster": "assets/video/velnea/clip.jpg" }
  ]
}
```

- `year` is printed as "Year: …" directly under the "My role:" paragraph of `about`.
- `hero.type` is `image` or `video`. Leave `src` empty to show the grey placeholder.
- A gallery entry is one full-width item, or an array of items for a row. Items share the width,
  unless their `w` values add up to more than 1516 (the Figma gallery width): then the row
  becomes a horizontal scroller, each item as wide as in Figma (drag or scroll sideways).
- On phones a multi-item row normally stacks. To keep it side by side as a swipeable strip
  instead, write the row as `{ "mobileScroll": true, "items": [ ... ] }`. Add `"cols": 2` to such a
  row to lay its items out as 2 per line on desktop (e.g. 4 images as a 2x2 block) while the
  phone strip still shows all of them in one swipe.

## Notes

- Link previews: every page carries Open Graph / Twitter meta tags pointing at `og-image.png`.
  They need absolute URLs, so `url` in `data/site.json` must be the address the site is served from
  (now the GitHub Pages URL); change it and rebuild if the site moves to its own domain.

- Card thumbnails (`assets/img/card-*.jpg`) were zoom-cropped by 12px per side (at 2x) on 2026-10-12 to
  drop the white rounded corners baked into the Figma exports, which showed on the dark theme. If a
  thumbnail is re-exported, export it without corner rounding or crop it the same way.
- Light / dark mode: the header toggle sets `data-theme` on `<html>` and saves it in localStorage;
  the site always starts light; dark is only shown after the visitor clicks the toggle. Colours live in the `--bg`, `--fg`,
  `--surface`, `--related-bg`, `--footer-bg/fg` and `--muted` variables at the top of `style.css`.
  The logo and LinkedIn icon use `currentColor` so they follow the theme.

- Project images are exported from Figma (JPG, 2000px wide for full-width blocks, 1200px for half
  blocks). A block with `"src": ""` shows a grey placeholder; such blocks keep their Figma node id
  (`figmaNode`) so the image can be exported later. A Figma `.fig` export is a zip whose `images/`
  folder holds every source image named by the same hash the API uses, so plain image blocks can be
  rebuilt from it without API access (done for the 2026-10-16 update).
- The 12 videos are H.264 mp4 (1920px wide for full-width blocks, 1130px for half
  blocks), silent and looping. Add `"controls": true` to a video item to show the player bar;
  only the Josh campaign film has it, as it keeps its soundtrack.
