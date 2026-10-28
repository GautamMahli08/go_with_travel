/* LAVIGO card sliders for the home page.
   Any list with class "lavigo-carousel" becomes a horizontal slider with
   prev/next buttons and a "view all" link (data-viewall-href / data-viewall-label). */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('.lavigo-carousel'), function (track) {
    var bar = document.createElement('div');
    bar.className = 'lavigo-carousel-bar';
    bar.innerHTML =
      '<button type="button" class="lc-btn lc-prev" aria-label="Previous">←</button>' +
      '<a class="lc-viewall" href="' + (track.getAttribute('data-viewall-href') || '#') + '">' +
        (track.getAttribute('data-viewall-label') || 'Click here to view all') + ' →</a>' +
      '<button type="button" class="lc-btn lc-next" aria-label="Next">→</button>';
    var list = track.closest('.w-dyn-list') || track;
    list.parentNode.insertBefore(bar, list.nextSibling);

    var prev = bar.querySelector('.lc-prev');
    var next = bar.querySelector('.lc-next');

    function step() {
      var item = track.querySelector('.w-dyn-item');
      if (!item) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return item.getBoundingClientRect().width + gap;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 8;
      prev.disabled = track.scrollLeft <= 8;
      next.disabled = track.scrollLeft >= max;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    update();
  });
})();
