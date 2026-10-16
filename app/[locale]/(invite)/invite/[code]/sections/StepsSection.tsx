import { getTranslations } from '@/libs/i18n/server';
import { StepDownloadIcon, StepRewardIcon, StepSigninIcon } from '../components/DesignIcons';

export async function StepsSection() {
	const t = await getTranslations('pages.invite.steps');

	const steps = [
		{ key: 'download', Icon: StepDownloadIcon },
		{ key: 'signin', Icon: StepSigninIcon },
		{ key: 'reward', Icon: StepRewardIcon },
	] as const;

	return (
		<section className='container mx-auto flex flex-col items-center gap-10 px-6 pb-20 sm:pb-28'>
			<h2 className='text-3xl font-semibold text-balance sm:text-4xl lg:text-5xl'>{t('title')}</h2>
			<div className='grid w-full max-w-6xl gap-5 md:grid-cols-3'>
				{steps.map(({ key, Icon }) => (
					<div
						key={key}
						className='bg-zinc-100 flex flex-col items-start gap-7 rounded-[20px] px-8 py-6'
					>
						<Icon className='size-8 shrink-0' />
						<div className='flex flex-col gap-2'>
							<h3 className='text-xl font-medium'>{t(`items.${key}.title`)}</h3>
							<p className='text-muted-foreground text-base leading-6 text-pretty'>
								{t(`items.${key}.description`)}
							</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
