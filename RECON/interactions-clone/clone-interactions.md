# 上一版 clean-room 复刻交互探测

> 这是 `clean-room-recreation` 分支的历史验证记录，不代表当前 `main` 实时镜像。

- 地址：http://127.0.0.1:4173/
- 操作数量：16
- 控制台错误：0
- 网络事件：0

## 操作
| # | 类型 | 目标 | 是否变化 | 操作后地址 | 截图 |
|---:|---|---|---:|---|---|
| 1 | 滚动 | 中部 | 是 | http://127.0.0.1:4173/ | screenshots/01-scroll-middle-b04a45f075.png |
| 2 | 滚动 | 底部 | 是 | http://127.0.0.1:4173/ | screenshots/02-scroll-bottom-7297e0cbea.png |
| 3 | 悬停 | Skip to content | 否 | http://127.0.0.1:4173/ |  |
| 4 | 悬停 | CIRCUIT OFFICE | 否 | http://127.0.0.1:4173/ | screenshots/04-hover-CIRCUIT-OFFICE-0c102713c1.png |
| 5 | 悬停 | WORK | 否 | http://127.0.0.1:4173/ | screenshots/05-hover-WORK-a0ea0d6ded.png |
| 6 | 悬停 | ABOUT | 否 | http://127.0.0.1:4173/ | screenshots/06-hover-ABOUT-f50e057b68.png |
| 7 | 悬停 | CONTACT | 否 | http://127.0.0.1:4173/ | screenshots/07-hover-CONTACT-2e5ccfffe7.png |
| 8 | 悬停 | OPEN A LINE ↗ | 否 | http://127.0.0.1:4173/ | screenshots/08-hover-OPEN-A-LINE-63fa7d377a.png |
| 9 | 悬停 | GENERAL ENQUIRIES studio@example.com | 是 | http://127.0.0.1:4173/ | screenshots/09-hover-GENERAL-ENQUIRIES-studio-example.com-b902bb7921.png |
| 10 | 悬停 | SOURCE ARCHIVE Creative-Web-Refs ↗ | 是 | http://127.0.0.1:4173/ | screenshots/10-hover-SOURCE-ARCHIVE-Creative-Web-Refs-e9dff9a3af.png |
| 11 | 点击 | Skip to content | 否 | http://127.0.0.1:4173/ |  |
| 12 | 点击 | CIRCUIT OFFICE | 是 | http://127.0.0.1:4173/#home | screenshots/12-click-CIRCUIT-OFFICE-1268aa0511.png |
| 13 | 点击 | WORK | 是 | http://127.0.0.1:4173/#work | screenshots/13-click-WORK-d817b74087.png |
| 14 | 点击 | ABOUT | 是 | http://127.0.0.1:4173/#about | screenshots/14-click-ABOUT-fbc7ea9fac.png |
| 15 | 点击 | CONTACT | 是 | http://127.0.0.1:4173/#contact | screenshots/15-click-CONTACT-ccc1a4f10b.png |
| 16 | Canvas 拖动 | #scene | 否 | http://127.0.0.1:4173/ | screenshots/16-canvas-drag--scene-0826edc8e9.png |

## 结论

- 共发现 8 个可见交互候选项。
- 共发现 1 个可见 Canvas 目标。
- 16 次操作中有 8 次改变了 DOM、URL、滚动位置或可见覆盖层数量。
- 已保留 Canvas 拖动证据；简化 WebGL/Canvas 行为前应先检查相应截图。
