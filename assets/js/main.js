// Small enhancements; the site works without JavaScript.
(function () {
  // On touch devices there is no hover, so a first tap on a card reveals the
  // hover artwork and a second tap follows the link.
  if (window.matchMedia('(hover: none)').matches) {
    var cards = document.querySelectorAll('.card[data-has-hover]');
    cards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (!card.classList.contains('is-active')) {
          e.preventDefault();
          cards.forEach(function (c) { c.classList.remove('is-active'); });
          card.classList.add('is-active');
        }
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.card')) {
        cards.forEach(function (c) { c.classList.remove('is-active'); });
      }
    });
  }
})();

// Horizontal gallery rows: drag with the mouse, or use the wheel (eased so it glides).
// Touch and trackpad swipes scroll natively.
document.querySelectorAll('.gallery-row--scroll').forEach(function (row) {
  var startX = 0, startLeft = 0, dragging = false;
  var target = 0, animating = false;

  function maxLeft() { return row.scrollWidth - row.clientWidth; }

  var last = 0, stalled = 0;
  function stop() { animating = false; last = 0; stalled = 0; }
  function step(now) {
    if (dragging) { stop(); return; }
    var dt = last ? Math.min(now - last, 50) : 16.7;   // time-based easing, same speed at 60Hz or 180Hz
    last = now;
    var max = maxLeft();
    if (target > max) target = max;
    if (target < 0) target = 0;
    var diff = target - row.scrollLeft;
    if (Math.abs(diff) < 1) { row.scrollLeft = target; stop(); return; }
    var move = diff * (1 - Math.pow(0.88, dt / 16.7));
    if (Math.abs(move) < 1) move = diff > 0 ? 1 : -1;      // Chrome rounds scrollLeft to whole pixels
    var before = row.scrollLeft;
    row.scrollLeft += move;
    stalled = row.scrollLeft === before ? stalled + 1 : 0;
    if (stalled > 5) { stop(); return; }                 // browser refuses to move further (edge, rounding)
    requestAnimationFrame(step);
  }

  row.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    dragging = true; startX = e.clientX; startLeft = row.scrollLeft;
    row.classList.add('is-dragging'); row.setPointerCapture(e.pointerId);
  });
  row.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    row.scrollLeft = startLeft - (e.clientX - startX);
  });
  function end() { if (!dragging) return; dragging = false; target = row.scrollLeft; row.classList.remove('is-dragging'); }
  row.addEventListener('pointerup', end);
  row.addEventListener('pointercancel', end);

  // Mouse wheel over the row scrolls it sideways. At either end the page scrolls on as usual.
  row.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    var max = maxLeft();
    var atEnd = (e.deltaY > 0 && row.scrollLeft >= max - 1) || (e.deltaY < 0 && row.scrollLeft <= 1);
    if (atEnd) return;
    e.preventDefault();
    if (!animating) target = row.scrollLeft;
    target = Math.max(0, Math.min(max, target + e.deltaY * 1.5));
    if (!animating) { animating = true; requestAnimationFrame(step); }
  }, { passive: false });
});

// Play videos while they are on screen, pause them when they leave (also a safety net for
// browsers that ignore the autoplay attribute).
(function () {
  var videos = document.querySelectorAll('video[autoplay]');
  if (!videos.length) return;
  if (!('IntersectionObserver' in window)) { videos.forEach(function (v) { v.play().catch(function () {}); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var v = en.target;
      if (en.isIntersecting) { v.play().catch(function () {}); } else if (!v.paused) { v.pause(); }
    });
  }, { rootMargin: '200px 0px' });
  videos.forEach(function (v) { io.observe(v); });
})();
