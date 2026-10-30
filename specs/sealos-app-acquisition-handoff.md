# 国内官网与 App 的 Cookie 关联

## 最小链路

sealos.run 匿名访问 → 根据已配置的国内 Rybbit 启用访客关联 → 写入共享 Cookie → 直接下载安装包 → App 在系统浏览器打开现有控制台 OAuth → 控制台将访客与经过认证的 userUid 关联 → Web / App 使用现有 Rybbit 目的地。

官网只负责访客标识、来源和下载事件。控制台发送 web_visitor_linked，App 发送 visitor_linked；登录后的账号标识均为同一个全局 userUid。App 的 installation_id 独立生成，不能用官网访客 ID 替代。Cookie 仅是浏览器观察到的营销上下文，不能用于认证、奖励或账单。

## 官网契约

- 国内官网在两个 Rybbit 构建参数均已配置、且当前页面为 HTTPS sealos.run / www.sealos.run 标准端口时，默认启用本功能的统计关联。此时有效 analytics_storage=granted，生成或复用随机 UUID visitor_id，并持久化首次来源；不必等待 SDK 加载完成或手动发出许可事件。这个国内部署策略不保存为用户同意记录，不新增提示或复选框，也不授予广告权限。已有拒绝和新收到的明确许可更新（包括 unspecified）优先于部署默认；缺少 Rybbit 配置时仍不自动关联。海外不使用这条默认策略。
- sealos_acquisition_v1 是无 padding 的 UTF-8 JSON Base64URL。只写 version=1、realm=china、visitor_id、四项 consent，以及可选 source；不写账号 token、userUid、平台别名或 sea_attr。旧 Cookie 带有多余字段时，只复用有效访客和来源，不重新保存额外字段。
- 只允许 HTTPS sealos.run / www.sealos.run 写入：Domain=sealos.run; Path=/; Secure; SameSite=Lax; Max-Age=2592000。控制台和租户子域不写这个 Cookie。解码内容最多 1800 UTF-8 字节；超出预算时省略 source，保留核心标识和同意状态。
- 有效共享 Cookie 优先决定当前访客和首触；仅当本地 visitor_id 相同才允许用本地首触补全。没有有效共享 Cookie 时仍可复用本地访客；这不是跨源撤回同步。
- source 只保留首触的 source、medium、campaign 三个标签，各最多 100 字符，拒绝 email、电话式长数字、控制字符和 URL。referrer 仅可瞬时解析 hostname 推导 source；Cookie 和本功能 localStorage 均不保存落地 URL、referrer URL 或 timestamp。旧 Cookie/首触副本重写时也只抽取三个标签。来源缺失时仍可关联，来源统计显示 direct 或未知。
- 官网通过已有 Rybbit 发送 acquisition_visit / download_click，带 visitor_id、surface=website、source。identify(visitor_id) 只在有效统计关联启用后调用；SDK 迟到时最多排队 32 个事件；共享访客变化时丢弃旧旅程队列；实际 flush 发送处只发送 visitor_id 与当前有效访客相同的项，覆盖 SDK 尚未发出 ready、用户直接点击下载的路径，避免在 identify 新访客后发送旧访客事件。Observer 同时负责及时更新 Cookie，SDK-ready 事件负责恢复发送。
- 拒绝或撤回会清理本功能新增的访客/来源 localStorage、共享 Cookie、排队事件及 Observer 设置的 Rybbit 身份。同源跨标签撤回优先于历史 grant，访客/来源写入不会触发 storage 循环。订阅真实 dataLayer consent/update 和 sealos_consent_update 入队，微任务合并后通知 Observer，无须另发 DOM 事件；保留原 push 的 this、参数、返回值，以及迟到 GTM 的处理函数，卸载时停止通知。不明许可且未启用国内策略时，不删除另一个官方源留下的有效 Cookie。

## 消融依据与边界

| 项目 | 移除后的影响 | 保留结论 |
| --- | --- | --- |
| 中转页、issue/redeem 请求、归因 deep link | 原安装包直链与 Cookie 独立工作 | 官网不实现这些路径 |
| Cookie | 官网与控制台无法交接访客，普通下载和登录仍可工作 | 关联必需 |
| visitor_id | 后端拒绝归因元数据，避免猜测匹配 | 关联必需 |
| source | 仍能将访客关联到账号，但缺少营销来源 | 可选，保留最小首触信息 |
| landing_page、referrer、timestamp | 仅 helper 自校验/复用，生产事件无独立消费；删除后首触标签与关联不变 | 不采集、不保存 |
| 平台别名、sea_attr | 不影响国内访客与账号关联；当前国内消费链路未使用 | 国内不采集、不存储 |
| 独立关联提示及复选框 | 国内使用已配置 Rybbit 的部署策略，明确拒绝仍优先 | 删除，不授予广告权限，也不伪造用户同意记录 |
| Observer / SDK-ready | 分别失去 Cookie/事件生产者、迟到 SDK 的事件发送 | 保留 |

完整匹配需要国内统计关联有效启用、同一浏览器 profile、Cookie 留存，以及配套控制台/App 接入；不同浏览器、清 Cookie 或拒绝时归因未知，不做指纹或推测，不阻塞下载或登录。root/www 的 localStorage 各自独立，现有撤回同步仅保证同源标签；跨源或跨设备需要共享 consent 管理。匿名历史不承诺自动回写到账号。

官网无需新数据库、登录网页、归因服务或额外安装按钮。国内清理不改变海外现有 sea_attr URL 协议。生产验收仍需实际官网 → 安装包 → 系统浏览器 OAuth → App 的双端事件与 Rybbit 报表核对，单元测试或 Cookie 存在不代表完整转化链已验收。

## 发布配置前提

国内官网构建需核对 NEXT_PUBLIC_RYBBIT_HOST / NEXT_PUBLIC_RYBBIT_SITE_ID；Docker builder 通过同名 ARG/ENV 传入，没有固定默认值，docker run -e 不能覆盖已经内联的浏览器值；任一缺失时，现有 RybbitAnalytics 不加载 SDK，也不会自动初始化关联。外部明确 granted 的兼容路径仍可写 Cookie，但没有 SDK 就不能发送官网 Rybbit 事件。

App 的 SEALOS_PRODUCT_ANALYTICS_UPSTREAM_BASE_URL / SEALOS_PRODUCT_ANALYTICS_SITE_ID，以及控制台既有 layoutConfig.rybbitHost / layoutConfig.rybbitSiteId，必须与官网核对为预期的同一 Rybbit 实例和同一 siteId，才能在同一统计目的地核对访客与账号。仅填写变量不代表生产事件已送达；构建/部署后还需检查实际加载配置和报告。本规格不记录当前部署值，也不修改线上变量或部署。

## 验证入口

node scripts/test-acquisition-handoff.mjs 覆盖同意/撤回、跨标签、域名与大小边界、旧 Cookie 兼容、实际 Observer 和下载直链消融。pnpm typecheck、pnpm lint:check、pnpm format:check、pnpm build 覆盖仓库集成。跨仓核对必须使用真实 writer 输出和现有控制台 parser，确认可选字段缺失不会阻断核心关联；不把一次性测试快照写进仓库。
