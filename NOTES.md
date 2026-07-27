# shader-se-clone · 镜像笔记

## 当前模式

- 原站: https://www.shader.se
- 镜像: https://shader-se-clone.pages.dev
- 模式: Cloudflare Pages live reverse-proxy mirror
- 默认分支: `main`
- 前一版 clean-room 实现: `clean-room-recreation`

## 为什么改为 mirror

原站是 Next.js + Three.js WebGPU/TSL 的 L5 重前端站，关键视觉由私有
模型、纹理、Mux 视频、AVIF 动画帧和生产 shader 构成。手工重建只能接近，
不能逐帧 1:1。

`main` 不再重写这些效果，而是通过 `public/_worker.js` 将相同路径和查询参数
转发给 `www.shader.se`，把原始响应流直接交给浏览器。这样运行的是原站当前
部署代码与真实资产。

## Worker 行为

- 同路径、同查询参数代理
- 不解析或修改响应 body
- 同源 redirect 改写回 mirror 域名
- 不向上游发送浏览者 cookie、IP 转发头或 Cloudflare 边缘头
- 添加 `x-mirror-source` 和 `x-mirror-notice`
- `/__mirror-health` 为本地健康检查

## 本地运行

```bash
npm install
npm run dev
```

地址: `http://127.0.0.1:4180`

## 验证结果

- 根 HTML 解压后与原站逐字节一致
- Next.js chunk、字体、纹理、模型、图标、AVIF 帧均能经 mirror 返回
- 浏览器识别 1 个原站 Canvas
- Hero 与项目胶片滚动场景和原站一致
- 加载及滚动后 console error 为 0

## 已知边界

- 这是在线镜像，不是离线归档；上游停机或变更会同步影响镜像。
- 原站外部 Mux/Prismic/分析请求仍按其当前生产逻辑发出。
- 镜像 Worker 的 MIT 许可不覆盖上游内容；原站仍为 All Rights Reserved。
