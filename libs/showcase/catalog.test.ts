import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';
import { encodeCatalog, publicBucketUrl, readCatalog } from './catalog.ts';
import { publishCatalog, toCoverImage, uploadCover } from './covers.ts';

const publicProject = {
	id: 'rec1',
	name: '作品',
	summary: '简介',
	author: '作者',
	role: '',
	prompt: '',
	highlights: [],
	url: 'https://project.example/',
	coverUrl: 'https://cdn.example/one.webp',
	imageUrls: [],
};

test('public catalog uses the configured public address', () => {
	const names = ['SHOWCASE_S3_PUBLIC_BASE_URL', 'SHOWCASE_S3_ENDPOINT', 'SHOWCASE_S3_BUCKET'] as const;
	const original = Object.fromEntries(names.map((name) => [name, process.env[name]]));
	try {
		delete process.env['SHOWCASE_S3_PUBLIC_BASE_URL'];
		process.env['SHOWCASE_S3_ENDPOINT'] = 'https://objects.example';
		process.env['SHOWCASE_S3_BUCKET'] = 'bucket';
		assert.equal(publicBucketUrl(), null);
		process.env['SHOWCASE_S3_PUBLIC_BASE_URL'] = 'https://cdn.example/bucket/';
		assert.equal(publicBucketUrl(), 'https://cdn.example/bucket');
	} finally {
		for (const name of names) {
			const value = original[name];
			if (value === undefined) delete process.env[name];
			else process.env[name] = value;
		}
	}
});

test('writes a replaceable catalog and reads the same public document without credentials', async (t) => {
	const objects = new Map<string, string>();
	const storage = {
		endpoint: 'https://objects.example',
		bucket: 'bucket',
		publicBaseUrl: 'https://objects.example/bucket',
		accessKey: 'test-id',
		secretKey: 'test-key',
	};
	t.mock.method(globalThis, 'fetch', async (address: string, init: RequestInit) => {
		if (init.method === 'PUT') {
			assert.ok(new Headers(init.headers).has('authorization'));
			assert.match(new Headers(init.headers).get('cache-control') ?? '', /no-store/);
			objects.set(address, new TextDecoder().decode(init.body as Uint8Array));
			return new Response(null);
		}
		assert.equal(new Headers(init.headers).has('authorization'), false);
		return new Response(objects.get(address), { status: objects.has(address) ? 200 : 404 });
	});
	await assert.rejects(readCatalog(storage.publicBaseUrl));
	await publishCatalog(storage, [publicProject]);
	assert.deepEqual(await readCatalog(storage.publicBaseUrl), [publicProject]);
	await publishCatalog(storage, []);
	assert.deepEqual(await readCatalog(storage.publicBaseUrl), []);
	objects.set(`${storage.publicBaseUrl}/showcase/catalog.json`, '{"projects":null}');
	await assert.rejects(readCatalog(storage.publicBaseUrl));
});

test('publishes HTTP(S) project and image URLs served by an IP address', () => {
	const project = {
		...publicProject,
		url: 'http://192.0.2.10:3000/',
		coverUrl: 'https://[2001:db8::1]/one.webp',
		imageUrls: ['http://192.0.2.11:9000/gallery.webp'],
	};
	const document = JSON.parse(new TextDecoder().decode(encodeCatalog([project])));
	assert.deepEqual(document.projects, [project]);
	assert.throws(() => encodeCatalog([{ ...project, url: 'ftp://192.0.2.10/file' }]));
});

test('keeps screenshot proportions and sends immutable WebP bytes to object storage', async (t) => {
	const source = await sharp({ create: { width: 600, height: 100, channels: 3, background: 'white' } })
		.png()
		.toBuffer();
	const encoded = await toCoverImage(source);
	const metadata = await sharp(encoded).metadata();
	assert.equal(metadata.format, 'webp');
	assert.equal(metadata.width / metadata.height, 6);
	t.mock.method(globalThis, 'fetch', async (_url: string, init: RequestInit) => {
		assert.equal(init.method, 'PUT');
		assert.match(new Headers(init.headers).get('cache-control') ?? '', /immutable/);
		assert.deepEqual(Buffer.from(init.body as Uint8Array), encoded);
		return new Response(null);
	});
	const url = await uploadCover(
		{
			endpoint: 'https://objects.example',
			bucket: 'bucket',
			publicBaseUrl: 'https://cdn.example',
			accessKey: 'test',
			secretKey: 'test',
		},
		'rec1',
		'file-token',
		encoded,
	);
	assert.match(url, /^https:\/\/cdn\.example\/showcase\/covers\/.+\.webp$/);
});
