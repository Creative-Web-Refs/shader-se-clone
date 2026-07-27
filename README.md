# Shader.se 实时镜像与 WebGPU 实现分析

这是 [Shader Development Studio](https://www.shader.se/) 的同源、响应体无损
实时镜像，部署在 Cloudflare Pages。

**镜像地址：** [shader-se-clone.pages.dev](https://shader-se-clone.pages.dev/)

**上一版 clean-room 复刻：**
[`clean-room-recreation`](https://github.com/Creative-Web-Refs/shader-se-clone/tree/clean-room-recreation)

> 本镜像仅用于独立归档与技术研究，与 Shader Sweden AB 没有隶属、授权或背书
> 关系。上游网站明确标注“All Rights Reserved”。原站代码、美术、视频、商标、
> 文案及其他内容的权利均归 Shader Sweden AB 及相应权利人所有。

## 项目概览

这个仓库同时包含两个层次，阅读时需要区分：

| 层次 | 仓库拥有的代码 | 实际职责 |
| --- | --- | --- |
| 镜像层 | Pages Worker、Vite fallback、提取脚本 | 把固定上游 `www.shader.se` 代理到 Pages 域名 |
| 页面层 | 上游当前生产 HTML、Next.js chunks 和媒体 | WebGPU 场景、时间轴、DOM 内容与真实交互 |

镜像层的技术栈很小：

- Cloudflare Pages 高级模式 `_worker.js`；
- Vite 7，用于复制 Worker 和构建静态 fallback；
- Wrangler 4，用于本地 Pages runtime 和部署；
- Node.js 提取脚本与 Prettier；
- Playwright，用于截图和浏览器验证。

页面层则由上游当前部署决定。现有生产代码可确认 Next.js、React、Three.js WebGPU /
TSL、Zustand、Motion、Mux 和自定义滚动时间线，但这些依赖并不安装在本仓库中。

```mermaid
flowchart LR
    A["浏览器请求"] --> B["Cloudflare Pages Worker"]
    B --> C["固定上游 www.shader.se"]
    C --> D["Next.js HTML / RSC / chunks"]
    C --> E["纹理 / 模型 / 字体 / 视频"]
    D --> F["单 Canvas WebGPU 场景"]
    E --> F
    G["Vite 静态 fallback"] -. "不经过正常代理响应" .-> B
```

## 效果预览

以下截图直接取自当前 Cloudflare Pages 生产镜像。

### 桌面端首屏

![Shader.se 镜像桌面端首屏，展示复古工作站、云层环境和大标题](./docs/screenshots/hero-desktop.jpg)

### 项目胶片场景

![Shader.se 镜像的 eHealth Arena 弯曲项目胶片场景](./docs/screenshots/project-filmstrip.jpg)

### 移动端首屏

<p align="center">
  <img
    src="./docs/screenshots/hero-mobile.jpg"
    width="390"
    alt="Shader.se 镜像移动端首屏，展示纵向标题和复古工作站"
  />
</p>

桌面端截图视口为 1280×720，移动端截图视口为 390×844。三张截图均由同一生产镜像
实时加载，未经过后期合成。

## 核心时间代码阅读版

生产 bundle 已按功能重新命名、格式化并拆成四个便于阅读的文件：

| 文件                                                                | 内容                                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------ |
| [`scene-presets.js`](./docs/effects/scene-presets.js)               | 七个章节的长度、转场类型和完整后处理参数               |
| [`timeline-runtime.js`](./docs/effects/timeline-runtime.js)         | 滚动像素转时间轴、活动页面/场景选择、Navbar 章节跳转   |
| [`effect-timeline.js`](./docs/effects/effect-timeline.js)           | 特效权重、smoothstep、Loading/Subpage/Section 四层插值 |
| [`post-processing-time.js`](./docs/effects/post-processing-time.js) | Clock、Noise 相位、Bloom 呼吸和帧率补偿 Motion Blur    |

从 [`核心时间代码阅读指南`](./docs/effects/README.md) 开始阅读。每段都标明
`SOURCE` / `PARTIAL` / `GUESS`，并由
[`source-map.json`](./docs/effects/source-map.json) 记录生产 chunk 的 URL、SHA-256 和
格式化行号。

如需在本地查看完整格式化生产代码：

```bash
npm run extract:sources
```

结果写入被 Git 忽略的 `.cache/shader-readable/`。仓库只保存语义化阅读版，不直接
发布整份专有 bundle。

## 为什么这一版才是 1:1

上一版使用原创 CSS 和生成素材重新实现了参考站。结构已经接近，但私有 3D 模型、
项目视频、WebGPU shader、转场和精确时间线只能近似。

现在 `main` 使用 Cloudflare Pages 高级模式 Worker 作为透明同源反向代理：

```text
浏览器
  → shader-se-clone.pages.dev/path?query
  → Cloudflare Pages _worker.js
  → www.shader.se/path?query
  → 未修改的响应体
```

镜像在自己的域名下流式转发上游 HTML、Next.js chunks、CSS、字体、纹理、模型、
预烘焙动画帧和路由响应。页面里的相对 URL 会继续经过同一个代理，因此浏览器运行的
就是 `www.shader.se` 当前线上部署的原始客户端。

本地字节比对确认：镜像 `/` 响应解压后与上游响应完全一致。

## 镜像实现

完整实现位于 [`public/_worker.js`](./public/_worker.js)。

每个请求会经过以下步骤：

1. 保留原始 pathname 和 query string。
2. 创建指向 `https://www.shader.se` 的上游请求。
3. 移除 Cloudflare/客户端转发头以及访客 cookie。
4. 非 GET 请求保留 method 和 request body。
5. 不解析、不压缩、不改写响应 body，直接流式返回。
6. 只改写同源 `Location` 重定向，使页面继续停留在镜像域名。
7. 添加 `x-mirror-source` 和 `x-mirror-notice` 响应头。

镜像提供一个不会访问上游的健康检查：

```text
GET /__mirror-health
```

返回当前代理模式及上游地址。

### 响应语义

“响应体无损”指 Worker 不主动解析或改写 `originResponse.body`。它不代表整个 HTTP
响应逐字节相同：

- `Location` 在跳回 `https://www.shader.se` 时会改写为镜像 origin；
- 增加 `x-mirror-source` 与 `x-mirror-notice`；
- Cloudflare / 浏览器仍可能协商 gzip、缓存和传输层协议；
- 正文校验应在双方解压后进行。

正常流量全部由 `_worker.js` 处理。`index.html` 的 `noindex` 静态 fallback 不会在
上游正常或异常时自动出现：前者返回上游响应，后者返回 Worker 自己生成的纯文本
502。因此不能依靠 fallback 的 `<meta name="robots">` 阻止代理页面被索引。

### 请求与信任边界

代理目标由代码固定，不是可指定任意目标的开放代理，但它会把请求交给一个外部系统：

- 删除 `cookie`、访客 IP 和常见 Cloudflare / `x-forwarded-*` 头；
- 保留路径、query、method，以及非 GET / HEAD 的 request body；
- 没有主动删除 `authorization`、`origin`、Cloudflare Access JWT 等其他敏感头；
- 没有限制允许的方法，也没有为 API / 表单路径建立 allowlist；
- 上游返回的 CSP、缓存、`Set-Cookie` 和 CORS 等头默认继续传给浏览器。

所以当前实现适合公开内容研究，不应直接放在带内部认证头的 Access 网关后，也不适合
把上游写操作当成安全隔离环境。若要强化，可只允许 GET / HEAD，并改用明确的
request / response header allowlist。

## 关键特效实现分析

这个分支执行的是原站线上客户端，所以下列效果不再是视觉近似，而是原站真实运行时。

### 1. WebGPU / Three.js 场景管线

运行时与 bundle 检查确认，页面使用单个固定 Canvas，并由 Three.js WebGPU/TSL
驱动。当前场景先渲染到离屏目标，再进入后处理合成图。

已观察到的后处理参数包括：

- Bloom；
- Noise 与胶片颗粒；
- Sepia；
- 对比度、亮度和饱和度；
- 镜头畸变；
- Motion blur；
- Vignette；
- Chromatic aberration。

镜像原样转发对应的 `_next/static/chunks/*`，因此 shader 代码、uniform 默认值、
renderer 选择和运行时能力检测均为原站生产实现。

### 2. 滚动驱动的场景状态

生产配置中可确认 7 个阶段：

- `hero`
- `projects`
- `office`
- `about-us`
- `golden-tie-reveal`
- `golden-tie`
- `contact`

同时存在 4 种转场模式：`fade`、`direct`、`overlay`、`below`。原站让浏览器
document 保持视口高度，使用自定义 wheel/touch 时间线，而不是原生页面滚动。

镜像运行原始 chunks 并获取原始场景资源，因此相机曲线、缓动、阶段阈值、
后处理插值和转场重叠均被直接保留，无需重新编写。

### 3. 首屏电脑与 CRT 质感

首屏由以下元素组成：

- 米色复古工作站与键盘模型；
- 动态屏幕纹理；
- 烟雾/云层纹理与地面反射；
- 语义化大标题；
- 同时作用于 3D 与 UI 的 CRT 合成。

显示器画面和环境资产通过镜像使用原始路径加载。生产后处理提供最终画面中的 Bloom、
类扫描线颗粒、RGB 边缘、运动拖影、镜头柔化和暗角。

### 4. 项目胶片轮播

项目轮播不是扁平 DOM。原站将项目媒体贴到弯曲胶片表面，并由项目状态驱动胶片位置
和相机运动。

镜像完整保留：

- Next.js 响应中的项目数据；
- 真实 3D 胶片几何与 shader 材质；
- 前后项目按钮行为；
- 11 个项目状态；
- Mux 播放与 poster 请求；
- 项目详情路由导航。

### 5. 办公室与翻页转场

办公室场景重复使用工作站/隔间几何，形成大面积透视网格。进入 About 时使用场景层级
与弯曲纸张表面，符合生产配置中的 `overlay` / `below` 转场语法。

模型、纹理、相机变换和转场计算全部来自上游；`main` 不再使用 CSS 替身。

### 6. About、星形揭示、金领带与联系页

后半段将 WebGPU 场景、UI 纹理、预烘焙 AVIF 动画帧、照片、人物序列和语义 DOM
混合在一起。镜像转发真实的 `/textures/*`、`/videos/*`、`/fonts/*` 和
Next.js 路由请求，因此完整保留：

- 企业年报印刷布局；
- 客户图形与人物；
- 波纹干涉转场；
- 星形揭示；
- 金色领带反射及人物动画；
- 电话场景；
- 最终联系页与无障碍声明。

### 7. 响应式行为

上游运行时自行渲染桌面/移动端控制与场景取景。镜像没有注入自定义断点 CSS，因此
视口检测、纹理选择、移动端菜单、renderer pixel ratio 以及 touch/wheel 输入逻辑
都与当前生产站一致。

## 分支说明

| 分支                    | 用途                                       |
| ----------------------- | ------------------------------------------ |
| `main`                  | 部署到 Cloudflare Pages 的实时反向代理镜像 |
| `clean-room-recreation` | 使用原创生成素材制作的独立近似复刻         |

上一版的实现、README、生成媒体、截图与完整历史均保留在独立分支，可随时恢复。

## 本地运行

安装依赖：

```bash
npm install
```

启动 Pages Worker 镜像：

```bash
npm run dev
```

本地地址为 `http://127.0.0.1:4180`。

这里不能使用普通 `vite preview`：它只会显示 fallback 页面，不会执行 Pages
Worker。

## 部署

```bash
npm run deploy
```

`wrangler.jsonc` 将 Pages 输出目录指向 `dist`；构建时 Vite 会把
`_worker.js` 复制成高级模式入口。

## 验证结果

- 本地镜像 `/`：`200`
- 根 HTML 解压后：与上游逐字节一致
- 原站 Next.js chunk：`200`
- 原站字体、纹理、AVIF 帧、图标及模型请求：`200`
- 浏览器标题：`Shader Development Studio`
- Canvas 数量：`1`
- Hero 标题：与上游完全一致
- Hero 和项目胶片截图：与原站一致
- 加载及滚动后的 Console error：`0`

早期逆向工作留下的证据保存在 [`RECON`](./RECON)。

### 2026-07-28 复核

- 原站首页发现 14 个生产 JavaScript chunks；
- `scene-config`、`render-pipeline`、`section-navigation` 三个目标均重新定位成功；
- 三个当前 chunk 的 URL 与 SHA-256 均和 `docs/effects/source-map.json` 一致；
- 原站与 Pages 首页解压后的 SHA-256 均为
  `e2c9762e7df7e764c7fadd080142bdee9ac70ed32c16fc1d1d0e33c456de6697`；
- Pages 返回 `x-mirror-source: https://www.shader.se` 和镜像权利提示；
- `/__mirror-health` 返回 `ok: true`、`mode: live-reverse-proxy`；
- Worker、提取脚本和四份语义化时间代码均通过 `node --check`；
- `npm run build` 由 Vite 7.3.6 成功完成。

## 可用性与隐私说明

- 这是**实时镜像**，不是离线归档。`www.shader.se` 停机或更新时，镜像会同步受到
  影响。
- 正常访问会让 Worker 请求 `www.shader.se` 的公开资产，并运行上游当前使用的
  第三方服务请求。
- 镜像不会把访客 cookie、客户端 IP 或 Cloudflare 转发头发送给上游。
- 镜像仍可能转发未列入删除清单的其他请求头；不要把“删除 cookie”理解成完整的认证
  隔离。
- 镜像不会额外添加分析、存储、登录、表单或追踪逻辑。

## 许可证

仓库中自主编写的镜像 Worker 与 fallback 页面采用 MIT License。该许可证不覆盖
从 `www.shader.se` 流式转发的内容；上游权利和条款保持不变。
