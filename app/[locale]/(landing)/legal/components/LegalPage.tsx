import { Link } from '@/libs/i18n/navigation';
import type { LegalPageContent } from '../utils/legal-pages';

export function LegalPage({ content }: { content: LegalPageContent }) {
	return (
		<main className='container mx-auto px-6 py-16 sm:py-24'>
			<div className='mx-auto max-w-3xl'>
				<div className='mb-12 border-b border-zinc-200 pb-8'>
					<p className='text-brand mb-3 text-sm leading-none font-medium'>Sealos Legal</p>
					<h1 className='text-4xl leading-tight font-semibold'>{content.title}</h1>
					<p className='text-muted-foreground mt-4 text-base leading-7'>{content.description}</p>
					<p className='text-muted-foreground mt-6 text-sm leading-normal'>最近更新：{content.updatedAt}</p>
				</div>

				<div className='space-y-10'>
					{content.intro && (
						<div className='space-y-4'>
							{content.intro.map((paragraph) => (
								<p
									key={paragraph}
									className='text-muted-foreground text-base leading-8'
								>
									{paragraph}
								</p>
							))}
						</div>
					)}
					{content.sections.map((section) => (
						<section
							key={section.title}
							className='space-y-4'
						>
							<h2 className='text-2xl leading-snug font-semibold'>{section.title}</h2>
							{section.paragraphs?.map((paragraph) => (
								<p
									key={paragraph}
									className='text-muted-foreground text-base leading-8'
								>
									{paragraph}
								</p>
							))}
							{section.items && (
								<ul className='text-muted-foreground list-disc space-y-3 pl-6 text-base leading-8'>
									{section.items.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							)}
						</section>
					))}
				</div>

				<div className='mt-14 flex flex-wrap gap-4 border-t border-zinc-200 pt-8 text-sm'>
					<Link
						href='/'
						className='hover:text-brand underline underline-offset-4'
					>
						返回首页
					</Link>
					<Link
						href='/about-us'
						className='hover:text-brand underline underline-offset-4'
					>
						关于我们
					</Link>
				</div>
			</div>
		</main>
	);
}
