import { BaseMessage, InitMessage, InitResponse, ManifestMessage, MESSAGE_TYPES } from '../js/interfaces';
import { storage } from '../js/api';
import { getSolidDataset, getThingAll, getUrlAll } from '@inrupt/solid-client';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { RDF } from '@inrupt/vocab-common-rdf';
import { getActiveTab } from '../js/util';

const popupContent = document.querySelector('#popup-content');
// if (popupContent) {
// 	console.log('POPUP', popupContent);
// }

// browser.runtime.onMessage.addListener((message: Message) => {
// 	console.log('MESSAGE', message);
// });

async function initApp(response: ManifestMessage): Promise<void> {
	console.log('INIT APP', response.data);
}

async function initList(response: InitResponse): Promise<void> {
	const { url } = response.data;
	console.log('TEST 1', response, url);
	const apps = await storage.get('solidApps');
	if (!response.data.isLDPResource) {
		return;
	}
	// @ts-ignore
	const dataset = await getSolidDataset(url, { fetch: getDefaultSession().fetch });
	const types = getThingAll(dataset).flatMap((thing) => getUrlAll(thing, RDF.type));
	console.log('TEST 2', apps, response, dataset, types);
	// START MATCHING TYPES WITH APP LIST
}

async function initPopup(currentTab?: browser.tabs.Tab) {
	if (!currentTab) {
		// tslint:disable-next-line:no-console
		console.error('Unable to get current tab');
		return;
	}
	const url = currentTab.url;
	if (!url) {
		// tslint:disable-next-line:no-console
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
		await initList(response);
	} catch (error) {
		// tslint:disable-next-line:no-console
		console.error('ERROR', error);
	}
}

getActiveTab().then(initPopup);

browser.runtime.onMessage.addListener((request: BaseMessage) => {
	switch (request.msg) {
		case MESSAGE_TYPES.INIT_RESPONSE:
			return initList(request as InitResponse);
		case MESSAGE_TYPES.MANIFEST_MESSAGE:
			return initApp(request as ManifestMessage);
	}
});
