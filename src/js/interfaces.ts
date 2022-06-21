export enum MESSAGE_TYPES {
	INIT_MESSAGE = 'init_message',
	INIT_RESPONSE = 'init_response',
}

export interface InitMessage {
	msg: MESSAGE_TYPES.INIT_MESSAGE;
	data: {
		url: string;
	};
}

export interface InitResponse {
	msg: MESSAGE_TYPES.INIT_RESPONSE;
	data: {
		isLDPResource: boolean;
	};
}
