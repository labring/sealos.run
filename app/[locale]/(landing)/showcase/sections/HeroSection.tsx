import Image from 'next/image';
import { LandingOutlineButton } from '@/libs/components/LandingOutlineButton';
import { Button } from '@/libs/components/ui/button';
import { participationArrow } from '../assets';
import { ParticipationSteps } from '../components/ParticipationSteps';
import { showcaseLinks } from '../utils/showcase.config';
import css from './HeroSection.module.css';

export function HeroSection() {
	return (
		<section className={css['hero']}>
			<div
				className={css['grid']}
				aria-hidden='true'
			/>
			<div className={css['inner']}>
				<div className={css['copy']}>
					<div className={css['eyebrow']}>
						<p>Vibe Coding 造物主计划 · 第一季</p>
						<a
							href='https://mp.weixin.qq.com/s/VOM26qbm3XxJFbTWMe7WSg'
							className={css['rules']}
						>
							查看奖励规则
						</a>
					</div>
					<div className={css['heading']}>
						<h1>
							晒出你上线的作品
							<br />
							最高领 <span>¥1,908 现金</span>
						</h1>
						<Image
							src={participationArrow}
							alt=''
							className={css['arrow']}
							aria-hidden='true'
						/>
					</div>
					<p className={css['description']}>
						用 Sealos Desktop 内置 Agent 把项目真正部署上线，按要求发帖并公开保留 7 天，首次可领 ¥20
						现金；流量和互动达标再加奖，单个项目最高可领 ¥1,908。活动截止至 2026 年 12 月 31 日。快来参与！
					</p>
					<div className={css['actions']}>
						<LandingOutlineButton href={showcaseLinks.download}>下载 Sealos Desktop</LandingOutlineButton>
						<Button
							asChild
							variant='outline'
							className='border-foreground h-11 bg-transparent px-5 shadow-none'
						>
							<a
								href={showcaseLinks.applicationForm}
								target='_blank'
								rel='noopener noreferrer'
							>
								提交作品领现金
							</a>
						</Button>
					</div>
				</div>
				<ParticipationSteps />
			</div>
		</section>
	);
}
