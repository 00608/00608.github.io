/* =========================================================
   全站通用交互：主题切换 + 日志标签筛选
   没有这段 JS，页面照样能看 —— 只是少了按钮和筛选
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* ---------------- 明暗切换 ---------------- */
  var KEY = 'we-theme';

  function systemDark() {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function current() {
    return root.dataset.theme || (systemDark() ? 'dark' : 'light');
  }

  var btn = document.getElementById('themeBtn');
  if (btn) {
    btn.setAttribute('aria-pressed', String(current() === 'dark'));
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;                     // 一旦手动选过，就不再跟随系统
      btn.setAttribute('aria-pressed', String(next === 'dark'));
      btn.title = next === 'dark' ? '切换到浅色' : '切换到深色';
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
    btn.title = current() === 'dark' ? '切换到浅色' : '切换到深色';
  }

  /* ---------------- 日志标签筛选 ---------------- */
  var bar = document.getElementById('filterBar');
  if (bar) {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-tag]'));
    var empty = document.getElementById('filterEmpty');

    bar.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-filter]') : null;
      if (!b) return;

      var f = b.dataset.filter;
      var btns = bar.querySelectorAll('button');
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.toggle('on', btns[i] === b);
      }

      var shown = 0;
      items.forEach(function (it) {
        var show = (f === 'all' || it.dataset.tag === f);
        it.hidden = !show;
        if (show) shown += 1;
      });

      if (empty) empty.hidden = shown !== 0;
    });
  }
})();
