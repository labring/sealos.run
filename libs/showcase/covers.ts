import 'server-only';
import { AwsClient } from 'aws4fetch';
import sharp from 'sharp';

export type StorageConfig = {
	endpoint: string;
	bucket: string;
	accessKey: string;
	secretKey: string;
	/** Public address of the bucket; defaults to `<endpoint>/<bucket>`. */
	publicBaseUrl: string;
};

/** Crop to 3:2 around the centre and re-encode: uploads are often multi-megabyte PNG screenshots. */
export function toCoverImage(source: Buffer): Promise<Buffer> {
	return sharp(source).rotate().resize(1200, 800, { fit: 'cover' }).webp({ quality: 82 }).toBuffer();
}

/**
 * Store a cover in the public bucket and return its address. The file token is
 * part of the name, so a replaced cover gets a new address and caches never go stale.
 */
export async function uploadCover(
	config: StorageConfig,
	projectId: string,
	fileToken: string,
	image: Buffer,
): Promise<string> {
	const key = `showcase/covers/${projectId}-${fileToken}.webp`;
	const client = new AwsClient({
		accessKeyId: config.accessKey,
		secretAccessKey: config.secretKey,
		service: 's3',
		region: 'us-east-1',
	});
	const body = new Uint8Array(image);
	const signed = await client.sign(`${config.endpoint}/${config.bucket}/${key}`, {
		method: 'PUT',
		headers: { 'content-type': 'image/webp', 'cache-control': 'public, max-age=31536000, immutable' },
		body,
	});
	// Send the bytes themselves, not the signed Request: its body is a stream, which
	// goes out chunked with no Content-Length, and the bucket answers 411.
	const response = await fetch(signed.url, {
		method: 'PUT',
		headers: signed.headers,
		body,
		signal: AbortSignal.timeout(30_000),
	});
	if (!response.ok) {
		throw new Error(`封面上传失败（${response.status}）`);
	}
	return `${config.publicBaseUrl}/${key}`;
}
