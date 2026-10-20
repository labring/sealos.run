import type { StaticImageData } from 'next/image';
import { AlibabaCloudIcon, GoogleCloudIcon, TencentCloudIcon, VolcanoEngineIcon } from '@/assets/app-icons';
import { LandingOutlineButton } from '@/libs/components/LandingOutlineButton';
import { Icon } from '@/libs/components/ui/icon';
import { Config } from '@/libs/config';
import { HeroBg } from '../components/HeroBg';

const cloudProviders: Array<{ name: string; icon: StaticImageData }> = [
	{
		name: '谷歌云',
		icon: GoogleCloudIcon,
	},
	{
		name: '腾讯云',
		icon: TencentCloudIcon,
	},
	{
		name: '火山引擎',
		icon: VolcanoEngineIcon,
	},
	{
		name: '阿里云',
		icon: AlibabaCloudIcon,
	},
];

export function HeroSection() {
	const { signinLink } = Config.components.navbar;

	return (
		<div className='relative flex flex-col justify-between'>
			<HeroBg />

			<div className='container flex flex-col justify-between gap-6 px-6 lg:flex-row'>
				<div className='relative z-10 flex flex-1 flex-col gap-3'>
					<div className='flex flex-col-reverse items-start gap-3 sm:flex-row sm:items-center sm:gap-6'>
						<p className='text-2xl leading-none font-semibold md:text-3xl xl:text-4xl'>Sealos AIOS</p>
						<div className='flex items-center gap-4'>
							{cloudProviders.map((provider) => (
								<span
									key={provider.name}
									className='flex items-center gap-2 text-sm'
								>
									<Icon
										src={provider.icon}
										className='size-4 saturate-0'
									/>
									{provider.name}
								</span>
							))}
						</div>
					</div>
					<h1 className='text-4xl leading-tight font-semibold sm:text-5xl'>
						应用为中心的 AI <span className='text-brand'>云操作系统</span>
					</h1>
				</div>

				<div className='relative flex flex-wrap items-center gap-5'>
					<LandingOutlineButton
						href='/download'
						size='lg'
					>
						立即下载
					</LandingOutlineButton>
					<LandingOutlineButton
						href={signinLink}
						size='lg'
					>
						免费试用
					</LandingOutlineButton>
				</div>
			</div>
		</div>
	);
}
