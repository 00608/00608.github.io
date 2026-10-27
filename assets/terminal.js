/* =========================================================
   首屏整屏终端
   - 启动序列：命令逐字打出，输出行整块出现（和 ddaniel.dev 的做法一致）
   - 之后是能真敲的命令行：help / ls / cat / open / clear
   页面文字本来就在 HTML 里，JS 只负责揭幕
   ========================================================= */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false;
  try { seen = localStorage.getItem('we-seen') === '1'; } catch (e) {}

  var boot = document.getElementById('boot');
  var linesEl = document.getElementById('termLines');
  if (!boot || !linesEl) return;

  var live = document.getElementById('live');
  var form = document.getElementById('promptForm');
  var input = document.getElementById('cmd');
  var hint = document.getElementById('hint');
  var skip = document.getElementById('skip');

  var lines = Array.prototype.slice.call(linesEl.children);
  var timers = [];
  var finished = false;

  function wait(ms) {
    return new Promise(function (r) { timers.push(setTimeout(r, ms)); });
  }

  /* ---------- 启动动画 ---------- */

  function typeInto(el, speed) {
    var full = el.textContent;
    el.dataset.full = full;              // 先存全文，跳过时用它还原
    var caret = document.createElement('span');
    caret.className = 'caret';
    el.parentNode.appendChild(caret);
    el.textContent = '';
    return new Promise(function (res) {
      var i = 0;
      (function step() {
        if (finished) { caret.remove(); return res(); }
        if (i >= full.length) { caret.remove(); return res(); }
        el.textContent += full.charAt(i);
        i += 1;
        timers.push(setTimeout(step, speed));
      })();
    });
  }

  function revealAll() {
    if (finished) return;
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

  function end() {
    if (end.done) return;
    end.done = true;
    if (skip) skip.hidden = true;
    if (form) form.classList.add('on');
    if (hint) hint.classList.add('on');
    try { localStorage.setItem('we-seen', '1'); } catch (e) {}
    // 桌面端自动聚焦，方便直接敲命令；触屏不聚焦，免得弹键盘
    var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (!touch && input) input.focus({ preventScroll: true });
  }

  function play() {
    if (reduce || seen) { revealAll(); return; }
    var chain = Promise.resolve();
    lines.forEach(function (l) {
      chain = chain.then(function () {
        if (finished) return;
        if (l.hasAttribute('data-type')) {
          var ty = l.querySelector('.ty');
          return typeInto(ty, 42).then(function () {
            l.classList.add('on');
            return wait(90);
          });
        }
        l.classList.add('on');
        return wait(l.classList.contains('dirs') ? 260 : 45);
      });
    });
    chain.then(function () {
      if (!finished) { finished = true; end(); }
    });
  }

  /* 跳过：按钮 / Esc / 滚轮 / 点击空白 */
  function onSkip() { if (!finished) revealAll(); }
  if (skip) skip.addEventListener('click', onSkip);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') onSkip();
  });
  boot.addEventListener('wheel', onSkip, { passive: true, once: true });
  boot.addEventListener('click', function (e) {
    if (e.target.closest('a') || e.target.closest('form') || e.target.closest('button')) return;
    onSkip();
  });
  setTimeout(function () { if (!finished) revealAll(); }, 9000);

  /* ---------- 命令行 ---------- */

  var FILES = {
    'about.md': [
      '# 无误差（00608）',
      '大一 · 学前端 · 也在啃 C 和边缘 AI',
      '',
      '<b>终身成长</b> —— 我把「提高人生体验」当人生意义，不是口号',
      '<b>超级 i 人</b> —— 人群里耗电，独处时充电',
      '<b>跑步</b> —— 用配速表看自己有没有变快（10 公里 50:00）',
      '<b>健身</b> —— 在练力量和体态，不为拍照（卧推 50kg 含杆）',
      '<b>游戏</b> —— 更关心它为什么好玩、为什么掉帧',
      '<b>高敏</b> —— 感受得多，也更容易累；学着用它观察',
      '<b>自我管理</b> —— 在练时间和精力，不靠硬扛意志力'
    ],
    'projects.md': [
      '001  这个网站本身          [已上线]  HTML CSS JS   → 00608.github.io',
      '002  todo — 命令行待办      [已上线]  C gcc        → gitee.com/no-errors-at-all',
      '003  填坑 study.c          [开发中]  C Git',
      '004  一个能离线跑的小盒子    [规划中]  嵌入式 AI C',
      '',
      '状态标签比日期诚实，所以不写"预计几月完成"。'
    ],
    'log.md': [
      '2026-10-28  #学习  第一次跟段错误打交道，先怀疑自己',
      '2026-10-27  #学习  v0.1 上线了，它很丑，但它存在',
      '2026-10-25  #学习  先学 C 而不是 Python，这个决定我还在验证',
      '2026-10-22  #学习  空仓库的第一天：先把 README 写了',
      '2026-08     #健身  卧推第一次到 50 公斤（含杆）',
      '2026-04-15  #跑步  10 公里，配速第一次跑进 5 分整',
      '',
      '共 6 条。完整内容在 log 页。'
    ],
    'contact.md': [
      '邮箱     276677857@qq.com',
      'GitHub   github.com/00608',
      'Gitee    gitee.com/no-errors-at-all',
      '微信     在 about 页最下面，点开就是二维码',
      '',
      '要聊技术、组队、或者问「study.c 到底写了啥」，直接发邮件。回得慢，但会回。'
    ]
  };

  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
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

  var HELP = [
    '<b>whoami</b>         我是谁',
    '<b>cat about.md</b>   完整自我介绍',
    '<b>cat projects.md</b> 项目清单',
    '<b>cat log.md</b>     最近的日志',
    '<b>cat contact.md</b> 联系方式',
    '<b>ls</b>             目录　　　<b>ls projects</b>  项目文件',
    '<b>open</b> projects | log | about　跳转页面',
    '<b>theme</b>          切换明暗　　　<b>clear</b>  清屏'
  ];

  function run(raw) {
    var v = raw.trim();
    if (!v) {
      var nav = document.querySelector('.nav');
      if (nav) nav.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    echoCmd(v);
    var p = v.split(/\s+/);
    var c = p[0].toLowerCase();

    if (c === 'help' || c === '?') {
      HELP.forEach(function (l) { print(l); });
    } else if (c === 'whoami') {
      print('无误差 · 大一 · 学前端，也在啃 C 和边缘 AI');
    } else if (c === 'ls') {
      if (p[1] && /^proj/i.test(p[1])) {
        print('index.html  projects.html  README.md  assets/');
      } else {
        print('<a href="projects.html">projects/</a>　<a href="log.html">log/</a>　<a href="about.html">about/</a>　<a href="about.html#contact">contact/</a>');
      }
    } else if (c === 'cat') {
      var f = (p[1] || '').toLowerCase();
      if (!FILES[f]) {
        print('cat: ' + esc(p[1] || '') + ': No such file　（试试 ls）', 'err');
      } else {
        FILES[f].forEach(function (l) { print(l || '&nbsp;'); });
      }
    } else if (c === 'open' || c === 'cd') {
      var t = (p[1] || '').toLowerCase().replace(/\/$/, '');
      var map = { projects: 'projects.html', log: 'log.html', about: 'about.html', contact: 'about.html#contact', '..': 'index.html' };
      if (map[t]) { print('opening ' + esc(t) + ' ...'); setTimeout(function () { location.href = map[t]; }, 260); }
      else print('open: ' + esc(p[1] || '') + ': 没有这个页面　（projects / log / about）', 'err');
    } else if (c === 'theme') {
      var root = document.documentElement;
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('we-theme', next); } catch (e) {}
      print('theme → ' + next);
    } else if (c === 'clear' || c === 'cls') {
      live.innerHTML = '';
    } else if (c === 'sudo') {
      print('你不是 root。　（我也没有 root）');
    } else {
      print('command not found: ' + esc(v) + '　（试试 help）', 'err');
    }
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value || '';
      input.value = '';
      run(v);
    });
  }

  /* 在页面上随便敲字，自动聚焦到输入框 */
  document.addEventListener('keydown', function (e) {
    if (!finished) return;
    if (document.activeElement === input) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.length === 1 && window.scrollY < window.innerHeight * 0.6) input.focus({ preventScroll: true });
  });

  play();
})();
