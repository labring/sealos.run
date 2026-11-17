import React from 'react';
import { CheckIcon, ChevronUpIcon } from '@/assets/icons';
import { Icon } from '@/libs/components/ui/icon';
import { cn } from '@/libs/utils/styling';
import css from './VoteButton.module.css';

export type VoteButtonProps = {
	name: string;
	/** Null while votes are unavailable: the button is shown disabled without a count. */
	votes: number | null;
	voted: boolean;
	busy: boolean;
	failed: boolean;
	onVote: () => void;
	className?: string;
};

export function VoteButton({ name, votes, voted, busy, failed, onVote, className }: VoteButtonProps) {
	const [celebrate, setCelebrate] = React.useState(false);
	const wasVoted = React.useRef(voted);
	React.useEffect(() => {
		if (voted && !wasVoted.current) setCelebrate(true);
		wasVoted.current = voted;
	}, [voted]);

	const unavailable = votes === null;
	return (
		<div className={cn(css['wrap'], className)}>
			<button
				type='button'
				className={css['vote']}
				disabled={unavailable || voted || busy}
				aria-pressed={unavailable ? undefined : voted}
				aria-label={unavailable ? undefined : `${voted ? '已为' : '为'}「${name}」点赞，当前 ${votes} 票`}
				title={unavailable ? '点赞暂时不可用，请稍后再来' : undefined}
				onClick={onVote}
			>
				<Icon
					src={voted ? CheckIcon : ChevronUpIcon}
					strokeWidth={2}
					className={css['icon']}
				/>
				{voted ? '已点赞' : '点赞'}
				{celebrate && (
					<span
						className={css['plus']}
						aria-hidden='true'
					>
						+1
					</span>
				)}
			</button>
			{failed && <output className={css['error']}>没点成功，请再试一次</output>}
		</div>
	);
}
