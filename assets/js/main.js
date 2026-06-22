/* 苏麻离青 · 交互脚本 */
(function () {
  'use strict';

  /* ---- 移动端菜单 ---- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('show'); });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('show');
    });
  }

  /* ---- 滚动渐显 ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- 灯箱 ---- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var items = [];   // {src, cap}
  var idx = 0;

  function collect() {
    items = [];
    document.querySelectorAll('[data-src]').forEach(function (el) {
      var cap = '';
      var fc = el.querySelector('figcaption');
      if (fc) cap = fc.textContent.trim();
      else if (el.getAttribute('alt')) cap = el.getAttribute('alt');
      var img = el.querySelector('img');
      if (img && img.alt && !cap) cap = img.alt;
      items.push({ src: el.getAttribute('data-src'), cap: cap, el: el });
    });
  }
  collect();

  function show(i) {
    if (!items.length) return;
    idx = (i + items.length) % items.length;
    lbImg.src = items[idx].src;
    lbCap.textContent = items[idx].cap || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }

  document.querySelectorAll('[data-src]').forEach(function (el) {
    el.addEventListener('click', function () {
      var here = items.findIndex(function (it) { return it.el === el; });
      show(here < 0 ? 0 : here);
    });
  });

  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
  document.getElementById('lbNext').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* ---- 导航高亮当前区块 ---- */
  var navAnchors = document.querySelectorAll('.nav-links a');
  var secs = [];
  navAnchors.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var s = document.getElementById(id);
    if (s) secs.push({ a: a, s: s });
  });
  function onScroll() {
    var y = window.scrollY + 120;
    var cur = null;
    secs.forEach(function (o) { if (o.s.offsetTop <= y) cur = o; });
    navAnchors.forEach(function (a) { a.style.color = ''; });
    if (cur) cur.a.style.color = 'var(--qing)';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
