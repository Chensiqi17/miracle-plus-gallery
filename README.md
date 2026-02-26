# MiraclePlus Gallery

专注于奇绩创坛 (Miracle Plus) 历届路演项目的数据洞察与展示平台。非官方项目。

## 核心功能

*   **全景数据洞察**
    *   **赛道风向标**：基于 Apache ECharts 的动态折线图，展示 AI、具身智能、出海等核心赛道的历年演变趋势。
    *   **高校势力榜**：统计 Founder 毕业院校分布，展现创新源头。
    *   **年度热词**：基于标签云的年度技术热点可视化。
    *   **创始人画像**：博士比例、海外背景等关键指标统计。

*   **项目探索**
    *   **多维筛选**：支持按年份、赛道标签、关键词实时检索 2021-2025 所有公开路演项目。
    *   **响应式详情页**：针对移动端优化的项目展示卡片。

*   **人脉关联推荐**
    *   基于后台图谱数据，在项目详情页自动推荐潜在的“校友项目”和“前同事项目”，挖掘隐形连接。

*   **现代化架构**
    *   **极致性能**：全站静态化 (SSG) + 图片资源本地化。
    *   **现代 UI**：基于 Tailwind CSS v4 和 Radix UI 构建的深色模式优先界面。

## 本地运行

1.  **克隆仓库**
    ```bash
    git clone https://github.com/Nimbus318/miracle-plus-gallery.git
    cd miracle-plus-gallery
    ```

2.  **安装依赖**
    ```bash
    pnpm install
    ```

3.  **启动开发服务器**
    ```bash
    pnpm dev
    ```
    访问 http://localhost:3000

## 发布到线上

本项目使用 Next.js 静态导出（`output: 'export'`），构建产物在 `out` 目录，可部署到任意静态托管。

### 方式一：Vercel（推荐）

1. 将仓库推送到 GitHub（若尚未推送）。
2. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录。
3. 点击 **Add New → Project**，选择 `miracle-plus-gallery` 仓库。
4. **Framework Preset** 选 Next.js，**Build Command** 保持 `next build`，**Output Directory** 填 `out`（若 Vercel 未自动识别静态导出）。
5. 点击 **Deploy**，等待构建完成即可获得一个 `xxx.vercel.app` 的线上地址。

### 方式二：Netlify

1. 打开 [netlify.com](https://www.netlify.com)，用 GitHub 登录。
2. **Add new site → Import an existing project**，选择该仓库。
3. Build command 填：`npm run build` 或 `pnpm build`  
   Publish directory 填：`out`
4. 点击 **Deploy**，完成后会得到 `xxx.netlify.app` 的地址。

### 方式三：GitHub Pages

1. 在项目根目录执行：
   ```bash
   npm run build
   ```
2. 将 `out` 目录内容推送到仓库的 `gh-pages` 分支，或使用 [GitHub Actions](https://github.com/peaceiris/actions-gh-pages) 在每次 push 后自动构建并发布。
3. 在仓库 **Settings → Pages** 里将 Source 设为 `gh-pages` 分支的根目录。
4. 若项目不在根路径（如 `username.github.io/repo-name`），需在 `next.config.ts` 中设置 `assetPrefix` 和 `basePath` 为 `'/repo-name/'` 后重新构建。

## License

MIT © Nimbus318

![visitors](https://visitor-badge.laobi.icu/badge?page_id=Nimbus318.miracle-plus-gallery)
