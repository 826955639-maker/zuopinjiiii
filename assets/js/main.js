/* 苏麻离青 · 交互脚本 */
(function () {
  'use strict';
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- 自定义光标 ---------- */
  if (fine) {
    var dot = document.getElementById('cDot'), ring = document.getElementById('cRing');
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    var hotSel = '[data-hot],a,button,.idx-row,.zone .pic,.glass.tilt';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hotSel)) ring.classList.add('hot');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hotSel)) ring.classList.remove('hot');
    });
  }

  /* ---------- 导航：滚动加底 + 当前区块 ---------- */
  var nav = document.getElementById('nav');
  var navAnchors = [].slice.call(document.querySelectorAll('.nav-links a'));
  var secMap = navAnchors.map(function (a) {
    return { a: a, s: document.getElementById(a.getAttribute('href').slice(1)) };
  }).filter(function (o) { return o.s; });
  function onScroll() {
    nav.classList.toggle('solid', scrollY > 60);
    var y = scrollY + 130, cur = null;
    secMap.forEach(function (o) { if (o.s.offsetTop <= y) cur = o; });
    navAnchors.forEach(function (a) { a.classList.remove('active'); });
    if (cur) cur.a.classList.add('active');
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var toggle = document.getElementById('navToggle'), links = document.getElementById('navLinks');
  toggle && toggle.addEventListener('click', function () { links.classList.toggle('open'); });
  links && links.addEventListener('click', function (e) { if (e.target.closest('a')) links.classList.remove('open'); });

  /* ---------- 滚动渐显 ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- Hero 视差 ---------- */
  var heroImg = document.getElementById('heroImg');
  if (fine && heroImg) {
    var hero = heroImg.closest('.hero');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var dx = (e.clientX / r.width - 0.5), dy = (e.clientY / r.height - 0.5);
      heroImg.style.transform = 'scale(1.08) translate(' + (-dx * 18) + 'px,' + (-dy * 18) + 'px)';
    });
    hero.addEventListener('mouseleave', function () { heroImg.style.transform = 'scale(1.08)'; });
  }

  /* ---------- 液态玻璃：3D 倾斜 + 高光跟随 ---------- */
  if (fine) {
    document.querySelectorAll('.glass.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * 7).toFixed(2) +
          'deg) rotateY(' + ((px - 0.5) * 7).toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- 翻页书 ---------- */
  var book = document.getElementById('book');
  if (book) {
    var TOTAL = 12, leaves = [], cur = 0;
    for (var i = 1; i <= TOTAL; i++) {
      var src = (window.__SLIDES__ && window.__SLIDES__[i - 1]) || ('assets/cmf/slide-' + (i < 10 ? '0' + i : i) + '.jpg');
      var leaf = document.createElement('div');
      leaf.className = 'leaf';
      leaf.innerHTML =
        '<div class="face front"><img src="' + src + '" alt="图册第' + i + '页"></div>' +
        '<div class="face back"><span class="bk">' + (i < 10 ? '0' + i : i) + '</span></div>' +
        '<div class="shade"></div>';
      leaf.dataset.i = i;
      book.appendChild(leaf); leaves.push(leaf);
    }
    var curEl = document.getElementById('flipCur'), totEl = document.getElementById('flipTot');
    var prevBtn = document.getElementById('flipPrev'), nextBtn = document.getElementById('flipNext');
    totEl.textContent = TOTAL;

    function render() {
      leaves.forEach(function (lf, idx) {
        var turned = idx < cur;
        lf.classList.toggle('turned', turned);
        lf.style.zIndex = turned ? idx : (TOTAL - idx);
      });
      curEl.textContent = (cur + 1 < 10 ? '0' : '') + (cur + 1);
      prevBtn.disabled = cur === 0; nextBtn.disabled = cur === TOTAL - 1;
    }
    function flash(idx) {
      var lf = leaves[idx]; if (!lf) return;
      lf.classList.add('flipping');
      setTimeout(function () { lf.classList.remove('flipping'); }, 1000);
    }
    function next() { if (cur < TOTAL - 1) { flash(cur); cur++; render(); } }
    function prev() { if (cur > 0) { cur--; flash(cur); render(); } }
    render();

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    /* 点击右半页 → 下一页；点击左半页 → 上一页；亦可拖动翻页 */
    var stage = document.getElementById('bookStage');
    var downX = null, moved = false, dragged = false;
    function turnAt(clientX) {
      var r = stage.getBoundingClientRect();
      (clientX - r.left) > r.width / 2 ? next() : prev();
    }
    stage.addEventListener('pointerdown', function (e) {
      downX = e.clientX; moved = false; dragged = false;
    });
    stage.addEventListener('pointermove', function (e) {
      if (downX !== null && Math.abs(e.clientX - downX) > 8) moved = true;
    });
    stage.addEventListener('pointerup', function (e) {
      if (downX === null) return;
      var dx = e.clientX - downX;
      if (moved && Math.abs(dx) > 40) { dx < 0 ? next() : prev(); dragged = true; }
      downX = null;
    });
    /* 纯点击（无明显拖动）按左右半页翻页；拖动已处理则跳过 */
    stage.addEventListener('click', function (e) {
      if (dragged) { dragged = false; return; }
      turnAt(e.clientX);
    });
    stage.style.cursor = 'pointer';
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      stage.title = (e.clientX - r.left) > r.width / 2 ? '下一页 →' : '← 上一页';
    });

    /* 键盘 */
    addEventListener('keydown', function (e) {
      if (lb.classList.contains('open')) return;
      var rect = stage.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) {
        if (e.key === 'ArrowRight') next();
        else if (e.key === 'ArrowLeft') prev();
      }
    });
  }

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'), lbCap = document.getElementById('lbCap');
  function openLB(src, cap) { lbImg.src = src; lbCap.textContent = cap || ''; lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeLB() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  document.querySelectorAll('[data-src]').forEach(function (el) {
    el.addEventListener('click', function () {
      var cap = ''; var img = el.querySelector('img');
      if (img) cap = img.alt;
      openLB(el.getAttribute('data-src'), cap);
    });
  });
  document.getElementById('lbClose').addEventListener('click', function (e) { e.stopPropagation(); closeLB(); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target === lbImg) closeLB(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLB(); });
})();
