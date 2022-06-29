import { getActiveTab, hideIcon, initializePageAction, isLDPResourceFromResponseHeader, showActiveIcon } from './util';
import { BaseMessage, InitFailure, InitMessage, InitResponse, ManifestMessage, MESSAGE_TYPES } from './interfaces';
import { getSolidDataset } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';

const solidLinkNotification = 'solid-link-notification';

const ldpResources: Record<string, boolean> = {};

browser.webNavigation.onCompleted.addListener(
	async (event) => {
		const isLDPResource = ldpResources[event.url];
		// console.log('onCompleted', isLDPResource, event);
		if (isLDPResource && event.tabId) {
			showActiveIcon(event.tabId);
			// await browser.runtime.sendMessage({ isLDPResource: true });
		} else if (event.tabId) {
			hideIcon(event.tabId);
			await browser.tabs.executeScript({ file: '/content_scripts/content-script.js' });
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
		// console.log('ON HEADER', event.url, isLDPResource, event);
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

async function handleManifestMessage(message: ManifestMessage): Promise<void> {
	const tab = await getActiveTab(message.data.url);
	if (!tab) return;
	showActiveIcon(tab.id!);
	// console.log('HANDLING MANIFEST MESSAGE', message, tab);
}

function handleInitMessage(message: InitMessage): BaseMessage {
	const url = message.data.url;
	if (!url) {
		const failure: InitFailure = {
			msg: MESSAGE_TYPES.INIT_FAILURE,
			data: { error: 'Invalid URL' },
		};
		return failure;
	}
	const response: InitResponse = {
		msg: MESSAGE_TYPES.INIT_RESPONSE,
		data: { isLDPResource: ldpResources[url], url },
	};
	return response;
}

browser.runtime.onMessage.addListener((request: BaseMessage, sender, sendResponse) => {
	switch (request.msg) {
		case MESSAGE_TYPES.INIT_MESSAGE:
			return sendResponse(handleInitMessage(request as InitMessage));
		case MESSAGE_TYPES.MANIFEST_MESSAGE:
			return handleManifestMessage(request as ManifestMessage);
	}
});
