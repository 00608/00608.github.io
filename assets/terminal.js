/* =========================================================
   首屏整屏终端（按钮版）
   - 启动序列：命令逐字打出，输出行整块出现
   - 之后点按钮就能看内容，不需要打字
   - 任何 JS 出错都会自动解除隐藏，不会出现黑屏白板
   ========================================================= */
(function () {
  'use strict';

  /* 安全网：出任何未捕获错误，就取消隐藏，让 HTML 里的文字直接显示 */
  window.addEventListener('error', function () {
    document.documentElement.classList.remove('js');
  });

  var boot = document.getElementById('boot');
  var linesEl = document.getElementById('termLines');
  if (!boot || !linesEl) return;

  var live = document.getElementById('live');
  var cmds = document.getElementById('cmds');
  var hint = document.getElementById('hint');
  var skip = document.getElementById('skip');

  var lines = Array.prototype.slice.call(linesEl.children);
  var timers = [];
  var finished = false;

  function wait(ms) {
    return new Promise(function (r) { timers.push(setTimeout(r, ms)); });
  }

  function typeInto(el, speed) {
    var full = el.textContent;
    el.dataset.full = full;
    var caret = document.createElement('span');
    caret.className = 'caret';
    el.parentNode.appendChild(caret);
    el.textContent = '';
    return new Promise(function (res) {
      var i = 0;
      (function step() {
        if (finished || i >= full.length) { caret.remove(); return res(); }
        el.textContent += full.charAt(i);
        i += 1;
        timers.push(setTimeout(step, speed));
      })();
    });
  }

  function end() {
    if (end.done) return;
    end.done = true;
    if (skip) skip.hidden = true;
    if (cmds) cmds.classList.add('on');
    if (hint) hint.classList.add('on');
    try { localStorage.setItem('we-seen', '1'); } catch (e) {}
  }

  function revealAll() {
    finished = true;
    timers.forEach(clearTimeout);
    timers = [];
    lines.forEach(function (l) { l.classList.add('on'); });
    Array.prototype.forEach.call(linesEl.querySelectorAll('.ty'), function (el) {
      if (el.dataset.full != null) el.textContent = el.dataset.full;
    });
    Array.prototype.forEach.call(boot.querySelectorAll('.caret'), function (c) { c.remove(); });
    end();
  }

  function play() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var seen = false;
    try { seen = localStorage.getItem('we-seen') === '1'; } catch (e) {}
    if (reduce || seen) { revealAll(); return; }

    var chain = Promise.resolve();
    lines.forEach(function (l) {
      chain = chain.then(function () {
        if (finished) return;
        if (l.hasAttribute('data-type')) {
          var ty = l.querySelector('.ty');
          return typeInto(ty, 40).then(function () {
            l.classList.add('on');
            return wait(80);
          });
        }
        l.classList.add('on');
        return wait(l.classList.contains('dirs') ? 240 : 40);
      });
    });
    chain.then(function () {
      if (!finished) { finished = true; end(); }
    });
  }

  /* 跳过 */
  function onSkip() { if (!finished) revealAll(); }
  if (skip) skip.addEventListener('click', onSkip);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') onSkip();
  });
  boot.addEventListener('wheel', onSkip, { passive: true, once: true });
  boot.addEventListener('click', function (e) {
    if (e.target.closest('a') || e.target.closest('button')) return;
    onSkip();
  });
  setTimeout(onSkip, 9000);

  /* ---------------- 命令内容 ---------------- */

  var FILES = {
    'about.md': [
      '# 无误差（00608）',
      '大一 · 学前端 · 也在啃 C 和边缘 AI',
      '&nbsp;',
      '<b>终身成长</b> —— 我把「提高人生体验」当人生意义，不是口号',
      '<b>超级 i 人</b> —— 人群里耗电，独处时充电',
      '<b>跑步</b> —— 用配速表看自己有没有变快（10 公里 50:00）',
      '<b>健身</b> —— 在练力量和体态，不为拍照（卧推 50kg 含杆）',
      '<b>游戏</b> —— 更关心它为什么好玩、为什么掉帧',
      '<b>高敏</b> —— 感受得多，也更容易累；学着用它观察',
      '<b>自我管理</b> —— 在练时间和精力，不靠硬扛意志力'
    ],
    'projects.md': [
      '001  这个网站本身          [已上线]  HTML CSS JS',
      '     → 00608.github.io',
      '002  todo — 命令行待办      [已上线]  C gcc',
      '     → gitee.com/no-errors-at-all',
      '003  填坑 study.c          [开发中]  C Git',
      '004  一个能离线跑的小盒子    [规划中]  嵌入式 AI C',
      '&nbsp;',
      '状态标签比日期诚实，所以不写"预计几月完成"。'
    ],
    'log.md': [
      '2026-10-28  #学习  第一次跟段错误打交道，先怀疑自己',
      '2026-10-27  #学习  v0.1 上线了，它很丑，但它存在',
      '2026-10-25  #学习  先学 C 而不是 Python，这个决定我还在验证',
      '2026-10-22  #学习  空仓库的第一天：先把 README 写了',
      '2026-08     #健身  卧推第一次到 50 公斤（含杆）',
      '2026-04-15  #跑步  10 公里，配速第一次跑进 5 分整',
      '&nbsp;',
      '共 6 条。完整内容 → <a href="log.html">log 页</a>'
    ],
    'contact.md': [
      '邮箱     276677857@qq.com',
      'GitHub   github.com/00608',
      'Gitee    gitee.com/no-errors-at-all',
      '微信     在 <a href="about.html#contact">about 页</a>最下面',
      '&nbsp;',
      '要聊技术、组队、或者问「study.c 到底写了啥」，直接发邮件。回得慢，但会回。'
    ]
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function print(html, cls) {
    var d = document.createElement('div');
    d.className = 'ln out on ' + (cls || '');
    d.innerHTML = html;
    live.appendChild(d);
  }

  function echoCmd(v) {
    var d = document.createElement('div');
    d.className = 'ln on';
    d.innerHTML = '<span class="ps">no-errors@wuwucha:~$</span><span class="ty">' + esc(v) + '</span>';
    live.appendChild(d);
  }

  function run(v) {
    echoCmd(v);

    if (v === 'clear') { live.innerHTML = ''; return; }
    if (v === 'whoami') { print('无误差 · 大一 · 学前端，也在啃 C 和边缘 AI'); return; }

    var m = /^cat\s+(\S+)$/.exec(v);
    if (m) {
      var f = m[1].toLowerCase();
      if (!FILES[f]) { print('cat: ' + esc(m[1]) + ': No such file', 'err'); return; }
      FILES[f].forEach(function (l) { print(l || '&nbsp;'); });
      return;
    }
    print('不认识：' + esc(v), 'err');
  }

  if (cmds) {
    cmds.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-cmd]') : null;
      if (!b) return;
      run(b.getAttribute('data-cmd'));
      var last = live.lastElementChild;
      if (last && last.getBoundingClientRect().bottom > window.innerHeight) {
        last.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  /* 所有绑定完成后才加 js 类（隐藏启动动画的行）；之前任何一步出错都不会藏内容 */
  document.documentElement.classList.add('js');
  play();
})();
