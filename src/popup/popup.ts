import { BaseMessage, InitMessage, InitResponse, MESSAGE_TYPES } from '../js/interfaces';
import { storage } from '../js/api';
import { asUrl, getSolidDataset, getThingAll, getUrlAll } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';
import { RDF } from '@inrupt/vocab-common-rdf';

const popupContent = document.querySelector('#popup-content');
// if (popupContent) {
// 	console.log('POPUP', popupContent);
// }

// browser.runtime.onMessage.addListener((message: Message) => {
// 	console.log('MESSAGE', message);
// });

async function initList(response: InitResponse, url: string): Promise<void> {
	console.log('TEST 1', response, url);
	const apps = await storage.get('solidApps');
	if (!response.data.isLDPResource) {
		return;
	}
	// @ts-ignore
	const dataset = await getSolidDataset(url, { fetch });
	const types = getThingAll(dataset).flatMap((thing) => getUrlAll(thing, RDF.type));
	console.log('TEST 2', apps, response, dataset, types);
	// START MATCHING TYPES WITH APP LIST
}

async function initPopup(tabs: browser.tabs.Tab[]) {
	const currentTab = tabs.pop();
	if (!currentTab) {
		console.error('Unable to get current tab');
		return;
	}
	const url = currentTab.url;
	if (!url) {
		console.error('Unable to get current URL');
		return;
	}
	const initMessage: InitMessage = {
		msg: MESSAGE_TYPES.INIT_MESSAGE,
		data: { url },
	};
	try {
		// const response = await browser.runtime.sendMessage(initMessage);
		const response = await browser.runtime.sendMessage(initMessage);
		await initList(response, url);
	} catch (error) {
		console.error('ERROR', error);
	}
}

function getActiveTab() {
	return browser.tabs.query({ currentWindow: true, active: true });
}

getActiveTab().then(initPopup);

browser.runtime.onMessage.addListener((request: BaseMessage) => {
	switch (request.msg) {
		case MESSAGE_TYPES.INIT_RESPONSE:
			initList(request as InitResponse);
	}
});
