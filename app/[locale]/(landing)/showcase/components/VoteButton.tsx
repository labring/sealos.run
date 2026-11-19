import React from 'react';
import { CheckIcon, ChevronUpIcon } from '@/assets/icons';
import { Icon } from '@/libs/components/ui/icon';
import { cn } from '@/libs/utils/styling';
import type { VoteFailure } from '../utils/useVotes';
import css from './VoteButton.module.css';

export type VoteButtonProps = {
	name: string;
	/** Null while votes are unavailable: the button is shown disabled without a count. */
	votes: number | null;
	voted: boolean;
	spent: boolean;
	authUnavailable: boolean;
	busy: boolean;
	failure: VoteFailure | undefined;
	onVote: () => void;
	className?: string;
};

export function VoteButton({
	name,
	votes,
	voted,
	spent,
	authUnavailable,
	busy,
	failure,
	onVote,
	className,
}: VoteButtonProps) {
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
				disabled={unavailable || spent || authUnavailable || busy || failure?.blocked}
				aria-pressed={unavailable || authUnavailable || failure?.blocked ? undefined : voted}
				aria-label={unavailable ? undefined : `${voted ? '今天已为' : '为'}「${name}」投票，当前 ${votes} 票`}
				title={
					unavailable || authUnavailable ? '投票暂时不可用，请稍后再来' : spent ? '今天的票已投出' : undefined
				}
				onClick={onVote}
			>
				<Icon
					src={voted ? CheckIcon : ChevronUpIcon}
					strokeWidth={2}
					className={css['icon']}
				/>
				{voted ? '已投票' : spent ? '今日已投' : '投票'}
				{celebrate && (
					<span
						className={css['plus']}
						aria-hidden='true'
					>
						+1
					</span>
				)}
			</button>
			{!unavailable && failure && <output className={css['error']}>{failure.message}</output>}
		</div>
	);
}
