import { createHash } from 'node:crypto';
import { AwsClient } from 'aws4fetch';
import sharp from 'sharp';
import { CATALOG_KEY, encodeCatalog } from './catalog.ts';
import type { ShowcaseProject } from './project.ts';

export type StorageConfig = {
	endpoint: string;
	bucket: string;
	accessKey: string;
	secretKey: string;
	publicBaseUrl: string;
};

/** Cards crop with CSS. The detail page shows the complete screenshot. */
export function toCoverImage(source: Buffer): Promise<Buffer> {
	return sharp(source)
		.rotate()
		.resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
		.webp({ quality: 82 })
		.toBuffer();
}

async function putObject(
	config: StorageConfig,
	key: string,
	body: Uint8Array<ArrayBuffer>,
	type: string,
	cacheControl: string,
): Promise<void> {
	const client = new AwsClient({
		accessKeyId: config.accessKey,
		secretAccessKey: config.secretKey,
		service: 's3',
		region: 'us-east-1',
	});
	const signed = await client.sign(`${config.endpoint}/${config.bucket}/${key}`, {
		method: 'PUT',
		headers: { 'content-type': type, 'cache-control': cacheControl },
		body,
	});
	// Send the bytes directly so the bucket receives Content-Length rather than a chunked stream.
	const response = await fetch(signed.url, {
		method: 'PUT',
		headers: signed.headers,
		body,
		redirect: 'error',
		signal: AbortSignal.timeout(30_000),
	});
	if (!response.ok) throw new Error(`对象存储写入失败（HTTP ${response.status}）`);
}

export async function uploadCover(
	config: StorageConfig,
	projectId: string,
	fileToken: string,
	image: Buffer,
): Promise<string> {
	const digest = createHash('sha256').update(fileToken).digest('hex');
	const key = `showcase/covers/${encodeURIComponent(projectId)}-${digest}.webp`;
	await putObject(config, key, new Uint8Array(image), 'image/webp', 'public, max-age=31536000, immutable');
	return `${config.publicBaseUrl}/${key}`;
}

export function publishCatalog(config: StorageConfig, projects: ShowcaseProject[]): Promise<void> {
	return putObject(config, CATALOG_KEY, encodeCatalog(projects), 'application/json; charset=utf-8', 'no-store');
}
