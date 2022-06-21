import { hideIcon, initializePageAction, showActiveIcon } from './util';

const solidLinkNotification = 'solid-link-notification';

const ldpResources: Record<string, boolean> = {};

browser.webNavigation.onCompleted.addListener(
	(event) => {
		const isLDPResource = ldpResources[event.url];
		if (isLDPResource && event.tabId) {
			showActiveIcon(event.tabId);
		} else if (event.tabId) {
			hideIcon(event.tabId);
		}
		// browser.notifications.create(solidLinkNotification, {
		// 	iconUrl: browser.runtime.getURL('images/icon64.png'),
		// 	message: `Solid Link activated!`,
		// 	title: 'Solid Link',
		// 	type: 'basic',
		// });
	},
	{
		url: [{}],
	}
);

browser.webRequest.onHeadersReceived.addListener(
	(event) => {
		// console.log('ON HEADERS RECEIVED', event.url, event);
		// browser.notifications.create(solidLinkNotification, {
		// 	iconUrl: browser.runtime.getURL('images/icon64.png'),
		// 	message: `Solid Link activated!`,
		// 	title: 'Solid Link',
		// 	type: 'basic',
		// });
		const linkHeader = event.responseHeaders!.find(({ name }) => name.toLowerCase() === 'link')?.value;
		const isLDPResource =
			(linkHeader?.split(',').filter((s) => s.match('rel="type') && s.match('http://www.w3.org/ns/ldp#Resource')) || []).length > 0;
		console.log('ON HEADER', event.url, isLDPResource);
		if (isLDPResource) {
			ldpResources[event.url] = isLDPResource;
		}
		// contentType = event.responseHeaders!.find(({ name }) => name.toLowerCase() === 'content-type')?.value;
		// const setMyCookie = {
		// 	name: 'Set-Cookie',
		// 	value: 'my-cookie1=my-cookie-value1',
		// };
		// event.responseHeaders!.push(setMyCookie);
	},
	{
		types: ['main_frame'],
		urls: ['<all_urls>'],
	},
	['responseHeaders']
);

/*
When first loaded, initialize the page action for all tabs.
*/
const gettingAllTabs = browser.tabs.query({});
gettingAllTabs.then((tabs) => {
	for (const tab of tabs) {
		initializePageAction(tab, !!tab.url && ldpResources[tab.url]);
	}
});

/*
Each time a tab is updated, reset the page action for that tab.
*/
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
	initializePageAction(tab, !!tab.url && ldpResources[tab.url]);
});
