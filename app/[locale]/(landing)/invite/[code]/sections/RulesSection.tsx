import { CheckIcon } from '@/assets/icons';
import { Icon } from '@/libs/components/ui/icon';
import { getTranslations } from '@/libs/i18n/server';

// The design spec has no dedicated rules block; kept as a quiet footer-note
// list because the issue requires the activity terms to stay on the page.
export async function RulesSection() {
	const t = await getTranslations('pages.invite.rules');
	const items = t.raw('items') as string[];

	return (
		<section className='container mx-auto flex flex-col items-center gap-5 px-6 py-12'>
			<h2 className='text-muted-foreground text-sm font-medium'>{t('title')}</h2>
			<ul className='text-muted-foreground grid max-w-3xl gap-2 text-center text-xs sm:grid-cols-2 sm:text-left sm:text-sm'>
				{items.map((item) => (
					<li
						key={item}
						className='flex items-start gap-2 sm:items-start'
					>
						<Icon
							src={CheckIcon}
							className='mt-0.5 size-3.5 shrink-0'
						/>
						<span className='text-pretty'>{item}</span>
					</li>
				))}
			</ul>
		</section>
	);
}
