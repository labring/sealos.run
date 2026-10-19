import Image from 'next/image';
import type React from 'react';
import {
	CheckIcon,
	ChevronDownIcon,
	CubesIcon,
	FramedClockIcon,
	FramedCodeIcon,
	FramedPrivateIcon,
	MonitorIcon,
	PricetagIcon,
	ToolIcon,
	TrendingDownIcon,
} from '@/assets/icons';
import sealosLogo from '@/assets/sealos.svg';
import { Icon } from '@/libs/components/ui/icon';
import { getDesktopDownloads } from '@/libs/utils/desktop-downloads';
import { cn } from '@/libs/utils/styling';
import { downloadAssets } from '../assets';
import { DownloadButtons } from '../components/DownloadButtons';
import {
	desktopBenefits,
	faqs,
	features,
	milestones,
	scenarios,
	specialistBenefits,
	values,
	workflows,
} from '../utils/download.config';
import styles from './DownloadContent.module.css';

const asset = (name: keyof typeof downloadAssets) => downloadAssets[name];

function SectionTitle({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
	return (
		<div className={styles['sectionTitle']}>
			<h2>{title}</h2>
			{children && <p>{children}</p>}
		</div>
	);
}

export async function DownloadContent() {
	const downloads = await getDesktopDownloads();
	const valueIcons = [CheckIcon, TrendingDownIcon, PricetagIcon, FramedClockIcon, FramedPrivateIcon];
	const specialistIcons = [CubesIcon, ToolIcon, MonitorIcon];
	return (
		<div className={styles['page']}>
			<section
				className={styles['hero']}
				id='download'
				aria-labelledby='download-title'
			>
				<div
					className={styles['heroGrid']}
					aria-hidden='true'
				/>
				<div className={styles['heroContent']}>
					<h1 id='download-title'>
						专注于你的代码上线
						<br />
						与后续运维的专用 Agent
					</h1>
					<p>
						AI 写完代码如何上线？Sealos Agent 来帮你
						<br className={styles['desktopBreak']} />
						用自然语言描述你的需求，代码上线、依赖创建、持续运维，全部交给 Agent。
					</p>
					<DownloadButtons downloads={downloads} />
				</div>
				<Image
					className={styles['heroPreview']}
					src={asset('desktop-preview')}
					alt='Sealos Desktop 项目首页，可从本地目录、GitHub 仓库、应用模板或镜像创建项目'
					width={1100}
					height={695}
					priority
				/>
			</section>

			<section className={cn(styles['section'], styles['whiteSection'])}>
				<SectionTitle
					title={
						<>
							这些时刻
							<br />
							你需要 Sealos Desktop
						</>
					}
				/>
				<div className={styles['scenarios']}>
					<Image
						src={sealosLogo}
						alt=''
						className={styles['puzzleLogo']}
						width={460}
						height={460}
						aria-hidden='true'
					/>
					{scenarios.map((text, index) => (
						<div
							className={styles['scenario']}
							key={text}
						>
							<span className={styles['scenarioNumber']}>0{index + 1}</span>
							<p>{text}</p>
						</div>
					))}
					<div className={cn(styles['scenario'], styles['scenarioSummary'])}>
						<p>
							来用 Sealos Desktop
							<br />
							自然语言描述，直接上线，以及后续的一切运维。
						</p>
						<p>
							Agent 会自动创建项目依赖的所有资源——模型的 API
							Key、数据库、缓存、对象存储，帮你一键上线、持续运维。
						</p>
					</div>
				</div>
			</section>

			<section className={cn(styles['section'], styles['container'])}>
				<SectionTitle title='为什么是桌面端？'>
					环境安装交给 AI，利用本地 Agent 与云端协作，无缝对接本地代码，以及其他 Agent 开发的代码。
				</SectionTitle>
				<div className={styles['threeColumns']}>
					{desktopBenefits.map((item) => (
						<article
							className={styles['desktopBenefit']}
							key={item.title}
						>
							<Image
								src={asset(item.image)}
								alt=''
								loading='lazy'
								width={406}
								height={234}
							/>
							<h3>{item.title}</h3>
							<p>{item.description}</p>
						</article>
					))}
				</div>
			</section>

			<section
				className={cn(styles['section'], styles['whiteSection'])}
				id='features'
			>
				<SectionTitle title='以 Agent 为中心，重新定义智能云'>
					以往需要复杂产品功能才能实现的逻辑，现在都收口到自然语言。Sealos 又变得更简单了。
				</SectionTitle>
				<div className={styles['featureTimeline']}>
					{features.map((item, index) => (
						<article
							className={styles['feature']}
							key={item.title}
							id={item.image === 'marketplace' ? 'marketplace' : undefined}
						>
							<span
								className={styles['featureIndex']}
								aria-hidden='true'
							>
								0{index + 1}
							</span>
							<h3>{item.title}</h3>
							<p>{item.description}</p>
							<Image
								src={asset(item.image)}
								alt={`${item.title}功能界面`}
								width={510}
								height={287}
								loading='lazy'
							/>
						</article>
					))}
				</div>
			</section>

			<section className={cn(styles['section'], styles['container'])}>
				<SectionTitle title='为什么不直接用通用 Agent？'>
					Codex、Claude Code、千问办公、豆包工作，它们是优秀的通用 Agent，但 Sealos Desktop 做的是另一件事。
				</SectionTitle>
				<div className={styles['threeColumns']}>
					{specialistBenefits.map((item, index) => {
						const icon = specialistIcons[index] ?? ToolIcon;
						return (
							<article
								className={styles['specialist']}
								key={item.title}
							>
								<Icon
									src={icon}
									className='size-8'
									aria-hidden
								/>
								<h3>{item.title}</h3>
								<p>{item.description}</p>
							</article>
						);
					})}
				</div>
			</section>

			<section className={cn(styles['section'], styles['whiteSection'])}>
				<SectionTitle title='从源代码到线上，只需一句话' />
				<div className={styles['workflows']}>
					{workflows.map((item, index) => (
						<article
							className={styles['workflow']}
							key={item.title}
						>
							<div className={styles['workflowText']}>
								<h3>{item.title}</h3>
								<p>{item.description}</p>
								{'detail' in item && <p>{item.detail}</p>}
								{index === 0 && <DownloadButtons downloads={downloads} />}
							</div>
							<Image
								src={asset(item.image)}
								alt={item.alt}
								width={809}
								height={514}
								loading='lazy'
							/>
						</article>
					))}
				</div>
			</section>

			<section
				className={cn(styles['section'], styles['container'])}
				id='value'
			>
				<SectionTitle title='Sealos 的整体价值'>
					把复杂的事情变简单，业务全生命周期，几乎无需人为干预。
				</SectionTitle>
				<div className={styles['valueStrip']}>
					{values.map(([title, description], index) => {
						const icon = valueIcons[index] ?? CheckIcon;
						return (
							<article key={title}>
								<Icon
									src={icon}
									className='size-8'
									aria-hidden
								/>
								<h3>{title}</h3>
								<p>{description}</p>
							</article>
						);
					})}
				</div>
				<div className={styles['threeColumns']}>
					<article className={styles['valueCard']}>
						<span className={styles['valueBadge']}>资源成本省 50%+</span>
						<Icon
							src={TrendingDownIcon}
							className='size-8'
							aria-hidden
						/>
						<h3>资源成本</h3>
						<p>以 4 核 16G 为例，按量计费，比云厂商包月还便宜约 50%。</p>
						<div className={styles['priceComparison']}>
							<div>
								<span>某云厂商 A · 包月</span>
								<strong>¥720 / 月</strong>
							</div>
							<div>
								<span>某云厂商 B · 包月</span>
								<strong>¥487 / 月</strong>
							</div>
							<div>
								<span>Sealos · 按量计费</span>
								<strong>¥262 / 月</strong>
							</div>
						</div>
						<p>完全容器架构，可选更小规格并设置弹性伸缩，成本再降一半。</p>
					</article>
					<article className={styles['valueCard']}>
						<span className={styles['valueBadge']}>人力成本省 1~3 个岗位</span>
						<Icon
							src={FramedCodeIcon}
							className='size-8'
							aria-hidden
						/>
						<h3>人力成本</h3>
						<p>把基础设施交给 Sealos，把精力留给业务。</p>
						<p>
							从项目依赖、构建发布，到资源管理与持续运维，Agent
							连接本地工具和云端能力，帮你完成上线过程中的工作。
						</p>
						<p>Sealos 团队是你的基础设施团队。</p>
					</article>
					<article className={styles['valueCard']}>
						<span className={styles['valueBadge']}>时间成本分钟级上线</span>
						<Icon
							src={FramedClockIcon}
							className='size-8'
							aria-hidden
						/>
						<h3>时间成本</h3>
						<p>从源代码到线上，只需一句话。</p>
						<p>
							告别来回切换工具、手动配置依赖与排查环境。用自然语言描述需求，让 Agent
							分析项目、创建依赖并完成部署。
						</p>
						<p>你专注业务，Agent 负责上线与运维。</p>
					</article>
				</div>
			</section>

			<section
				className={cn(styles['section'], styles['whiteSection'])}
				id='story'
			>
				<SectionTitle title='八年，只为拼上最后一块拼图'>
					把复杂的事情变简单，业务全生命周期，几乎无需人为干预。
				</SectionTitle>
				<ol className={styles['story']}>
					{milestones.map((item) => (
						<li key={item.stage}>
							<span className={styles['stage']}>{item.stage}</span>
							<div>
								<h3>{item.title}</h3>
								<p>{item.description}</p>
							</div>
						</li>
					))}
				</ol>
			</section>

			<section className={styles['finalCta']}>
				<div
					className={styles['ctaBackdrop']}
					style={{ backgroundImage: `url("${asset('app-preview').src}")` }}
					aria-hidden
				/>
				<SectionTitle title='你的下一个业务，一句话上线'>
					下载 Sealos Desktop，让 Agent 负责上线与运维，你专注业务本身。
				</SectionTitle>
				<DownloadButtons downloads={downloads} />
			</section>

			<section className={cn(styles['section'], styles['container'], styles['faq'])}>
				<SectionTitle title='常见 FAQ' />
				<div className={styles['faqList']}>
					{faqs.map(([question, answer], index) => (
						<details
							key={question}
							open={index === 0}
						>
							<summary>
								<span className={styles['faqNumber']}>0{index + 1}</span>
								<span>{question}</span>
								<Icon
									src={ChevronDownIcon}
									className='size-5'
									aria-hidden
								/>
							</summary>
							<p>{answer}</p>
						</details>
					))}
				</div>
			</section>
		</div>
	);
}
