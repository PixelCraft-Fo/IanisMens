/* ============================================================
   IANIS men's — Script principal
   Navbar, meniu mobil, slider, animații, galerie + lightbox,
   program „deschis acum", evenimente Google Analytics 4
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- 1. Navbar — devine opac la scroll ----- */
  var navbar = document.querySelector('.navbar');

  function handleNavbarScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }

  if (navbar) {
    handleNavbarScroll();
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  }

  /* ----- 2. Meniu mobil ----- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  var backdrop = document.querySelector('.menu-backdrop');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
    mobileMenu.classList.toggle('open', open);
    if (backdrop) backdrop.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var first = mobileMenu.querySelector('a');
      if (first) setTimeout(function () { first.focus(); }, 50);
    }
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    if (backdrop) backdrop.addEventListener('click', function () { setMenu(false); });

    var closeBtn = mobileMenu.querySelector('.mobile-menu-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        setMenu(false);
        toggle.focus();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && mobileMenu.classList.contains('open')) setMenu(false);
    });
  }

  /* ----- 3. Hero slider ----- */
  var hero = document.querySelector('.hero');
  var slides = hero ? hero.querySelectorAll('.slide') : [];

  if (slides.length > 1) {
    var dots = hero.querySelectorAll('.dot');
    var current = 0;
    var timer = null;
    var paused = false;

    var showSlide = function (index) {
      index = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
        if (active) {
          slide.removeAttribute('inert');
        } else {
          slide.setAttribute('inert', '');
        }
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
        if (i === index) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
      current = index;
    };

    var stop = function () {
      clearInterval(timer);
      timer = null;
    };

    var start = function () {
      stop();
      if (!reduceMotion && !paused) {
        timer = setInterval(function () { showSlide(current + 1); }, 6000);
      }
    };

    var prev = hero.querySelector('.slider-arrow.prev');
    var next = hero.querySelector('.slider-arrow.next');
    if (prev) prev.addEventListener('click', function () { showSlide(current - 1); start(); });
    if (next) next.addEventListener('click', function () { showSlide(current + 1); start(); });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { showSlide(i); start(); });
    });

    // Pauză la hover / focus / tab ascuns
    hero.addEventListener('mouseenter', function () { paused = true; stop(); });
    hero.addEventListener('mouseleave', function () { paused = false; start(); });
    hero.addEventListener('focusin', function () { paused = true; stop(); });
    hero.addEventListener('focusout', function () { paused = false; start(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { start(); }
    });

    // Swipe pe mobil
    var touchX = null;
    hero.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) {
        showSlide(current + (dx < 0 ? 1 : -1));
        start();
      }
      touchX = null;
    }, { passive: true });

    showSlide(0);
    start();
  }

  /* ----- 4. Animații la scroll ----- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ----- 5. Numere animate (statistici) ----- */
  var counters = document.querySelectorAll('[data-target]');

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var output = el.querySelector('.count') || el;
    var duration = 1600;
    var startTime = performance.now();

    function update(now) {
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      output.textContent = (eased * target).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var counterObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(function (c) { counterObserver.observe(c); });
  }

  /* ----- 6. Galeria pe categorii (datele vin din produse.js) ----- */
  var grid = document.querySelector('.works-grid');

  if (grid && window.CATEGORII && window.PRODUSE) {
    var filterBtns = document.querySelectorAll('.filter-btn');
    var chips = document.querySelectorAll('[data-chip]');
    var descrieri = document.querySelectorAll('[data-descriere]');
    var golEl = document.querySelector('.gallery-empty');
    var countEl = document.querySelector('.gallery-count');
    var categorieCurenta = null;

    function pozeActive(id) {
      return (window.PRODUSE[id] || []).filter(function (slot) { return slot.activ; });
    }

    function categoriaDupaId(id) {
      for (var i = 0; i < window.CATEGORII.length; i++) {
        if (window.CATEGORII[i].id === id) return window.CATEGORII[i];
      }
      return null;
    }

    function textNumar(n) {
      if (n === 1) return '1 fotografie';
      return n + (n < 20 ? ' fotografii' : ' de fotografii');
    }

    function construiesteGrila(cat, sloturi) {
      grid.setAttribute('data-raport', cat.raport);
      grid.textContent = '';
      var fragment = document.createDocumentFragment();

      sloturi.forEach(function (slot) {
        var fisier = 'imagini/' + cat.prefix + slot.n + '.png';

        var link = document.createElement('a');
        link.className = 'gallery-item';
        link.href = fisier;
        link.setAttribute('data-lightbox', '');

        var poza = document.createElement('img');
        poza.src = fisier;
        poza.alt = slot.alt || cat.altImplicit;
        poza.width = cat.w;
        poza.height = cat.h;
        poza.loading = 'lazy';
        poza.decoding = 'async';

        var lupa = document.createElement('span');
        lupa.className = 'zoom';
        lupa.setAttribute('aria-hidden', 'true');
        lupa.innerHTML = '<svg class="icon"><use href="#i-zoom"></use></svg>';

        link.appendChild(poza);
        link.appendChild(lupa);
        fragment.appendChild(link);
      });

      grid.appendChild(fragment);
    }

    function saiLaGalerie(lin) {
      var sectiune = document.getElementById('galerie');
      if (!sectiune) return;
      try {
        sectiune.scrollIntoView({ block: 'start', behavior: lin ? 'smooth' : 'instant' });
      } catch (err) {
        sectiune.scrollIntoView(true);
      }
    }

    function selecteaza(id, actualizeazaHash, deruleaza) {
      var cat = categoriaDupaId(id);
      if (!cat) return;
      if (cat.id === categorieCurenta) {
        if (deruleaza) saiLaGalerie(true);
        return;
      }
      categorieCurenta = cat.id;

      filterBtns.forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(btn.getAttribute('data-categorie') === cat.id));
      });
      descrieri.forEach(function (el) {
        el.hidden = el.getAttribute('data-descriere') !== cat.id;
      });

      var sloturi = pozeActive(cat.id);
      construiesteGrila(cat, sloturi);
      grid.hidden = sloturi.length === 0;
      if (golEl) golEl.hidden = sloturi.length > 0;
      if (countEl) countEl.textContent = sloturi.length ? textNumar(sloturi.length) : '';

      if (actualizeazaHash && window.history && history.replaceState) {
        history.replaceState(null, '', '#' + cat.id);
      }
      if (deruleaza) saiLaGalerie(true);
    }

    // Categoriile fără nicio poză activă își ascund filtrul și scurtătura din meniu.
    window.CATEGORII.forEach(function (cat) {
      var are = pozeActive(cat.id).length > 0;
      filterBtns.forEach(function (btn) {
        if (btn.getAttribute('data-categorie') === cat.id) btn.hidden = !are;
      });
      chips.forEach(function (chip) {
        if (chip.getAttribute('data-chip') === cat.id) chip.hidden = !are;
      });
    });

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        selecteaza(btn.getAttribute('data-categorie'), true);
      });
    });

    function dinHash() {
      var id = (location.hash || '').replace('#', '');
      if (categoriaDupaId(id)) return id;
      // prima categorie cu poze, altfel prima din listă
      for (var i = 0; i < window.CATEGORII.length; i++) {
        if (pozeActive(window.CATEGORII[i].id).length) return window.CATEGORII[i].id;
      }
      return window.CATEGORII[0].id;
    }

    window.addEventListener('hashchange', function () { selecteaza(dinHash(), false, true); });

    // La intrarea directă pe colectii.html#pantofi (link, Google, card de pe prima pagină)
    // deschidem categoria cerută și sărim la galerie.
    var hashInitial = (location.hash || '').replace('#', '');
    selecteaza(dinHash(), false, false);
    if (categoriaDupaId(hashInitial)) {
      saiLaGalerie(false);
      window.addEventListener('load', function () { saiLaGalerie(false); });
    }
  }

  /* ----- 7. Lightbox ----- */
  var lightbox = document.querySelector('.lightbox');

  if (lightbox) {
    var lbImg = lightbox.querySelector('img');
    var lbCaption = lightbox.querySelector('.lightbox-caption');
    var lbCounter = lightbox.querySelector('.lightbox-counter');
    var lbClose = lightbox.querySelector('.lightbox-close');
    var lbPrev = lightbox.querySelector('.lb-prev');
    var lbNext = lightbox.querySelector('.lb-next');
    var lbItems = [];
    var lbIndex = 0;
    var lastFocus = null;

    var visibleItems = function () {
      return Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
    };

    var render = function () {
      var item = lbItems[lbIndex];
      var thumb = item.querySelector('img');
      lbImg.src = item.getAttribute('href');
      lbImg.alt = thumb ? thumb.alt : '';
      lbCaption.textContent = thumb ? thumb.alt : '';
      lbCounter.textContent = (lbIndex + 1) + ' / ' + lbItems.length;
    };

    var openLb = function (item) {
      lbItems = visibleItems();
      lbIndex = Math.max(0, lbItems.indexOf(item));
      lastFocus = document.activeElement;
      render();
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    };

    var closeLb = function () {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lbImg.removeAttribute('src');
      if (lastFocus) lastFocus.focus();
    };

    var step = function (dir) {
      lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
      render();
    };

    // Delegare: pozele din galerie sunt create dinamic, după categoria aleasă
    document.addEventListener('click', function (e) {
      var item = e.target.closest ? e.target.closest('[data-lightbox]') : null;
      if (!item) return;
      e.preventDefault();
      openLb(item);
    });

    lbClose.addEventListener('click', closeLb);
    lbPrev.addEventListener('click', function () { step(-1); });
    lbNext.addEventListener('click', function () { step(1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLb();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'Tab') {
        // Păstrează focusul în lightbox
        var focusables = [lbClose, lbPrev, lbNext];
        var idx = focusables.indexOf(document.activeElement);
        e.preventDefault();
        var nextIdx = e.shiftKey ? (idx <= 0 ? focusables.length - 1 : idx - 1) : (idx + 1) % focusables.length;
        focusables[nextIdx].focus();
      }
    });

    var lbTouchX = null;
    lightbox.addEventListener('touchstart', function (e) { lbTouchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (lbTouchX === null) return;
      var dx = e.changedTouches[0].clientX - lbTouchX;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      lbTouchX = null;
    }, { passive: true });
  }

  /* ----- 8. Program — „deschis acum" + ziua curentă ----- */
  // 0 = duminică … 6 = sâmbătă; ore în format [deschide, închide] (minute)
  var SCHEDULE = {
    0: null,
    1: [600, 1080], 2: [600, 1080], 3: [600, 1080], 4: [600, 1080], 5: [600, 1080],
    6: [600, 810]
  };
  var DAY_NAMES = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];

  function fmt(min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  function bucharestNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Bucharest', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(map.weekday);
      return { day: day, minutes: (parseInt(map.hour, 10) % 24) * 60 + parseInt(map.minute, 10) };
    } catch (err) {
      var d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function nextOpening(now) {
    for (var i = 0; i < 8; i++) {
      var day = (now.day + i) % 7;
      var slot = SCHEDULE[day];
      if (slot && (i > 0 || now.minutes < slot[0])) {
        var when = i === 0 ? 'azi' : (i === 1 ? 'mâine' : DAY_NAMES[day]);
        return when + ' la ' + fmt(slot[0]);
      }
    }
    return '';
  }

  var now = bucharestNow();
  var todaySlot = SCHEDULE[now.day];
  var isOpen = !!todaySlot && now.minutes >= todaySlot[0] && now.minutes < todaySlot[1];

  document.querySelectorAll('.open-badge').forEach(function (badge) {
    badge.textContent = isOpen
      ? 'Deschis acum · până la ' + fmt(todaySlot[1])
      : 'Închis acum · deschidem ' + nextOpening(now);
    badge.classList.add(isOpen ? 'is-open' : 'is-closed');
    badge.hidden = false;
  });

  document.querySelectorAll('[data-day]').forEach(function (row) {
    if (row.getAttribute('data-day').split(',').indexOf(String(now.day)) !== -1) {
      row.classList.add('today');
    }
  });

  /* ----- 9. Google Analytics 4 — evenimente ----- */
  // Funcționează automat după ce se activează snippetul GA4 din <head>.
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var params = {
      link_url: link.href,
      link_text: (link.textContent || '').trim().slice(0, 80),
      page_location_section: link.getAttribute('data-track-section') || ''
    };

    if (link.hasAttribute('data-track')) {
      track(link.getAttribute('data-track'), params);
    } else if (href.indexOf('tel:') === 0) {
      track('click_phone', params);
    } else if (/maps\.app\.goo\.gl|google\.[a-z.]+\/maps/.test(href)) {
      track('click_map', params);
    }
  });

  /* ----- 10. Anul curent în footer ----- */
  document.querySelectorAll('.current-year').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
