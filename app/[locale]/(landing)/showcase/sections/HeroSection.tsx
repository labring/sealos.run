import Image from 'next/image';
import { LandingOutlineButton } from '@/libs/components/LandingOutlineButton';
import { Button } from '@/libs/components/ui/button';
import { Link } from '@/libs/i18n/navigation';
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
						<Link
							href='#bounty'
							className={css['rules']}
						>
							查看奖励规则
						</Link>
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
						用 Sealos Desktop 把项目真正部署上线，发帖晒出制作过程，就能按阅读量领现金。 活动截止 12 月 31
						日，奖金 1 月统一发放。
					</p>
					<div className={css['actions']}>
						<LandingOutlineButton href={showcaseLinks.download}>下载 Sealos Desktop</LandingOutlineButton>
						{/* TODO(待确认): 飞书报名表单地址确定后，把占位按钮接成真实报名链接。 */}
						<Button
							type='button'
							variant='outline'
							className='border-foreground h-11 bg-transparent px-5 shadow-none'
							disabled
						>
							立即报名
						</Button>
					</div>
				</div>
				<ParticipationSteps />
			</div>
		</section>
	);
}
