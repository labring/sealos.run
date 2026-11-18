'use client';

import React from 'react';
import { SearchIcon } from '@/assets/icons';
import { Icon } from '@/libs/components/ui/icon';
import { useRouter } from '@/libs/i18n/navigation';
import { buildShowcaseHref } from '@/libs/showcase/filters';
import css from '../sections/ShowcaseSection.module.css';

export function ShowcaseSearch({ query, votingOpen }: { query: string; votingOpen: boolean }) {
	const router = useRouter();
	const [draft, setDraft] = React.useState(query);
	const [pending, startTransition] = React.useTransition();
	React.useEffect(() => setDraft(query), [query]);
	const apply = (text: string) => {
		startTransition(() => router.push(buildShowcaseHref({ page: 1, query: text.trim() }), { scroll: false }));
	};
	return (
		<form
			className={css['toolbar']}
			aria-label='搜索作品'
			aria-busy={pending}
			onSubmit={(event) => {
				event.preventDefault();
				apply(draft);
			}}
		>
			<h3 className={css['listTitle']}>
				更多作品
				{votingOpen && <small>为喜欢的作品点赞，帮它冲进前三</small>}
			</h3>
			<div className={css['search']}>
				<input
					id='showcase-search'
					name='q'
					type='search'
					value={draft}
					onChange={(event) => {
						const text = event.target.value;
						setDraft(text);
						if (!text && query) apply('');
					}}
					maxLength={100}
					className={css['searchInput']}
					placeholder='搜索作品或作者'
					aria-label='搜索作品或作者'
				/>
				<button
					type='submit'
					className={css['searchButton']}
					disabled={pending}
					aria-label='搜索'
				>
					<Icon
						src={SearchIcon}
						aria-hidden='true'
					/>
				</button>
			</div>
		</form>
	);
}
