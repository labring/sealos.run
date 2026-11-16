import { CheckIcon, ChevronUpIcon } from '@/assets/icons';
import { Button } from '@/libs/components/ui/button';
import { Icon } from '@/libs/components/ui/icon';
import { cn } from '@/libs/utils/styling';

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
	return (
		<div className={cn('flex flex-col items-end gap-1', className)}>
			{votes === null ? (
				<Button
					variant='outline'
					disabled
					title='点赞暂时不可用，请稍后再来'
				>
					<Icon
						src={ChevronUpIcon}
						className='size-4'
					/>
					点赞
				</Button>
			) : (
				<Button
					variant={voted ? 'default' : 'outline'}
					disabled={voted || busy}
					aria-label={voted ? `已为「${name}」点赞，当前 ${votes} 赞` : `为「${name}」点赞，当前 ${votes} 赞`}
					className='tabular-nums disabled:opacity-100'
					onClick={onVote}
				>
					<Icon
						src={voted ? CheckIcon : ChevronUpIcon}
						className='size-4'
					/>
					{votes}
				</Button>
			)}
			{failed && <output className='text-destructive text-xs'>没点成功，请再试一次</output>}
		</div>
	);
}
