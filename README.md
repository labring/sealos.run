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

创作者通过官网报名按钮进入[飞书表单](https://fael3z0zfze.feishu.cn/share/base/form/shrcnuNRrA8AR75un8f9dss5O6f)，运营在飞书中审核并决定上架。测试环境的官网进程内调度器会将审核通过且已上架的作品发布到对象存储的 `showcase/catalog.json`；列表、详情和作品站点地图共用这份目录，官网其他页面使用独立站点地图。PostgreSQL 保存同步状态、图片索引和账号投票。官网在运行时读取 [.env.example](.env.example) 中的作品馆配置。

### 首次部署

仅上线活动介绍与报名入口时，可以暂不配置作品数据源与投票。展示作品前需先完成以下数据源配置；仅测试环境设置 `SHOWCASE_SYNC_ENABLED=1`，正式环境保持未设置。官网服务启动约 5 分钟后执行首轮同步，之后每轮完成后 5 分钟再执行。作品目录未配置或无法读取时，`/showcase/sitemap.xml` 返回 500，公开目录可访问后需重新验证该地址。

1. 在目标库执行迁移。脚本可重复执行；所有官网实例必须连接同一数据库。`SHOWCASE_DATABASE_URL` 应直连 PostgreSQL 或使用会话池，同步锁需要在同一数据库会话中持有到发布结束。迁移保留旧匿名票，但账号投票的排名从新表开始计算。

   ```bash
   psql -v ON_ERROR_STOP=1 "$SHOWCASE_DATABASE_URL" -f db/showcase.sql
   ```

2. 指定报名表所属 Base 的「飞书导入表」有同名表单，10 个表单字段标识与报名链接一致。部署时核对 `SHOWCASE_FEISHU_BASE_TOKEN`、`SHOWCASE_FEISHU_TABLE_ID` 和列名，确认官网同步指向该 Base 和表。运营从表单资料中补齐用于公开展示的「展示名」「简介」「封面」等列，审核后将状态设为「审核通过」并勾选「上架」，作品才会公开。联系方式、实名资料、奖励信息和审核截图留在飞书。

   当前表中尚未创建「作者身份」「一句话」「亮点」「排序权重」；它们是按需添加的选填列。公开作者名直接使用表单填写的「创作者昵称 / 团队名」。

   | 列名 | 类型 | 用途 |
   | --- | --- | --- |
   | 审核状态、上架 | 单选、复选框 | 单选项须包含「待审核」「审核通过」 |
   | 展示名、简介 | 文本 | 作品名称和简介 |
   | 创作者昵称 / 团队名 | 文本 | 投稿填写的公开作者名 |
   | 项目线上体验链接 | 链接或文本 | 指向作品的 HTTP(S) 地址 |
   | 社媒平台及帖子链接 | 文本 | 创作者提供的公开分享链接 |
   | 联系微信 | 文本 | 审核联系，官网不公开 |
   | 封面 | 附件 | 运营从表单截图中整理，首张用于列表 |
   | 作者身份、一句话 | 文本 | 选填，展示作者身份与作品提示词 |
   | 亮点 | 文本 | 选填，每行一条 `标题｜说明`，最多三条 |
   | 排序权重 | 数字 | 选填，同票时权重高的在前，其后按首次上架时间和记录 ID 排序 |

3. 配置测试环境的同步开关、飞书应用、数据库和对象存储。仅测试 Deployment 设置 `SHOWCASE_SYNC_ENABLED=1`，正式环境保持未设置；同步调度器运行在官网 Node 进程中，不需要 CronJob。飞书应用需要读取字段、目标表的全部记录和公开图片。确认应用已加入目标 Base、权限已发布，并使用应用身份核对整表读取权限。读取记录返回 `99991672` 时，检查 `base:record:retrieve` 权限。行级权限隐藏的记录也会在同步时消失，可能触发作品删除。测试数据库需先执行迁移；对象存储需允许官网写入 `showcase/`，访客需能匿名读取目录及 `showcase/covers/` 图片；`SHOWCASE_S3_ENDPOINT` 应使用可信 HTTPS 地址，`SHOWCASE_S3_PUBLIC_BASE_URL` 必须明确设置为访客可访问的测试桶地址。正式环境不要配置测试桶地址；如需要读取作品目录，必须使用独立的正式存储桶。`SHOWCASE_SYNC_SECRET` 仅供手动调用同步接口使用，内部调度不依赖它。

4. 在 Sealos 授权服务注册支持 Authorization Code 和 PKCE 的客户端，并将官网 `/api/showcase/auth/callback` 的完整 HTTPS 地址加入客户端回调地址。为所有官网实例配置一致的 `SHOWCASE_AUTH_ORIGIN`、`SHOWCASE_AUTH_CLIENT_ID`、`SHOWCASE_AUTH_CALLBACK_URL` 和至少 32 字节的随机 `SHOWCASE_AUTH_SECRET`，确认授权服务及客户端已启用。更换签名密钥会使已有登录会话失效。

5. 核对反向代理：投票请求的 Origin 须与 `SHOWCASE_AUTH_CALLBACK_URL` 的 origin 一致；代理应覆盖客户端可伪造的 IP 请求头并传入可信的 `x-real-ip` 或 `x-forwarded-for`。投票请求限频为每个官网进程每 IP 每分钟 10 次，未取得 IP 时投票接口返回 503。

6. 不部署 Kubernetes CronJob。测试 Deployment 保持单副本；官网进程每轮同步完成后等待 5 分钟再执行下一轮。现有数据库 advisory lock 可以阻止同步任务同时运行，但多个副本各自调度时仍可能背靠背执行。

7. 首次发布后，通过公开地址读取 `showcase/catalog.json`，确认 `version` 为 `1`，再打开 `/showcase` 核对作品与图片。没有可展示的作品、目录尚未发布或读取失败时，作品馆区块不会显示；活动介绍和报名入口仍可访问。

### 报名、展示与投票

- 报名和奖励申请使用同一张飞书表单。当前表单要求实名资料、作品和帖子链接、审核截图，以及帖子公开满 7 天；具体要求以表单为准。作品详情提供作品地址和创作者提交的公开分享链接；官网不自动读取或统计外部平台流量。
- 投票使用 Sealos 账号，无需实名。每个账号在整个作品馆每天总共只能投一票，以北京时间自然日计算，0 点更新；不同设备和官网实例共用额度。登录返回后需再次点击投票。
- 作品获得首票后显示名次，得票最高的三件进入领奖台。数据库不可用时，已发布的作品、图集、搜索和分页仍可使用，投票与实时排名暂停；登录配置缺失时投票不可用。
- 取消上架或撤回审核会隐藏作品并保留账号票，再次上架时恢复。删除源记录会移除作品及其排名计数，但保留已投账号当天的投票额度。

### 运营与同步结果

- 上架作品缺少展示字段、字段格式或排序权重无效、公开图片处理失败时，手动接口返回 `502 failed` 并指出待修正记录；该轮不更新作品或发布目录。内部调度器在官网日志记录错误，运营修正后等待下一轮同步。
- 读取到空表会返回 `409 blocked`。可见作品一次移除至少三件且超过半数，或已下架作品一次永久删除至少三件且超过已下架作品半数，也会拦截整轮同步。`?force=1` 会绕过这些保护：空表会删除所有已同步作品和旧匿名票，并清除账号票与作品的关联；操作前须核对数据源及备份。另一轮同步持锁时返回 `409 busy`；进程内调度器跳过本轮，不排队。
- 同步按飞书附件 token 复用已上传图片。迁移公开域名或存储桶时，需迁移图片并保留已发布 URL 的访问能力。误删对象需从备份恢复到原路径。
- 数据库提交后，官网在同一把同步锁内发布目录。目录写入失败会返回 `502 failed`，下一轮按数据库状态重新发布。手动接口的 `401` 表示同步密钥不匹配，`503 unconfigured` 表示缺运行配置。内部调度器直接处理同步结果；`failed`、`blocked`、`unconfigured` 和告警投递失败会写入官网 warn/error 日志。
- 配置 `SHOWCASE_ALERT_CHAT_ID` 并把应用机器人加入目标群后，官网会通知同步异常和恢复。成功送达后才记录状态，同一问题持续存在时不重复通知，投递失败会在后续同步重试。

### 测试

```bash
SHOWCASE_TEST_DATABASE_URL=postgres://localhost/<独立测试库名> pnpm test:showcase
```

不设置该变量时，数据库测试会跳过。不要将测试连接指向生产数据库。

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
