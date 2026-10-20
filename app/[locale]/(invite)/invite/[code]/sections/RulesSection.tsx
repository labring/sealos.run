import { getTranslations } from '@/libs/i18n/server';
import styles from './RulesSection.module.css';

export async function RulesSection() {
	const t = await getTranslations('pages.invite.rules');
	const firstLoginItems = t.raw('firstLogin.items') as string[];
	const inviteItems = t.raw('invitation.items') as string[];
	const supplements = t.raw('supplements') as string[];

	return (
		<section
			className={styles['section']}
			aria-labelledby='invite-rules-title'
		>
			<h2
				id='invite-rules-title'
				className={styles['title']}
			>
				{t('title')}
			</h2>
			<div className={styles['rewards']}>
				<article>
					<h3>{t('firstLogin.title')}</h3>
					<ul>
						{firstLoginItems.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</article>
				<article>
					<h3>{t('invitation.title')}</h3>
					<ul>
						{inviteItems.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</article>
			</div>
			<div className={styles['supplements']}>
				<p>{t('supplementTitle')}</p>
				{supplements.map((item) => (
					<p key={item}>{item}</p>
				))}
				<p>{t('disclaimer')}</p>
			</div>
		</section>
	);
}
