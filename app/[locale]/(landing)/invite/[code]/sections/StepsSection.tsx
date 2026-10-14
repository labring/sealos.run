import { Number01Icon, Number02Icon, Number03Icon, Number04Icon } from '@/assets/icons';
import { Icon } from '@/libs/components/ui/icon';
import { getTranslations } from '@/libs/i18n/server';

const STEP_KEYS = [
	{ key: 'register', icon: Number01Icon },
	{ key: 'download', icon: Number02Icon },
	{ key: 'signin', icon: Number03Icon },
	{ key: 'realname', icon: Number04Icon },
] as const;

export async function StepsSection() {
	const t = await getTranslations('pages.invite.steps');

	return (
		<section className='container mx-auto flex flex-col items-center gap-10 px-6 py-12 sm:py-16'>
			<h2 className='text-2xl font-semibold sm:text-3xl'>{t('title')}</h2>
			<ol className='grid w-full max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4'>
				{STEP_KEYS.map(({ key, icon }, index) => (
					<li
						key={key}
						className='flex flex-col gap-3'
					>
						<Icon
							src={icon}
							className='text-brand size-8'
						/>
						<h3 className='flex flex-col gap-1 font-medium'>
							<span className='text-muted-foreground text-sm'>{String(index + 1).padStart(2, '0')}</span>
							{t(`items.${key}.title`)}
						</h3>
						<p className='text-muted-foreground text-sm text-pretty'>{t(`items.${key}.description`)}</p>
					</li>
				))}
			</ol>
			<p className='text-muted-foreground max-w-2xl text-center text-sm'>{t('note')}</p>
		</section>
	);
}
