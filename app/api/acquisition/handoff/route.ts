import { resolveAcquisitionHandoff } from '@/libs/utils/acquisition-handoff';

export const dynamic = 'force-dynamic';

export function GET(request: Request): Response {
	const result = resolveAcquisitionHandoff(request.url, request.headers.get('host'));
	if (result.status === 400) {
		return new Response('invalid installer target', {
			status: 400,
			headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' },
		});
	}
	const headers = new Headers({
		Location: result.location,
		'Cache-Control': 'no-store',
		'Referrer-Policy': 'no-referrer',
	});
	if (result.setCookie) headers.set('Set-Cookie', result.setCookie);
	return new Response(null, { status: 302, headers });
}
