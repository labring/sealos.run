import { Button } from '@/libs/components/ui/button';
import { Link } from '@/libs/i18n/navigation';
import { getPageItems } from '@/libs/showcase/pagination';
import { cn } from '@/libs/utils/styling';

const pageHref = (page: number) => (page === 1 ? '/showcase' : { pathname: '/showcase', query: { page } });

function StepLink({ page, enabled, children }: { page: number; enabled: boolean; children: string }) {
	return (
		<Button
			asChild={enabled}
			variant='outline'
			size='sm'
			disabled={!enabled}
			className='px-3'
		>
			{enabled ? (
				<Link
					href={pageHref(page)}
					scroll={false}
				>
					{children}
				</Link>
			) : (
				children
			)}
		</Button>
	);
}

/** Page links for the project list. The page lives in the URL (?page=2) so it survives back navigation and sharing. */
export function Pagination({ page, pageCount }: { page: number; pageCount: number }) {
	return (
		<nav
			aria-label='作品列表分页'
			className='mt-10 flex items-center justify-center gap-2'
		>
			<StepLink
				page={page - 1}
				enabled={page > 1}
			>
				上一页
			</StepLink>

			{/* Phones get a compact "5 / 10"; the numbered links need more room. */}
			<span className='text-muted-foreground px-3 text-sm tabular-nums sm:hidden'>
				{page} / {pageCount}
			</span>
			<div className='hidden items-center gap-2 sm:flex'>
				{getPageItems(page, pageCount).map((item, index) =>
					item === 'ellipsis' ? (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: at most two gaps, in fixed positions
							key={`gap-${index}`}
							className='text-muted-foreground px-1 text-sm select-none'
						>
							…
						</span>
					) : (
						<Button
							key={item}
							asChild
							variant='outline'
							size='sm'
							className={cn(
								'size-9 p-0 tabular-nums',
								item === page ? 'text-brand border-brand font-semibold' : 'text-muted-foreground',
							)}
						>
							<Link
								href={pageHref(item)}
								scroll={false}
								aria-current={item === page ? 'page' : undefined}
								aria-label={`第 ${item} 页`}
							>
								{item}
							</Link>
						</Button>
					),
				)}
			</div>

			<StepLink
				page={page + 1}
				enabled={page < pageCount}
			>
				下一页
			</StepLink>
		</nav>
	);
}
