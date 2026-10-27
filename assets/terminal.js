/* =========================================================
   首屏：终端外壳 + 打招呼 + 身份清单
   - cmdline / hello：逐字打出来
   - id-line / dirs：逐条浮现
   文字本来就在 HTML 里，这里只是"揭幕"
   ========================================================= */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false;
  try { seen = localStorage.getItem('we-seen') === '1'; } catch (e) {}

  var term   = document.getElementById('term');
  var bodyEl = document.getElementById('termBody');
  if (!term || !bodyEl) return;

  var skip   = document.getElementById('skip');
  var hint   = document.getElementById('hint');
  var form   = document.getElementById('promptForm');
  var input  = document.getElementById('cmd');
  var echoEl = document.getElementById('echo');

  var lines = Array.prototype.slice.call(bodyEl.querySelectorAll('.tl'));
  var timers = [];
  var finished = false;

  function wait(ms) {
    return new Promise(function (r) { timers.push(setTimeout(r, ms)); });
  }
  function isTyped(l) { return l.classList.contains('cmdline') || l.classList.contains('hello'); }
  function target(l) { return l.querySelector('.cmd') || l; }

  function prepare() {
    lines.forEach(function (l) {
      l.style.opacity = '0';
      if (!isTyped(l)) return;
      var t = target(l);
      t.dataset.full = t.textContent;
      t.textContent = '';
    });
  }

  function type(el, speed) {
    var full = el.dataset.full || '';
    var cur = document.createElement('span');
    cur.className = 'cur';
    cur.textContent = '▌';
    el.appendChild(cur);
    return new Promise(function (res) {
      var i = 0;
      (function step() {
        if (finished) return res();
        if (i >= full.length) { cur.remove(); return res(); }
        cur.insertAdjacentText('beforebegin', full.charAt(i));
        i += 1;
        timers.push(setTimeout(step, speed));
      })();
    });
  }

  function reveal() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    timers = [];
    lines.forEach(function (l) {
      l.style.opacity = '1';
      if (!isTyped(l)) return;
      var t = target(l);
      if (t.dataset.full != null) t.textContent = t.dataset.full;
      var c = l.querySelector('.cur');
      if (c) c.remove();
    });
    finish();
  }

  function finish() {
    if (finish.done) return;
    finish.done = true;
    finished = true;
    if (skip) skip.hidden = true;
    if (hint) hint.classList.add('on');
    try { localStorage.setItem('we-seen', '1'); } catch (e) {}
  }

  function play() {
    if (reduce || seen) { reveal(); return; }
    try {
      prepare();
      var chain = Promise.resolve();
      lines.forEach(function (l) {
        chain = chain.then(function () {
          if (finished) return;
          l.style.opacity = '1';
          if (!isTyped(l)) return wait(85);                       // 身份条目：逐条浮现
          var t = target(l);
          var speed = l.classList.contains('hello') ? 70 : 45;    // 打招呼慢一点，有停顿感
          return type(t, speed).then(function () { return wait(140); });
        });
      });
      chain.then(function () {
        if (!finished) { finished = true; finish(); }
      }).catch(reveal);
    } catch (e) { reveal(); }
  }

  /* ---- 跳过：点击 / 按键 / 滚动，任一即可 ---- */
  function onSkip(e) {
    if (finished) return;
    if (e && e.target && e.target.closest && e.target.closest('#promptForm')) return;
    reveal();
  }
  if (skip) skip.addEventListener('click', onSkip);
  document.addEventListener('keydown', onSkip);
  term.addEventListener('click', function (e) {
    if (e.target.closest('a')) return;
    onSkip(e);
  });
  window.addEventListener('wheel', onSkip, { passive: true });
  setTimeout(function () { if (!finished) reveal(); }, 9000);

  /* ---- 打完字还能敲命令 ---- */
  var CMDS = ['whoami', 'ls', 'about', 'contact', 'help', 'clear'];
  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function echo(html, cls) {
    var d = document.createElement('div');
    d.className = 'tl out ' + (cls || '');
    d.innerHTML = html;
    echoEl.appendChild(d);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input.value || '').trim();
      if (!v) return;
      input.value = '';
      var name = v.toLowerCase();
      if (CMDS.indexOf(name) === -1) {
        echo('<span class="ps">no-errors@wuwucha:~$</span>' + esc(v));
        echo('command not found: ' + esc(v) + '　（试试 help）', 'err');
        return;
      }
      if (name === 'clear') { echoEl.innerHTML = ''; return; }
      echo('<span class="ps">no-errors@wuwucha:~$</span>' + esc(v));
      if (name === 'whoami') {
        echo('无误差 · 大一 · 学前端，也在啃 C 和边缘 AI');
        echo('终身成长 / 超级 i 人 / 跑步 / 游戏 / 高敏 / 自我管理');
      } else if (name === 'ls') {
        echo('<a href="projects.html">projects/</a>　<a href="log.html">log/</a>　' +
             '<a href="about.html">about/</a>　<a href="about.html#contact">contact/</a>');
      } else if (name === 'about') {
        echo('关于 → <a href="about.html">about.html</a>；进度 → <a href="log.html">log.html</a>');
      } else if (name === 'contact') {
        echo('邮箱 <a href="mailto:276677857@qq.com">276677857@qq.com</a>　其他 → <a href="about.html#contact">联系</a>');
      } else if (name === 'help') {
        echo('可用：whoami · ls · about · contact · clear');
      }
    });
  }

  play();
})();
