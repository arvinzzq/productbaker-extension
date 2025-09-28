# Drawer Panel iframe 加载优化方案

## 背景
- 内容脚本 `chrome-extension/contents/drawer-panel.tsx` 通过 iframe 嵌入 `https://extension.productbaker.com/seo-analysis` 页面。
- 当前在首次打开侧边抽屉到 iframe 完整渲染之间出现明显白屏，影响速度体感。

## 现状观察
- iframe 仅在抽屉首次打开且 `userActivated` 为 true 时创建，之后保持挂载并隐藏。
- 预热逻辑（`rel=preconnect`）在用户第一次触发后才执行，无法覆盖首次点击。
- iframe `onLoad` 回调中直接调用 `revealIframe()`，导致 loader 在嵌入页真正首屏渲染前就消失，暴露白底。
- fallback 机制会在 0.5s 或 2s 内强制展示 iframe，即使内容尚未 ready。

## 优化目标
1. 降低首次打开 iframe 的实际网络与计算耗时。
2. 在真实加载尚未完成时提供稳定、无白屏的过渡视图，提升主观速度。
3. 保持扩展合规与资源消耗的可控。

## 优化方案
### 1. 提前预热网络链路
- **立即注入 resource hints**：在内容脚本初始化时就插入 `preconnect`/`dns-prefetch` 到目标域，避免等待到用户激活。
- **后台预抓取首屏 HTML**：由 service worker 或 background `fetch` 目标页面（带 `cache: "reload"`），依赖浏览器 HTTP 缓存供 iframe 复用；注意处理无缓存或私有缓存策略。
- **预加载关键静态资源**：监听首屏请求（通过 devtools 或服务端日志）将关键 JS/CSS 列到 `link rel="preload"` 或 `prefetch`，在用户激活后异步注入。
- **保持 TLS 会话活动**：在扩展激活期间周期性地向轻量 ping 接口发送 HEAD 请求，减少 TLS 重协商开销。

### 2. iframe 生命周期与复用策略
- **提前隐藏加载**：在用户点击扩展图标（`TOGGLE_FLOATING_PANEL`）后立刻创建 iframe，但使用 `visibility: hidden` + `pointer-events: none` 保持不可见；待抽屉动画完成再展示。
- **避免不必要的重建**：仅在 URL 变化或用户手动刷新时更新 `iframe.src`，去掉通用的 `setIframeKey(prev=>prev+1)`，防止 React 强制卸载导致重复加载。
- **可选：共享单例 iframe**：用 document 级别的隐藏容器维护唯一 iframe，抽屉里通过 React Portal 引用，减轻每个 tab 的重复初始化成本。
- **错误恢复策略**：失败时先显示缓存副本或提示，并延时重新挂载，避免用户立即看到白屏。

### 3. 加载占位与过渡体验
- **延迟移除 loader**：调整 `chrome-extension/contents/drawer-panel.tsx:168` 附近逻辑，让 `onLoad` 只更新 `iframeLoaded`，真正的 `revealIframe()` 仅在收到 iframe 内发送的“内容渲染完成”消息（如 `IFRAME_CONTENT_READY`）后触发，确保视图切换时页面已绘制完首屏。
- **跨 iframe 渲染信号**：在嵌入页首屏渲染结束（React `useEffect`、`DOMContentLoaded` 或首个主要组件 `useLayoutEffect`）时，通过 `postMessage` 回传具体阶段（`loading`/`rendering`/`ready`），宿主据此控制遮罩何时淡出；弱网下可在 2–3 秒追加兜底消息，避免长时间遮挡。
- **增强遮罩层**：将 loading 覆盖层背景改为浅灰/品牌渐变，并提供骨架屏布局（卡片块、折线占位），即使 iframe 仍为白底时用户也不会直视空白。
- **渐进内容展示**：宿主在接收到 `rendering` 阶段信号时可展示精炼的文字提示或关键指标进度，待 `ready` 阶段才切换到 iframe 真实页面，进一步提升体感。
- **首屏信息前置**：在宿主侧先展示根据当前页面计算的关键信息（例如标题、Meta 描述、H1）作为即时反馈，iframe 加载后再替换为完整分析。

### 4. 嵌入页自身优化（与 Web 团队协作）
- **SSR 或预渲染**：将 `seo-analysis` 页面首屏改为服务端渲染/静态 HTML，减少 SPA 首屏白屏。
- **减少 bundle 体积**：拆分非首屏依赖，使用模块懒加载，压缩字体与图表资源。
- **内置骨架屏**：在 iframe 页面内部保证在 JS 完全执行前就有 CSS + HTML 占位，避免纯白画面。
- **缓存接口**：对分析 API 结果做 CDN/Edge 缓存或使用 ETag，缩短数据请求耗时。

### 5. 度量与验证
- 在宿主侧记录 `toggle`→`IFRAME_READY` 的时间并上报，以验证优化效果。
- 通过 `performance.mark`/`measure` 或 `chrome.debugger` 收集网络链路耗时，定位瓶颈。
- 针对不同网络环境（3G/4G/Wi-Fi）和设备做对比测试，确保改动不会在弱网下退化体验。

## 建议实施顺序
1. 快速试验：调整 loader 隐藏时机、强化占位层，立即缓解白屏体感。
2. 中期：上线资源预热与 iframe 单例复用方案，降低首次真实加载时间。
3. 长期：推进嵌入页的 SSR/骨架与数据缓存优化，彻底压缩加载链路。

## 风险与注意事项
- 预加载/预抓取可能带来额外流量，应结合使用频次与用户许可控制。
- 隐藏 iframe 预加载需遵守 Chrome 扩展政策，确保在用户触发后才进行。
- 修改 loader 逻辑时需覆盖错误恢复流程，避免在 iframe 首屏失败时长时间遮挡。
