import { LandingOutlineButton } from '@/libs/components/LandingOutlineButton';
import { showcaseLinks } from '../utils/showcase.config';
import styles from './HeroSection.module.css';

const steps = [
	{
		title: '用 Sealos Desktop 把项目上线',
		detail: '拿到一个任何人都能打开的线上链接。',
	},
	{
		title: '发帖晒出制作过程',
		detail: '在小红书、B站、公众号、知乎、抖音、视频号或 X 发帖，露出桌面端界面，带上 #Sealos #SealosDesktop #VibeCoding。',
	},
	{
		title: '提交作品，领现金',
		detail: '首作保底 ¥20，再按阅读量叠加，最高再领 ¥1,888。',
	},
];

export function HeroSection() {
	return (
		<section className='relative overflow-hidden py-12 sm:py-20'>
			<div
				className={styles['grid']}
				aria-hidden='true'
			/>
			<div className='relative container mx-auto grid items-center gap-8 px-6 lg:grid-cols-5 lg:gap-12'>
				<div className='lg:col-span-3'>
					<p className='text-muted-foreground'>Vibe Coding 造物主计划 · 第一季</p>
					<h1 className='mt-4 text-4xl leading-tight font-semibold sm:text-5xl'>
						晒出你上线的作品
						<br />
						最高领 <span className='text-brand'>¥1,908 现金</span>
					</h1>
					<p className='text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed'>
						用 Sealos Desktop 把项目真正部署上线，发帖晒出制作过程，就能按阅读量领现金。活动截止 12 月 31
						日，奖金 1 月统一发放。
					</p>
					<div className='mt-8 flex flex-wrap gap-4'>
						<LandingOutlineButton
							href={showcaseLinks.download}
							size='lg'
						>
							下载 Sealos Desktop
						</LandingOutlineButton>
						{showcaseLinks.submitForm && (
							<LandingOutlineButton
								href={showcaseLinks.submitForm}
								size='lg'
								target='_blank'
								rel='noreferrer'
							>
								提交作品
							</LandingOutlineButton>
						)}
						<LandingOutlineButton
							href='#bounty'
							size='lg'
							showIcon={false}
						>
							查看奖励规则
						</LandingOutlineButton>
					</div>
				</div>

				<div className='bg-card rounded-2xl border p-6 lg:col-span-2'>
					<h2 className='text-lg font-medium'>三步参加</h2>
					<ol className='mt-5 space-y-5'>
						{steps.map((step, index) => (
							<li
								key={step.title}
								className='flex gap-4'
							>
								<span className='text-muted-foreground tabular-nums'>0{index + 1}</span>
								<div>
									<p className='font-medium'>{step.title}</p>
									<p className='text-muted-foreground mt-1 text-sm leading-relaxed'>{step.detail}</p>
								</div>
							</li>
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}
