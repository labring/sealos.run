# 国内官网与 App 的 Cookie 关联

## 最小链路

sealos.run 匿名访问 → 用户同意分析 → 写入共享 Cookie → 直接下载安装包 → App 在系统浏览器打开现有控制台 OAuth → 控制台将访客与经过认证的 userUid 关联 → Web / App 使用现有 Rybbit 目的地。

官网只负责访客标识、来源和下载事件。控制台发送 web_visitor_linked，App 发送 visitor_linked；登录后的账号标识均为同一个全局 userUid。App 的 installation_id 独立生成，不能用官网访客 ID 替代。Cookie 仅是浏览器观察到的营销上下文，不能用于认证、奖励或账单。

## 官网契约

- analytics_storage 默认为 unspecified。只有明确 granted 才生成或复用随机 UUID visitor_id，并持久化首次同意后的 source。现有下载页和邀请页的 checkbox 只改变分析权限，不授予广告权限。
- sealos_acquisition_v1 是无 padding 的 UTF-8 JSON Base64URL。只写 version=1、realm=china、visitor_id、四项 consent，以及可选 source；不写账号 token、userUid、平台别名或 sea_attr。旧 Cookie 带有多余字段时，只复用有效访客和来源，不重新保存额外字段。
- 只允许 HTTPS sealos.run / www.sealos.run 写入：Domain=sealos.run; Path=/; Secure; SameSite=Lax; Max-Age=2592000。控制台和租户子域不写这个 Cookie。解码内容最多 1800 UTF-8 字节；超出预算时省略 source，保留核心标识和同意状态。
- 有效共享 Cookie 优先决定当前访客和首触；仅当本地 visitor_id 相同才允许用本地首触补全。没有有效共享 Cookie 时仍可复用本地访客；这不是跨源撤回同步。
- source 只保留首触的 source、medium、campaign 三个标签，各最多 100 字符，拒绝 email、电话式长数字、控制字符和 URL。referrer 仅可瞬时解析 hostname 推导 source；Cookie 和本功能 localStorage 均不保存落地 URL、referrer URL 或 timestamp。旧 Cookie/首触副本重写时也只抽取三个标签。来源缺失时仍可关联，来源统计显示 direct 或未知。
- 官网通过已有 Rybbit 发送 acquisition_visit / download_click，带 visitor_id、surface=website、source。identify(visitor_id) 只在同意后调用；SDK 迟到时最多排队 32 个事件；共享访客变化时丢弃旧旅程队列，避免在 identify 新访客后发送旧访客事件。Observer 同时负责及时更新 Cookie，SDK-ready 事件负责恢复发送。
- 拒绝或撤回会清理本功能新增的访客/来源 localStorage、共享 Cookie、排队事件及 Observer 设置的 Rybbit 身份。同源跨标签撤回优先于历史 grant，访客/来源写入不会触发 storage 循环。首次打开 www 但尚未选择时，不删除另一个官方源留下的有效 Cookie。

## 消融依据与边界

| 项目 | 移除后的影响 | 保留结论 |
| --- | --- | --- |
| 中转页、issue/redeem 请求、归因 deep link | 原安装包直链与 Cookie 独立工作 | 官网不实现这些路径 |
| Cookie | 官网与控制台无法交接访客，普通下载和登录仍可工作 | 关联必需 |
| visitor_id | 后端拒绝归因元数据，避免猜测匹配 | 关联必需 |
| source | 仍能将访客关联到账号，但缺少营销来源 | 可选，保留最小首触信息 |
| landing_page、referrer、timestamp | 仅 helper 自校验/复用，生产事件无独立消费；删除后首触标签与关联不变 | 不采集、不保存 |
| 平台别名、sea_attr | 不影响国内访客与账号关联；当前国内消费链路未使用 | 国内不采集、不存储 |
| consent checkbox / Observer / SDK-ready | 分别失去同意入口、Cookie/事件生产者、迟到 SDK 的事件发送 | 保留 |

完整匹配需要同一浏览器 profile、Cookie 留存、用户同意，以及配套控制台/App 接入；不同浏览器、清 Cookie 或拒绝时归因未知，不做指纹或推测，不阻塞下载或登录。root/www 的 localStorage 各自独立，现有撤回同步仅保证同源标签；跨源或跨设备需要共享 consent 管理。匿名历史不承诺自动回写到账号。

官网无需新数据库、登录网页、归因服务或额外安装按钮。国内清理不改变海外现有 sea_attr URL 协议。生产验收仍需实际官网 → 安装包 → 系统浏览器 OAuth → App 的双端事件与 Rybbit 报表核对，单元测试或 Cookie 存在不代表完整转化链已验收。

## 发布配置前提

国内官网构建需核对 NEXT_PUBLIC_RYBBIT_HOST / NEXT_PUBLIC_RYBBIT_SITE_ID；Docker builder 通过同名 ARG/ENV 传入，没有固定默认值，docker run -e 不能覆盖已经内联的浏览器值；任一缺失时，现有 RybbitAnalytics 不加载 SDK，Cookie 仍可生成但官网 Rybbit 事件不能发出。

App 的 SEALOS_PRODUCT_ANALYTICS_UPSTREAM_BASE_URL / SEALOS_PRODUCT_ANALYTICS_SITE_ID，以及控制台既有 layoutConfig.rybbitHost / layoutConfig.rybbitSiteId，必须与官网核对为预期的同一 Rybbit 实例和同一 siteId，才能在同一统计目的地核对访客与账号。仅填写变量不代表生产事件已送达；构建/部署后还需检查实际加载配置和报告。本规格不记录当前部署值，也不修改线上变量或部署。

## 验证入口

node scripts/test-acquisition-handoff.mjs 覆盖同意/撤回、跨标签、域名与大小边界、旧 Cookie 兼容、实际控制组件/Observer 和下载直链消融。pnpm typecheck、pnpm lint:check、pnpm format:check、pnpm build 覆盖仓库集成。跨仓核对必须使用真实 writer 输出和现有控制台 parser，确认可选字段缺失不会阻断核心关联；不把一次性测试快照写进仓库。
