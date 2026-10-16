import { getTranslations } from '@/libs/i18n/server';

// Keep the activity terms accessible without adding a section absent from the design.
export async function RulesSection() {
	const t = await getTranslations('pages.invite.rules');
	const items = t.raw('items') as string[];

	return (
		<details className='mx-auto w-full max-w-332 px-6 py-4 text-sm text-muted-foreground'>
			<summary className='mx-auto w-fit cursor-pointer rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4'>
				{t('title')}
			</summary>
			<ul className='mx-auto mt-6 grid max-w-3xl list-disc gap-x-8 gap-y-2 pl-5 sm:grid-cols-2'>
				{items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</details>
	);
}
