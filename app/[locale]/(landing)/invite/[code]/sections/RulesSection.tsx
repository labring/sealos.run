import { CheckIcon } from '@/assets/icons';
import { Icon } from '@/libs/components/ui/icon';
import { getTranslations } from '@/libs/i18n/server';

export async function RulesSection() {
	const t = await getTranslations('pages.invite.rules');
	const items = t.raw('items') as string[];

	return (
		<section className='container mx-auto flex flex-col items-center gap-8 px-6 py-16'>
			<h2 className='text-2xl font-semibold sm:text-3xl'>{t('title')}</h2>
			<ul className='grid w-full max-w-3xl gap-3'>
				{items.map((item) => (
					<li
						key={item}
						className='flex items-start gap-3'
					>
						<Icon
							src={CheckIcon}
							className='text-brand mt-0.5 size-4 shrink-0'
						/>
						<span className='text-muted-foreground text-sm text-pretty'>{item}</span>
					</li>
				))}
			</ul>
		</section>
	);
}
