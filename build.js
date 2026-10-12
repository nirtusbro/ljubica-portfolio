#!/usr/bin/env node
// Generates index.html, about.html and work/<slug>.html from data/*.json.
// Run:  node build.js
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/projects.json'), 'utf8'));
const logoSvg = fs.readFileSync(path.join(ROOT, 'assets/svg/logo.svg'), 'utf8').trim().replace('<svg ', '<svg class="logo logo--full" ');
// "Ljubica" only, shown instead of the full logo on phones (CSS swaps them at 800px).
const logoShortSvg = fs.readFileSync(path.join(ROOT, 'assets/svg/logo-short.svg'), 'utf8').trim().replace('<svg ', '<svg class="logo logo--short" ');
const linkedinSvg = fs.readFileSync(path.join(ROOT, 'assets/svg/linkedin.svg'), 'utf8').trim();

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- shared pieces ----------

function header(rel, current) {
  const links = site.nav.map((n) => {
    const href = n.href.startsWith('#') ? (current === 'work' || current === 'about' ? n.href : rel + 'index.html' + n.href) : rel + n.href;
    const cur = n.id === current ? ' aria-current="page"' : '';
    return `        <li><a href="${href}"${cur}>${esc(n.label)}</a></li>`;
  }).join('\n');
  return `  <header class="site-header">
    <a class="site-header__logo" href="${rel}index.html" aria-label="${esc(site.name)} — home">
      ${logoSvg}
      ${logoShortSvg}
    </a>
    <div class="site-header__right">
      <nav class="site-nav" aria-label="Main">
        <ul>
${links}
        </ul>
      </nav>
      <button class="theme-toggle" type="button" aria-label="Switch to dark mode" title="Light / dark">
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 1a9 9 0 0 1 0 18z" fill="currentColor"/></svg>
      </button>
    </div>
  </header>`;
}

function footer() {
  return `  <footer class="site-footer" id="contact">
    <p>CONTACT</p>
    <p><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
    <a class="site-footer__social" href="${esc(site.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn">
      ${linkedinSvg}
    </a>
  </footer>`;
}

function page({ rel, current, title, description, body, bodyClass = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="icon" href="${rel}favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="${rel}favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="${rel}favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="${rel}apple-touch-icon.png">
  <link rel="manifest" href="${rel}site.webmanifest">
  <meta name="theme-color" content="#f48eae">
  <script>(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100,300;100,400;100,500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${rel}assets/css/style.css">
</head>
<body class="${bodyClass}">
${header(rel, current)}
  <main>
${body}
  </main>
${footer()}
  <script src="${rel}assets/js/main.js" defer></script>
</body>
</html>
`;
}

function layer(cls, spec, rel, alt) {
  // spec: {src} for a full-bleed image, or {background, src, style} for a composed card
  if (spec.style || spec.background) {
    return `<span class="${cls} card__layer card__layer--composed" style="background:${spec.background}">` +
      `<img src="${rel}${spec.src}" alt="${esc(alt)}" style="${spec.style}" loading="lazy"></span>`;
  }
  return `<span class="${cls} card__layer"><img src="${rel}${spec.src}" alt="${esc(alt)}" loading="lazy"></span>`;
}

function card(p, rel, { eager = false } = {}) {
  const thumb = p.thumbComposed || (p.thumb ? { src: p.thumb } : null);
  const hover = p.hoverComposed || p.hover;
  const media = [];
  if (thumb) media.push(layer('card__thumb', thumb, rel, p.title).replace('loading="lazy"', eager ? 'loading="eager"' : 'loading="lazy"'));
  if (hover) media.push(layer('card__hover', hover, rel, '').replace('card__hover card__layer', 'card__hover card__layer'));
  return `        <a class="card" href="${rel}work/${p.slug}.html"${hover ? ' data-has-hover' : ''}>
          <span class="card__media">
            ${media.join('\n            ')}
          </span>
          <span class="card__body">
            <h2 class="card__title">${esc(p.title)}</h2>
            <p class="card__tags">${esc(p.tags)}</p>
          </span>
        </a>`;
}

// ---------- pages ----------

function homePage() {
  const rel = '';
  const body = `    <section class="intro">
      <div class="intro__text">
${site.intro.map((t) => `        <p>${esc(t)}</p>`).join('\n')}
      </div>
    </section>
    <section class="work" aria-label="Selected work">
      <div class="work__grid">
${projects.map((p, i) => card(p, rel, { eager: i < 5 })).join('\n')}
      </div>
    </section>`;
  return page({ rel, current: 'work', title: site.title, description: site.description, body });
}

function aboutPage() {
  const rel = '';
  const jobs = (site.experience || []).map((j) => `        <li class="job">
          <h2 class="job__company">${esc(j.company)}</h2>
          <p class="job__role">${esc(j.role)}</p>
          <p class="job__period">${esc(j.period)}</p>
        </li>`).join('\n');
  const body = `    <section class="intro intro--center">
      <div class="portrait"><img src="assets/img/about-portrait.jpg" alt="${esc(site.name)}" width="197" height="274"></div>
      <div class="intro__text">
${site.intro.map((t) => `        <p>${esc(t)}</p>`).join('\n')}
      </div>
    </section>
    <section class="experience" aria-labelledby="experience-heading">
      <h1 class="experience__heading" id="experience-heading">Experience</h1>
      <ul class="experience__list">
${jobs}
      </ul>
    </section>`;
  return page({ rel, current: 'about', title: `About — ${site.name}`, description: site.description, body });
}

// Videos autoplay silently and loop, like the Figma placeholders imply. `controls: true` adds
// the player bar (used for the long Josh film, which has a soundtrack).
function videoTag(v, rel) {
  const poster = v.poster ? ` poster="${rel}${v.poster}"` : '';
  const controls = v.controls ? ' controls' : '';
  return `<video src="${rel}${v.src}"${poster} autoplay muted loop playsinline preload="metadata"${controls}></video>`;
}

function itemHtml(it, rel) {
  const ar = it.w && it.h ? ` style="aspect-ratio:${it.w}/${it.h}"` : '';
  if (it.type === 'video' && it.src) {
    return `<figure${ar}>${videoTag(it, rel)}</figure>`;
  }
  if (it.type === 'video') return `<figure class="gallery-placeholder"${ar}><span>Video</span></figure>`;
  if (!it.src) return `<figure class="gallery-placeholder"${ar}><span>Image coming soon</span></figure>`;
  const size = it.w ? ` width="${it.w}" height="${it.h}"` : '';
  return `<figure${ar}><img src="${rel}${it.src}" alt="${esc(it.alt || '')}" loading="lazy"${size}></figure>`;
}

function galleryHtml(gallery, rel) {
  if (!gallery || !gallery.length) return '';
  const rows = gallery.map((row) => {
    // A row is one item, an array of items, or { mobileScroll: true, items: [...] } for rows
    // that keep their side-by-side layout on phones as a horizontal scroller instead of stacking.
    // Such a row may also set `cols` to wrap into that many columns on desktop (e.g. 4 items as 2x2).
    const mobileScroll = !Array.isArray(row) && row.items ? !!row.mobileScroll : false;
    const forcedCols = !Array.isArray(row) && row.items ? row.cols : undefined;
    if (!Array.isArray(row) && row.items) row = row.items;
    const items = Array.isArray(row) ? row : [row];
    // A row scrolls sideways when its blocks' Figma widths overflow the 1516px gallery width.
    const ROW_W = 1516, GAP = 10;
    const natural = items.reduce((s, it) => s + (it.w || 0), 0) + GAP * (items.length - 1);
    const scroll = items.length > 1 && !forcedCols && natural > ROW_W * 1.05;
    let style = '';
    if (scroll) style = ` style="--item:${(items[0].w / ROW_W * 100).toFixed(2)}%"`;
    else if (items.length > 1) style = ` style="--cols:${forcedCols || items.length}"`;
    const figs = items.map((it) => '          ' + itemHtml(it, rel)).join('\n');
    const cls = 'gallery-row' + (scroll ? ' gallery-row--scroll' : '') + (mobileScroll && !scroll ? ' gallery-row--mobile-scroll' : '');
    const count = mobileScroll ? ` data-n="${items.length}"` : '';
    return `        <div class="${cls}"${style}${count}>\n${figs}\n        </div>`;
  }).join('\n');
  return `      <div class="project__gallery">\n${rows}\n      </div>`;
}

function heroHtml(hero, rel, title) {
  if (!hero || !hero.src) {
    const label = hero && hero.type === 'video' ? 'Video' : 'Image coming soon';
    return `      <div class="project__hero project__hero--placeholder" aria-hidden="true"><span>${label}</span></div>`;
  }
  if (hero.type === 'video') {
    return `      <div class="project__hero">${videoTag(hero, rel)}</div>`;
  }
  return `      <div class="project__hero"><img src="${rel}${hero.src}" alt="${esc(title)}" width="${hero.w || 1516}" height="${hero.h || 953}"></div>`;
}

function projectPage(p, index) {
  const rel = '../';
  const others = [];
  for (let k = 1; others.length < 4 && k < projects.length; k++) {
    others.push(projects[(index + k) % projects.length]);
  }
  // "Year: 2026" sits right under the "My role:" line (same paragraph, no gap), as in Figma.
  const about = (p.about && p.about.length)
    ? p.about.map((t) => {
        const year = p.year && /^My role:/i.test(t) ? `<br>Year: ${esc(p.year)}` : '';
        return `        <p>${esc(t)}${year}</p>`;
      }).join('\n')
    : '';
  const credits = (p.credits && p.credits.length)
    ? `        <p class="project__credits">${p.credits.map(esc).join('<br>')}</p>`
    : '';
  const aboutBlock = (about || credits) ? `      <section class="project__about">
        <h2>About the project:</h2>
${about}
${credits}
      </section>` : '';

  const body = `    <article class="project">
      <h1 class="project__title">${esc(p.title)}</h1>
${heroHtml(p.hero, rel, p.title)}
${aboutBlock}
${galleryHtml(p.gallery, rel)}
    </article>
    <section class="related" aria-labelledby="related-heading">
      <h2 class="related__heading" id="related-heading">Other projects</h2>
      <div class="related__grid">
${others.map((o) => card(o, rel)).join('\n')}
      </div>
    </section>`;
  return page({
    rel, current: 'work', title: `${p.title} — ${site.name}`,
    description: `${p.title}: ${p.tags}. ${site.description}`, body, bodyClass: 'page-project',
  });
}

// ---------- write ----------

fs.mkdirSync(path.join(ROOT, 'work'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'index.html'), homePage());
fs.writeFileSync(path.join(ROOT, 'about.html'), aboutPage());
projects.forEach((p, i) => fs.writeFileSync(path.join(ROOT, 'work', `${p.slug}.html`), projectPage(p, i)));
console.log(`Built index.html, about.html and ${projects.length} project pages.`);
