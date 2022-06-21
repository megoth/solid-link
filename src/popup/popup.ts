import { InitMessage, InitResponse, MESSAGE_TYPES } from '../js/interfaces';
import { storage } from '../js/api';

const popupContent = document.querySelector('#popup-content');
// if (popupContent) {
// 	console.log('POPUP', popupContent);
// }

// browser.runtime.onMessage.addListener((message: Message) => {
// 	console.log('MESSAGE', message);
// });

async function initList({ data }: InitResponse) {
	const apps = await storage.get('solidApps');
	console.log('TEST', apps);
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
		const response = await browser.runtime.sendMessage(initMessage);
		await initList(response);
	} catch (error) {
		console.error('ERROR', error);
	}
}

function getActiveTab() {
	return browser.tabs.query({ currentWindow: true, active: true });
}

getActiveTab().then(initPopup);
