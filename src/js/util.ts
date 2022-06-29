import HttpHeaders = browser.webRequest.HttpHeaders;

const APPLICABLE_PROTOCOLS = ['http:', 'https:'];
const ICON_ACTIVE = 'images/solid-emblem.svg';
const TITLE_ACTIVE = 'Open resource with Solid App';

export function isLDPResourceFromResponseHeader(responseHeaders?: HttpHeaders | undefined): boolean {
	if (!responseHeaders) return false;
	const linkHeader = responseHeaders.find(({ name }) => name.toLowerCase() === 'link')?.value;
	return (linkHeader?.split(',').filter((s) => s.match('rel="type') && s.match('http://www.w3.org/ns/ldp#Resource')) || []).length > 0;
}

/*
Returns true only if the URL's protocol is in APPLICABLE_PROTOCOLS.
Argument url must be a valid URL string.
*/
function protocolIsApplicable(url: string) {
	const protocol = new URL(url).protocol;
	return APPLICABLE_PROTOCOLS.includes(protocol);
}

export function hideIcon(tabId: number) {
	browser.pageAction.hide(tabId);
}

export function showActiveIcon(tabId: number) {
	browser.pageAction.setIcon({ tabId, path: ICON_ACTIVE });
	browser.pageAction.setTitle({ tabId, title: TITLE_ACTIVE });
	browser.pageAction.show(tabId);
}

/*
Initialize the page action: set icon and title, then show.
Only operates on tabs whose URL's protocol is applicable.
*/
export function initializePageAction(tab: browser.tabs.Tab, active: boolean = false) {
	if (tab.id && tab.url && protocolIsApplicable(tab.url) && active) {
		showActiveIcon(tab.id);
	} else if (tab.id) {
		hideIcon(tab.id);
	}
}

export async function getActiveTab(url?: string): Promise<browser.tabs.Tab | undefined> {
	const tabs = await browser.tabs.query({
		currentWindow: true,
		active: true,
	});
	return url ? tabs.find((tab) => tab.url === url) : tabs.pop();
}
