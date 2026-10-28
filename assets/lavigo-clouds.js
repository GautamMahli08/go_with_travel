/* LAVIGO scroll clouds: drifting parallax clouds + hero clouds that part on scroll. */
(function () {
  var script = document.currentScript;
  var base = script.src.replace(/lavigo-clouds\.js.*$/, 'clouds/');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function cloudImg(n) {
    var img = new Image();
    img.src = base + (n === 2 ? 'cloud-2.png' : 'cloud.png');
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.decoding = 'async';
    return img;
  }

  // top / left in % of the viewport, width in vw, speed = parallax factor
  var CLOUDS = [
    { top: 8,  left: -14, w: 38, speed: 0.12, drift: 28, opacity: 0.7, img: 1 },
    { top: 45, left: 74,  w: 34, speed: 0.28, drift: 36, opacity: 0.6, img: 2 },
    { top: 82, left: -16, w: 36, speed: 0.38, drift: 32, opacity: 0.55, img: 2 }
  ];

  var layer = document.createElement('div');
  layer.className = 'lavigo-clouds';
  layer.setAttribute('aria-hidden', 'true');
  var items = CLOUDS.map(function (c, i) {
    var outer = document.createElement('div');
    outer.className = 'lavigo-cloud';
    outer.style.left = c.left + 'vw';
    outer.style.width = c.w + 'vw';
    outer.style.opacity = c.opacity;
    var inner = document.createElement('div');
    inner.className = 'lavigo-cloud-drift';
    inner.style.animationDuration = c.drift + 's';
    inner.style.animationDelay = (-i * 7) + 's';
    inner.appendChild(cloudImg(c.img));
    outer.appendChild(inner);
    layer.appendChild(outer);
    return { el: outer, c: c };
  });
  // ---- birds: flocks gliding across the sky
  var themeBase = base.replace(/clouds\/$/, 'theme/');
  var BIRDS = [
    { top: 16, w: 18, dur: 55, delay: -10, speed: 0.18, opacity: 0.45 }
  ];
  BIRDS.forEach(function (b, i) {
    var outer = document.createElement('div');
    outer.className = 'lavigo-birds';
    outer.style.width = b.w + 'vw';
    outer.style.opacity = b.opacity;
    var fly = document.createElement('div');
    fly.className = 'lavigo-birds-fly';
    fly.style.animationDuration = b.dur + 's';
    fly.style.animationDelay = b.delay + 's';
    var img = new Image();
    img.src = themeBase + 'birds_flock.png';
    img.alt = '';
    fly.appendChild(img);
    outer.appendChild(fly);
    layer.appendChild(outer);
    items.push({ el: outer, c: { top: b.top, speed: b.speed } });
  });

  // ---- leaves: drifting down and spinning
  var LEAVES = [
    { n: 1, left: 5,  w: 2.6, dur: 24, delay: -3 },
    { n: 5, left: 91, w: 2.8, dur: 28, delay: -14 },
    { n: 7, left: 48, w: 2.2, dur: 26, delay: -20 }
  ];
  var leaves = LEAVES.map(function (l, i) {
    var outer = document.createElement('div');
    outer.className = 'lavigo-leaf';
    outer.style.left = l.left + 'vw';
    outer.style.width = l.w + 'vw';
    var fall = document.createElement('div');
    fall.className = 'lavigo-leaf-fall';
    fall.style.animationDuration = l.dur + 's';
    fall.style.animationDelay = l.delay + 's';
    var img = new Image();
    img.src = themeBase + 'leaf-' + l.n + '.png';
    img.alt = '';
    img.style.animationDuration = (l.dur / 3) + 's';
    fall.appendChild(img);
    outer.appendChild(fall);
    layer.appendChild(outer);
    return { el: outer, speed: 0.15 + (i % 3) * 0.08 };
  });

  document.body.appendChild(layer);

  // ---- suitcase on the contact page, floating above the heading
  var contactTitle = document.querySelector('.heading-10');
  if (contactTitle) {
    var wrapper = contactTitle.closest('.title-wrapper') || contactTitle.parentNode;
    var bag = new Image();
    bag.src = themeBase + 'suitcase.png';
    bag.alt = '';
    bag.className = 'lavigo-suitcase';
    wrapper.insertBefore(bag, wrapper.firstChild);
  }

  // hero clouds that part as you scroll past the hero image
  var heroes = [];
  Array.prototype.forEach.call(document.querySelectorAll('.hero-wrapper'), function (hero) {
    var wrap = document.createElement('div');
    wrap.className = 'lavigo-hero-clouds';
    wrap.setAttribute('aria-hidden', 'true');
    var left = document.createElement('div');
    left.className = 'lavigo-hero-cloud left';
    left.appendChild(cloudImg(1));
    var right = document.createElement('div');
    right.className = 'lavigo-hero-cloud right';
    right.appendChild(cloudImg(2));
    wrap.appendChild(left);
    wrap.appendChild(right);
    // insert right after the hero photo so the hero headings (later in the DOM) paint above the clouds
    var photo = hero.querySelector('.hero-image');
    hero.insertBefore(wrap, photo ? photo.nextSibling : hero.firstChild);
    heroes.push({ hero: hero, left: left, right: right });
  });

  var ticking = false;
  if (reduceMotion) {
    update();   // place the clouds once, no scroll movement
    return;
  }

  function update() {
    ticking = false;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var vh = window.innerHeight;
    var span = vh * 1.5;
    items.forEach(function (it) {
      // move upward with scroll at the cloud's own speed, wrapping so clouds keep appearing
      var pos = (it.c.top / 100) * span - y * it.c.speed;
      pos = ((pos % span) + span) % span - vh * 0.25;
      it.el.style.transform = 'translate3d(0,' + pos.toFixed(1) + 'px,0)';
    });
    leaves.forEach(function (l) {
      // scrolling nudges the leaves downward a little faster, like a gust of wind
      l.el.style.transform = 'translate3d(0,' + ((y * l.speed) % vh).toFixed(1) + 'px,0) rotate(' + (y * 0.05).toFixed(1) + 'deg)';
    });
    heroes.forEach(function (h) {
      var height = h.hero.offsetHeight || vh;
      var p = Math.min(Math.max(y / (height * 0.8), 0), 1);
      var ease = 1 - Math.pow(1 - p, 2);
      h.left.style.transform = 'translate3d(' + (-ease * 45) + 'vw,' + (-ease * 8) + 'vh,0) scale(' + (1 + ease * 0.5) + ')';
      h.right.style.transform = 'translate3d(' + (ease * 45) + 'vw,' + (-ease * 8) + 'vh,0) scale(' + (1 + ease * 0.5) + ')';
      h.left.style.opacity = h.right.style.opacity = (1 - ease * 0.9).toFixed(3);
    });
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
