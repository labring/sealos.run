import Image from 'next/image';
import type React from 'react';
import {
	CheckIcon,
	ChevronDownIcon,
	CubesIcon,
	FramedClockIcon,
	FramedPrivateIcon,
	MonitorIcon,
	Number01Icon,
	Number02Icon,
	Number03Icon,
	Number04Icon,
	Number05Icon,
	PricetagIcon,
	ToolIcon,
	TrendIcon,
	TrendingDownIcon,
} from '@/assets/icons';
import sealosLogo from '@/assets/sealos.svg';
import { Icon } from '@/libs/components/ui/icon';
import { getDesktopDownloads } from '@/libs/utils/desktop-downloads';
import { cn } from '@/libs/utils/styling';
import { downloadAssets, valueBadge, valueCardPattern } from '../assets';
import { DownloadButtons } from '../components/DownloadButtons';
import { WorkflowDiagram } from '../components/WorkflowDiagram';
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

const featureIcons = [Number01Icon, Number02Icon, Number03Icon, Number04Icon, Number05Icon];

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
						AI 写完代码如何上线？<strong>Sealos Agent</strong> 来帮你
						<br className={styles['desktopBreak']} />用<strong>自然语言</strong>描述你的需求，
						<strong>代码上线、依赖创建、持续运维</strong>，全部交给 Agent。
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

			<section className={cn(styles['section'], styles['whiteSection'], styles['scenariosSection'])}>
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
							来用 Sealos Desktop <strong>自然语言描述，直接上线，以及后续的一切运维。</strong> Agent
							会自动创建项目依赖的所有资源—模型的 API
							Key、数据库、缓存、对象存储，帮你一键上线、持续运维。
						</p>
					</div>
				</div>
			</section>

			<section className={cn(styles['section'], styles['container'])}>
				<SectionTitle title='为什么是桌面端？'>
					环境安装交给 AI，利用本地 Agent 与云端协作，无缝对接本地代码，以及其他 Agent 开发的代码。
				</SectionTitle>
				<div className={cn(styles['threeColumns'], styles['desktopColumns'])}>
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
							<div
								className={styles['featureConnector']}
								aria-hidden='true'
							>
								<span className={styles['featureDash']} />
								<span className={styles['featureMarkers']}>
									{[0, 1, 2].map((marker) => (
										<Icon
											key={marker}
											src={valueBadge}
										/>
									))}
								</span>
							</div>
							<div className={styles['featureCopy']}>
								<div className={styles['featureHeading']}>
									<h3>{item.title}</h3>
									<Icon
										src={featureIcons[index] ?? Number01Icon}
										className='size-6'
										aria-hidden
									/>
								</div>
								<p>{item.description}</p>
							</div>
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

			<section className={cn(styles['section'], styles['whiteSection'], styles['workflowSection'])}>
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
							<WorkflowDiagram
								kind={item.image}
								label={item.alt}
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
				<div className={styles['costCards']}>
					<article className={styles['valueCard']}>
						<div className={styles['valueCardHeader']}>
							<Icon
								src={TrendIcon}
								className='size-8'
								aria-hidden
							/>
							<span className={styles['valueBadge']}>
								<Icon
									src={valueBadge}
									className='size-2.5'
									aria-hidden
								/>
								资源成本省 50%+
							</span>
						</div>
						<div className={styles['valueCardCopy']}>
							<h3>资源成本</h3>
							<p>
								以 4 核 16G 为例：某云厂商 A 约 ¥720/月，某云厂商 B 包月 ¥487/月，而 Sealos
								按量计费仅仅需要 <strong>¥262/月</strong>，按量计费，比云厂商包月还便宜约 50%。
							</p>
						</div>
						<div className={styles['priceComparison']}>
							{[
								{ label: '某云厂商 A · 包月', price: 720 },
								{ label: '某云厂商 B · 包月', price: 487 },
								{ label: 'Sealos · 按量计费', price: 262 },
							].map(({ label, price }) => (
								<div key={label}>
									<div className={styles['priceLabel']}>
										<span>{label}</span>
										<span>¥{price} / 月</span>
									</div>
									<div
										className={styles['priceTrack']}
										aria-hidden='true'
									>
										<span style={{ width: `${(price / 720) * 100}%` }} />
									</div>
								</div>
							))}
						</div>
						<p>完全容器架构，可选更小规格并设置弹性伸缩，成本再降一半。</p>
						<Icon
							src={valueCardPattern}
							className={styles['valueCardPattern']}
							aria-hidden
						/>
					</article>
					<article className={styles['valueCard']}>
						<div className={styles['valueCardHeader']}>
							<Icon
								src={PricetagIcon}
								className='size-8'
								aria-hidden
							/>
							<span className={styles['valueBadge']}>
								<Icon
									src={valueBadge}
									className='size-2.5'
									aria-hidden
								/>
								人力成本省 1~3 个岗位
							</span>
						</div>
						<div className={styles['valueCardCopy']}>
							<h3>人力成本</h3>
							<p>
								使用 Sealos 的团队<strong>无需任何运维人员</strong>，只需专注业务开发。Sealos
								的全部成员，就是你的基础设施团队。
							</p>
							<p>
								上线过程完全自动化，至少为小企业节省 <strong>1~3 名</strong>
								运维、DBA、架构师等专业岗位，对应<strong>几十万到百万级</strong>的年度支出。
							</p>
							<p>
								Sealos 本身具备横向扩展能力，业务团队即使没有专业能力，也能支撑业务高速发展所需的扩展。
							</p>
						</div>
						<Icon
							src={valueCardPattern}
							className={styles['valueCardPattern']}
							aria-hidden
						/>
					</article>
					<article className={styles['valueCard']}>
						<div className={styles['valueCardHeader']}>
							<Icon
								src={FramedClockIcon}
								className='size-8'
								aria-hidden
							/>
							<span className={styles['valueBadge']}>
								<Icon
									src={valueBadge}
									className='size-2.5'
									aria-hidden
								/>
								时间成本分钟级上线
							</span>
						</div>
						<div className={styles['valueCardCopy']}>
							<h3>时间成本</h3>
							<p>
								企业业务从源代码到上线，全程压缩到<strong>分钟级</strong>，完全自动化。
							</p>
							<p>对比传统数天、数小时的上线周期，为业务迭代赢得最宝贵的时间。</p>
						</div>
						<Icon
							src={valueCardPattern}
							className={styles['valueCardPattern']}
							aria-hidden
						/>
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
							<span className={styles['stage']}>
								<Icon
									src={valueBadge}
									aria-hidden
								/>
								{item.stage}
							</span>
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
