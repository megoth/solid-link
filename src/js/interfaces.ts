import { SolidDataset } from '@inrupt/solid-client';

export enum MESSAGE_TYPES {
	INIT_MESSAGE = 'init_message',
	INIT_FAILURE = 'init_failure',
	INIT_RESPONSE = 'init_response',
	MANIFEST_MESSAGE = 'manifest_message',
}

export interface BaseMessage {
	msg: string;
	data: any;
}

export interface InitMessage extends BaseMessage {
	msg: MESSAGE_TYPES.INIT_MESSAGE;
	data: {
		url: string;
	};
}

export interface InitFailure extends BaseMessage {
	msg: MESSAGE_TYPES.INIT_FAILURE;
	data: {
		error: string;
	};
}

export interface InitResponse extends BaseMessage {
	msg: MESSAGE_TYPES.INIT_RESPONSE;
	data: {
		isLDPResource: boolean;
		url: string;
	};
}

export interface ManifestMessage extends BaseMessage {
	msg: MESSAGE_TYPES.MANIFEST_MESSAGE;
	data: {
		datasets: SolidDataset[];
		url: string;
	};
}
