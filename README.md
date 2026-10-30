# sealos.run - 官方网站

Sealos 的官方网站，基于 Next.js 16 构建的网站项目。

## 技术栈

### UI 与样式

- **Tailwind CSS** - 原子化 CSS 框架
- **shadcn/ui** - 基于 Radix UI 的组件库
- **Motion** - 动画库

### 内容与国际化

- **next-intl** - 多语言支持（中文/英文）
- **Fumadocs** - 文档框架与 MDX 支持

## 开发

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 代码质量检查

```bash
pnpm lint:check
pnpm format:check
```

### 构建生产版本

```bash
pnpm build
```

## 部署

项目支持多种部署方式：

### Docker

国内官网的 Rybbit 配置在 **构建阶段**内联进浏览器代码。构建前传入两个已有变量；下面是 fish 示例，请替换为预期实例和 siteId：

```fish
set -x NEXT_PUBLIC_RYBBIT_HOST https://your-rybbit.example
set -x NEXT_PUBLIC_RYBBIT_SITE_ID your-site-id
docker build \
    --build-arg NEXT_PUBLIC_RYBBIT_HOST \
    --build-arg NEXT_PUBLIC_RYBBIT_SITE_ID \
    -t sealos-run .
docker run -p 3000:3000 sealos-run
```

本地 pnpm build 同样读取这两个环境变量。两项齐全时，国内官方 HTTPS 页面自动初始化访客关联 Cookie，下载不必等待 SDK 加载；这不是保存用户同意记录，不授予广告权限，明确拒绝仍优先。缺少任一变量时仍可正常构建，但 RybbitAnalytics 不加载，也不自动初始化访客关联。对已经构建的镜像执行 docker run -e 无法更改已打包的 NEXT_PUBLIC_* 值；调整配置后必须重新构建并发布。

发布前，将官网 NEXT_PUBLIC_RYBBIT_HOST / NEXT_PUBLIC_RYBBIT_SITE_ID，与国内 App 的 SEALOS_PRODUCT_ANALYTICS_UPSTREAM_BASE_URL / SEALOS_PRODUCT_ANALYTICS_SITE_ID、控制台既有 layoutConfig.rybbitHost / layoutConfig.rybbitSiteId 核对为预期的同一 Rybbit 实例和同一 siteId。构建通路可用不代表线上已配置或报表已收到事件；完整关联边界见 [Cookie 规格](specs/sealos-app-acquisition-handoff.md)。此处不设置默认统计目的地，海外官网/App 使用独立的 GTM/GA4 链路。
