# Ljubica Sijan — portfolio site

Static site built from the Figma file "Portfolio" (page `ljubi.ca`). No framework, no build
dependencies: plain HTML, CSS and a little JavaScript.

## Files

```
index.html            home (work grid)          ← generated
about.html            about + experience        ← generated
work/<slug>.html      one page per project      ← generated
assets/css/style.css  all styling
assets/js/main.js     card hover on touch, horizontal rows, video play/pause, light/dark toggle
assets/img/           thumbnails, hover artwork, portrait, project images
assets/video/         project videos (mp4) with poster frames (jpg)
assets/svg/           logo and LinkedIn icon
data/site.json        name, intro text, email, LinkedIn URL, nav, experience
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

- `hero.type` is `image` or `video`. Leave `src` empty to show the grey placeholder.
- A gallery entry is one full-width item, or an array of items for a row. Items share the width,
  unless their `w` values add up to more than 1516 (the Figma gallery width): then the row
  becomes a horizontal scroller, each item as wide as in Figma (drag or scroll sideways).
- On phones a multi-item row normally stacks. To keep it side by side as a swipeable strip
  instead, write the row as `{ "mobileScroll": true, "items": [ ... ] }`. Add `"cols": 2` to such a
  row to lay its items out as 2 per line on desktop (e.g. 4 images as a 2x2 block) while the
  phone strip still shows all of them in one swipe.

## Notes

- Light / dark mode: the header toggle sets `data-theme` on `<html>` and saves it in localStorage;
  without a choice the site follows the phone/computer setting. Colours live in the `--bg`, `--fg`,
  `--surface`, `--related-bg`, `--footer-bg/fg` and `--muted` variables at the top of `style.css`.
  The logo and LinkedIn icon use `currentColor` so they follow the theme.

- All 170 project images are exported from Figma (JPG at 1.5x). Each block keeps its Figma node
  id in `data/projects.json` (`figmaNode`) in case one needs re-exporting at a higher resolution.
- All 11 videos are in place as H.264 mp4 (1920px wide for full-width blocks, 1130px for half
  blocks), silent and looping. Add `"controls": true` to a video item to show the player bar;
  only the Josh campaign film has it, as it keeps its soundtrack.
