import 'server-only';
import type React from 'react';
import { siBilibili, siGithub, siQq, siRss, siSinaweibo, siWechat } from 'simple-icons';
import { LarkIcon } from '@/assets/app-icons';
import { LinkIcon } from '@/assets/icons';
import { ProductsPanel } from './components/Navbar/ProductsPanel';
import { getProductsPanelData } from './components/Navbar/products-panel.server';
import { Icon } from './components/ui/icon';
import { SimpleIcon } from './components/ui/simple-icon';

/**
 * Server only config file for the site.
 *
 * ? You should render all components on the server side and then pass them to the client components.
 *
 * @example
 * // Importing this file
 * import { Config } from '@/libs/config';
 */
export const Config = (() => {
	// For the editor plugin to recognize i18n keys
	const t = <T,>(key: T) => key;
	const productsPanelData = getProductsPanelData();
	const blogCategoryCatalog = [
		{
			slug: 'kubernetes',
			aliases: ['kubernetes', 'kubernetes-教程'],
		},
		{
			slug: 'docker',
			aliases: ['docker', 'docker-容器技术'],
		},
		{
			slug: 'devops',
			aliases: ['devops', 'devops-实践'],
		},
		{
			slug: 'microservices',
			aliases: ['microservices', '微服务架构'],
		},
		{
			slug: 'databases',
			aliases: ['databases', '数据库管理'],
		},
		{
			slug: 'monitoring',
			aliases: ['monitoring', '监控告警'],
		},
		{
			slug: 'security',
			aliases: ['security', '安全加固'],
		},
		{
			slug: 'performance',
			aliases: ['performance', '性能优化'],
		},
		{
			slug: 'troubleshooting',
			aliases: ['troubleshooting', '故障排查'],
		},
	] satisfies Array<{
		slug: string;
		aliases: string[];
	}>;

	return {
		pages: {
			solutions: {
				contactForm: {
					endpoint: 'https://ksfxpfyz65.sealoshzh.site/submit-contact-form',
					version: 'ff15c990-cf33-47bc-b5fc-b886cbc6e28e',
				},
			},
			appstore: {
				templateRequestForm: {
					endpoint: 'https://ksfxpfyz65.sealoshzh.site/submit-template-request-form',
					version: 'f90db67d-8105-445b-8a2a-52fb2d33454c',
				},
				templateDeployUrlTemplate:
					'https://cloud.sealos.run/?openapp=system-template%3FtemplateName%3D<template_name>',
			},
		},
		components: {
			navbar: {
				contactButtonLink: 'https://fael3z0zfze.feishu.cn/share/base/form/shrcnamY6ULVuhDVLtPeA2izC5f',
				contactLink: 'https://cloud.sealos.run/',
				signinLink: 'https://cloud.sealos.run/',
				links: [
					{
						textI18nKey: t('components.navbar.links.products'),
						href: '/products',
						panel: <ProductsPanel {...productsPanelData} />,
					},
					{
						textI18nKey: t('components.navbar.links.download'),
						href: '/download',
					},
					{
						textI18nKey: t('components.navbar.links.pricing'),
						href: '/pricing/payg',
					},
					{
						textI18nKey: t('components.navbar.links.docs'),
						href: '/docs',
					},
					{
						textI18nKey: t('components.navbar.links.private-cloud'),
						href: '/private-cloud',
					},
					{
						textI18nKey: t('components.navbar.links.appstore'),
						href: '/products/appstore',
					},
					{
						textI18nKey: t('components.navbar.links.about-us'),
						href: '/about-us',
					},
				] satisfies Array<{
					textI18nKey: string;
					href: string;
					panel?: React.ReactNode;
				}>,
			},
			footer: {
				titleI18nKey: t('components.footer.title'),
				taglineI18nKey: t('components.footer.tagline'),
				copyrightI18nKey: t('components.footer.copyright'),
				menuItems: [
					{
						titleI18nKey: t('components.footer.menuItems.resources.title'),
						links: [
							{
								textI18nKey: t('components.footer.menuItems.resources.links.docs'),
								url: '/docs',
							},
						],
					},
					{
						titleI18nKey: t('components.footer.menuItems.products.title'),
						links: [
							{
								textI18nKey: t('components.footer.menuItems.products.links.launchpad'),
								url: '/products/launchpad',
							},
							{
								textI18nKey: t('components.footer.menuItems.products.links.database'),
								url: '/products/database',
							},
							{
								textI18nKey: t('components.footer.menuItems.products.links.oss'),
								url: '/products/oss',
							},
							{
								textI18nKey: t('components.footer.menuItems.products.links.devbox'),
								url: '/products/devbox',
							},
							{
								textI18nKey: t('components.footer.menuItems.products.links.aiproxy'),
								url: '/products/aiproxy',
							},
							{
								textI18nKey: t('components.footer.menuItems.products.links.appstore'),
								url: '/products/appstore',
							},
						],
					},
					{
						titleI18nKey: t('components.footer.menuItems.services.title'),
						links: [
							{
								textI18nKey: t('components.footer.menuItems.services.links.pricing'),
								url: '/pricing/payg',
							},
							{
								textI18nKey: t('components.footer.menuItems.services.links.privateCloud'),
								url: '/private-cloud',
							},
						],
					},
					{
						titleI18nKey: t('components.footer.menuItems.support.title'),
						links: [
							{
								textI18nKey: t('components.footer.menuItems.support.links.aboutUs'),
								url: '/about-us',
							},
							{
								textI18nKey: t('components.footer.menuItems.support.links.contactUs'),
								url: 'https://fael3z0zfze.feishu.cn/share/base/form/shrcnamY6ULVuhDVLtPeA2izC5f',
							},
						],
					},
				],
				bottomLinks: [
					{
						textI18nKey: t('components.footer.bottomLinks.termsOfService'),
						url: '/legal/terms-of-service',
					},
					{
						textI18nKey: t('components.footer.bottomLinks.privacyPolicy'),
						url: '/legal/privacy-policy',
					},
					{
						textI18nKey: t('components.footer.bottomLinks.cookiePolicy'),
						url: '/legal/cookie-policy',
					},
				],
				socialLinks: [
					{
						name: 'Github',
						brandColor: `#${siGithub.hex}`,
						icon: <SimpleIcon d={siGithub.path} />,
						url: 'https://github.com/labring/sealos',
					},
					{
						name: 'Feishu',
						brandColor: '#3370ff',
						icon: <Icon src={LarkIcon} />,
						url: 'https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=e69j1d6b-689a-4417-8f99-37f474ca961a',
					},
					{
						name: 'Bilibili',
						brandColor: `#${siBilibili.hex}`,
						icon: <SimpleIcon d={siBilibili.path} />,
						url: 'https://space.bilibili.com/1803388873',
					},
					{
						name: 'WeChat',
						brandColor: `#${siWechat.hex}`,
						icon: <SimpleIcon d={siWechat.path} />,
						url: 'https://mp.weixin.qq.com/s/kDOR9YmlpwRByYBhSH_bQA',
					},
					{
						name: 'RSS',
						brandColor: `#${siRss.hex}`,
						icon: <SimpleIcon d={siRss.path} />,
						url: 'https://sealos.io/rss.xml',
					},
				],
			},
			blog: {
				categories: blogCategoryCatalog,
				shareButtons: [
					{
						icon: <SimpleIcon d={siSinaweibo.path} />,
						textI18nKey: t('pages.blog.sharePosts.weibo'),
						linkTemplate: 'http://service.weibo.com/share/share.php?url={link}&title={title}',
					},
					{
						icon: <SimpleIcon d={siWechat.path} />,
						textI18nKey: t('pages.blog.sharePosts.wechat'),
						linkTemplate: '#',
						onClick: 'copy' as const,
					},
					{
						icon: <SimpleIcon d={siQq.path} />,
						textI18nKey: t('pages.blog.sharePosts.qq'),
						linkTemplate: 'http://connect.qq.com/widget/shareqq/index.html?url={link}&title={title}',
					},
					{
						icon: (
							<Icon
								src={LinkIcon}
								className='size-full'
							/>
						),
						textI18nKey: t('pages.blog.sharePosts.copyLink'),
						linkTemplate: '#',
						onClick: 'copy' as const,
					},
				],
			},
		},
	};
})();
