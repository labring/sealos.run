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

## 作品馆

`/showcase` 的作品来自飞书多维表格，点赞存放在 PostgreSQL。飞书是唯一主数据：运营在投稿表里勾选「上架」并填写展示用字段，官网定时把这些行同步到自己的库。实名、微信、奖励信息不会离开飞书。

所有配置都是**运行时**环境变量（见 `.env.example`），不是构建参数。

### 首次部署

1. 建表（可重复执行）：

   ```bash
   psql "$SHOWCASE_DATABASE_URL" -f db/showcase.sql
   ```

2. 在飞书投稿表里添加这些列，列名必须完全一致：

   | 列名 | 类型 | 说明 |
   | --- | --- | --- |
   | 上架 | 复选框 | 勾选即上架，取消即下架（票保留） |
   | 展示名 | 文本 | 必填 |
   | 简介 | 文本 | 必填 |
   | 封面 | 附件 | 必填，只取第一张，按 3:2 居中裁剪 |
   | 作者展示名 | 文本 | 选填，不填或没有这一列时用表单里的「创作者昵称 / 团队名」；头像取第一个字 |
   | 作者身份 | 文本 | 选填 |
   | 一句话 | 文本 | 选填，上线时用的那句话 |
   | 亮点 | 文本 | 选填，每行一条，写成 `标题｜说明`，最多 3 条 |
   | 排序权重 | 数字 | 选填，同票时数字大的在前 |

   线上地址读取表单已有的「项目线上体验链接」列。选填的列可以整列不建，以后再加，同步会自动读到。

3. 给飞书自建应用开通多维表格读取权限，并把应用添加为该多维表格的协作者。

4. 建一个每 5 分钟执行的定时任务：

   ```bash
   curl -fsS -X POST -H "Authorization: Bearer $SHOWCASE_SYNC_SECRET" https://<域名>/api/showcase/sync
   ```

### 同步规则

- 取消勾选「上架」：作品从官网消失，票保留，重新勾选后恢复。
- 在飞书里删除行：作品和它的票一起删除，不可恢复。
- 勾选了但必填列不全、或封面处理失败：该行保持原状，并发通知。
- 飞书返回 0 行，或一轮要下架的作品不少于 3 个且超过现有的一半：本轮中止并发通知。确认无误后加 `?force=1` 手动执行一次。
- 配置了 `SHOWCASE_ALERT_CHAT_ID`（飞书群 ID，应用机器人需在群里）时，同一个问题只在出现和恢复时各通知一次。

### 点赞

匿名，每个访客每个作品 1 票。同一 IP 每分钟最多 10 次请求，同一 IP 对同一作品最多计 5 票；库里只存 IP 的哈希。点赞只决定站内排名，不参与奖励计算。

数据库未配置或不可达时，作品馆显示「暂时打不开」，其余页面不受影响。

### 测试

```bash
SHOWCASE_TEST_DATABASE_URL=postgres://localhost/<库名> pnpm test:showcase
```

不设置该变量时，连数据库的测试会跳过。

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
