# TapTap 首发资料

项目为《早高峰早餐摊》，应用 ID `1062511`。本目录保存首发提审使用的 H5 包体与商店素材。当前线上审核和展示状态以 TapTap 开发者后台为准。

## H5 包体

- [breakfast-rush-online-ranks.zip](package/breakfast-rush-online-ranks.zip)，TapTap H5 版本 ID `498023`
- ZIP 入口为 `breakfast-rush/index.html`，ZIP 内的入口比源码多一项 `<meta name="breakfast-host" content="taptap">`，用来识别 TapTap 容器
- SHA-256：`b37c0dc5fa5bcf0750aadcc8e31c53409676206ccad45f9ee416acac69e3ed3f`

后续打包时，在临时的 `breakfast-rush/` 目录中复制运行文件（HTML、CSS、JavaScript 和 `assets/`），在入口的 `<head>` 里加上前述平台标记。在临时目录的上一级将 `breakfast-rush/` 压缩成 ZIP，再上传到 TapTap H5 版本管理。先用手机自测，确认后绑定到 TapTap 发布草稿。

## 商店资料

| 文件 | 用途 |
| --- | --- |
| [description.txt](store/description.txt) | 商店简介 |
| [icon.png](store/icon.png) | 游戏图标，512 × 512 |
| [banner-1920x1080.jpg](store/banner-1920x1080.jpg) | 横版宣传图，仅显示游戏名，1920 × 1080 |
| [square-promo.jpg](store/square-promo.jpg) | 方形宣传图，1440 × 1440 |
| [01-service.png](store/01-service.png)、[02-prep.png](store/02-prep.png)、[03-staff.png](store/03-staff.png)、[04-decor.png](store/04-decor.png) | 首发截图，依次为营业、食材、排班、布置 |
| [05-receipt.png](store/05-receipt.png) | 补充截图，收摊账单 |
| [gameplay-portrait.mp4](store/gameplay-portrait.mp4) | 竖屏实机，540 × 1168，约 18 秒 |
| [trailer-landscape.mp4](store/trailer-landscape.mp4) | 横版宣传片，1920 × 1080，约 19 秒 |

商店视频分别填入「实机录屏」与「宣传片」。上线前从最新绑定版本生成自测二维码，分别检查广告奖励和全国榜。
