import { hideIcon, initializePageAction, isLDPResourceFromResponseHeader, showActiveIcon } from './util';
import { InitMessage, InitResponse, MESSAGE_TYPES } from './interfaces';

const solidLinkNotification = 'solid-link-notification';

const ldpResources: Record<string, boolean> = {};

browser.webNavigation.onCompleted.addListener(
	async (event) => {
		const isLDPResource = ldpResources[event.url];
		if (isLDPResource && event.tabId) {
			showActiveIcon(event.tabId);
			// await browser.runtime.sendMessage({ isLDPResource: true });
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
		const isLDPResource = isLDPResourceFromResponseHeader(event.responseHeaders);
		// console.log('ON HEADER', event.url, isLDPResource);
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

browser.runtime.onMessage.addListener((request: InitMessage, sender, sendResponse) => {
	switch (request.msg) {
		case MESSAGE_TYPES.INIT_MESSAGE:
			const response: InitResponse = {
				msg: MESSAGE_TYPES.INIT_RESPONSE,
				data: { isLDPResource: ldpResources[request.data.url] },
			};
			return sendResponse(response);
	}
});
