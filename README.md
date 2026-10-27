# 无误差 · 个人站（M1）

一个手写的静态站：4 个页面 + 一个 404，没有框架、没有构建工具、没有依赖。

```
site/
├── index.html        首屏：终端开场 + 三入口 + 最新日志
├── projects.html     项目：进行中 / 已完成 / 简历
├── log.html          日志：学习 · 跑步 · 游戏
├── about.html        关于 + 联系方式
├── 404.html          错误页（样式内联，不依赖外部文件）
└── assets/
    ├── style.css     全站样式（改颜色只改 :root）
    └── terminal.js   首屏终端动效 + 命令行交互
```

---

## 一、上线（GitHub Pages）

1. **建仓库**
   - 想要最短地址 `https://<用户名>.github.io` → 仓库名必须叫 `<用户名>.github.io`
   - 无所谓地址 → 随便叫，比如 `homepage`，地址是 `https://<用户名>.github.io/homepage/`
2. **上传**：仓库页 → `Add file` → `Upload files` → 把 `site` 里的**所有文件和 assets 文件夹**拖进去 → `Commit changes`
   - 注意：要让 `index.html` 在仓库根目录，不是在 `site/` 子目录里
3. **开 Pages**：`Settings` → `Pages` → Source 选 `Deploy from a branch` → 分支 `main`、目录 `/ (root)` → `Save`
4. 等 1 分钟，刷新 Settings → Pages，顶部会给出地址。

### 两个坑（我都踩过）

- **404 了半小时**：多半是 `index.html` 不在仓库根目录，或者 Pages 还没构建完。
- **404 页的「回首页」**：`404.html` 里写的是 `href="/"`，这在「用户主页仓库」下是对的；如果放在「项目仓库」里，要改成 `/仓库名/`。

### 微信二维码

把二维码图片存成 `assets/wechat-qr.webp`（或 `.png`，记得同步改 `about.html` 里的 `src`）。
没有这张图也不会报错，会显示一行提示。

---

## 二、日常改内容（不需要懂代码）

| 想改什么 | 改哪个文件 | 找什么 |
|---|---|---|
| 首屏那三行自我介绍 | `index.html` | 搜 `whoami`，下面两行 `class="tl out"` 就是 |
| 一句话定位 | `index.html` | 搜 `class="tagline"` |
| 项目卡片 | `projects.html` | 复制一整段 `<article class="card">…</article>` 改文字 |
| 状态标签 | `projects.html` | `badge doing`=开发中，`badge plan`=规划中，`badge on`=已上线 |
| 加一条日志 | `log.html` | 复制一整段 `<article class="log" id="l00x">…</article>`，**最新的放最上面** |
| 联系方式 | `about.html` | 搜 `contact-list` |
| 全站颜色 | `assets/style.css` | 最上面 `:root` 里的变量 |
| 页脚印章 | 每个页面的 `footer` | 搜 `0&nbsp;ERROR` |

### 加日志的模板

```html
<article class="log" id="l005" data-tag="学习">
  <div class="log-meta"><span>2026-11-03</span><span>#学习</span></div>
  <h3>一句话结论当标题，不要写"今天学习了 XX"</h3>
  <p><span class="k">做了什么：</span>…</p>
  <p><span class="k">卡在哪：</span>…</p>
  <p><span class="k">下一步：</span>…</p>
</article>
```

**两个必须注意的点**：

- `data-tag` 决定筛选按钮能不能筛到它，只能是 `学习` / `跑步` / `健身` / `游戏` 四个值之一；`#学习` 那行只是给人看的。
- `id` 不能重，新条目往上加（最新的在最上面），编号接着排。

**规矩**：一条不超过 500 字；跑步类必须带里程或配速；游戏类写"为什么好玩 / 为什么掉帧"，不写时长战绩。

---

## 三、这份代码里已经做掉的事

- 首屏文字**写死在 HTML 里**，JS 只负责揭幕 → 关掉 JS、搜索引擎、纯文本阅读器都能看到内容
- 跳过：点击 / 任意键 / 滚动 / 8 秒兜底，四条路任一条都能立刻看全文
- 二次访问不重播（`localStorage` 记 `we-seen`）
- `prefers-reduced-motion` 下不动画
- 手机（≤640px）隐藏命令行，`ls` 的目录改为直接点击
- 明暗切换：默认跟随系统，点右上角 `◐` 手动切换并记住（`localStorage` 记 `we-theme`）
- 日志标签筛选：`全部 / #学习 / #跑步 / #游戏`，没内容的分类会给一句说明而不是空白
- 黑白灰 + 唯一彩色 `#39D353`
- 无外部字体、无图片、无第三方脚本（首屏总量几 KB）

---

## 四、还没做（M2 起）

- [ ] 项目页加截图 / 动图
- [ ] 自建域名 + Cloudflare Pages
- [ ] RSS（等日志攒到 10 条再说）
- [ ] 日志按标签的独立页面（`/log/tag/running` 之类）
