import { getSolidDataset } from '@inrupt/solid-client';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { ManifestMessage, MESSAGE_TYPES } from '../js/interfaces';

const appType = 'https://solid-link-demo.vercel.app/solid-connect-vocab.ttl#App';

function normalizeUrl(url: string): string {
	if (url.startsWith('/')) return window.location.origin + url;
	return url || '';
}

(async () => {
	const links = Array.from(document.querySelectorAll(`link[rel="${appType}"]`));
	if (!links.length) return;
	const manifestUrls = links.filter((link) => link.hasAttribute('href')).map((link) => normalizeUrl(link.getAttribute('href')!));
	// @ts-ignore
	const manifestDatasets = await Promise.all(manifestUrls.map((url) => getSolidDataset(url, { fetch: getDefaultSession().fetch })));
	const message: ManifestMessage = {
		msg: MESSAGE_TYPES.MANIFEST_MESSAGE,
		data: {
			datasets: manifestDatasets,
			url: window.location.href,
		},
	};
	// console.log('CONTENT SCRIPT', message);
	await browser.runtime.sendMessage(message);
})();
