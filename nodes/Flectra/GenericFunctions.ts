import { OptionsWithUri } from 'request';

import {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import { IDataObject, JsonObject, NodeApiError } from 'n8n-workflow';

const serviceJSONRPC = 'object';
const methodJSONRPC = 'execute';

export const mapOperationToJSONRPC = {
	create: 'create',
	get: 'read',
	getAll: 'search_read',
	update: 'write',
	delete: 'unlink',
};

export const mapFlectraResources: { [key: string]: string } = {
	contact: 'res.partner',
	opportunity: 'crm.lead',
	note: 'note.note',
};

export const mapFilterOperationToJSONRPC = {
	equal: '=',
	notEqual: '!=',
	greaterThen: '>',
	lesserThen: '<',
	greaterOrEqual: '>=',
	lesserOrEqual: '<=',
	like: 'like',
	in: 'in',
	notIn: 'not in',
	childOf: 'child_of',
};

type FilterOperation =
	| 'equal'
	| 'notEqual'
	| 'greaterThen'
	| 'lesserThen'
	| 'greaterOrEqual'
	| 'lesserOrEqual'
	| 'like'
	| 'in'
	| 'notIn'
	| 'childOf';

export interface IFlectraFilterOperations {
	filter: Array<{
		fieldName: string;
		operator: string;
		value: string | number;
	}>;
}

export interface IFlectraNameValueFields {
	fields: Array<{
		fieldName: string;
		fieldValue: string;
	}>;
}

export interface IFlectraResponseFields {
	fields: Array<{
		field: string;
		fromList?: boolean;
	}>;
}

type FlectraCRUD = 'create' | 'update' | 'delete' | 'get' | 'getAll';

export function flectraGetDBName(databaseName: string | undefined, url: string) {
	if (databaseName) return databaseName;
	const flectraURL = new URL(url);
	const hostname = flectraURL.hostname;
	if (!hostname) return '';
	return flectraURL.hostname.split('.')[0];
}

function processFilters(value: IFlectraFilterOperations) {
	return value.filter?.map((item) => {
		const operator = item.operator as FilterOperation;
		item.operator = mapFilterOperationToJSONRPC[operator];
		return Object.values(item);
	});
}

export function processNameValueFields(value: IDataObject) {
	const data = value as unknown as IFlectraNameValueFields;
	return data?.fields?.reduce((acc, record) => {
		return Object.assign(acc, { [record.fieldName]: record.fieldValue });
	}, {});
}

// function processResponseFields(value: IDataObject) {
// 	const data = value as unknown as IFlectraResponseFields;
// 	return data?.fields?.map((entry) => entry.field);
// }

export async function flectraJSONRPCRequest(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	body: IDataObject,
	url: string,
): Promise<IDataObject | IDataObject[]> {
	try {
		const options: OptionsWithUri = {
			headers: {
				'User-Agent': 'n8n',
				Connection: 'keep-alive',
				Accept: '*/*',
				'Content-Type': 'application/json',
			},
			method: 'POST',
			body,
			uri: `${url}/jsonrpc`,
			json: true,
		};

		const response = await this.helpers.request!(options);
		if (response.error) {
			throw new NodeApiError(this.getNode(), response.error.data, {
				message: response.error.data.message,
			});
		}
		return response.result;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function flectraGetModelFields(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	db: string,
	userID: number,
	password: string,
	resource: string,
	url: string,
) {
	try {
		const body = {
			jsonrpc: '2.0',
			method: 'call',
			params: {
				service: serviceJSONRPC,
				method: methodJSONRPC,
				args: [
					db,
					userID,
					password,
					mapFlectraResources[resource] || resource,
					'fields_get',
					[],
					['string', 'type', 'help', 'required', 'name'],
				],
			},
			id: Math.floor(Math.random() * 100),
		};

		const result = await flectraJSONRPCRequest.call(this, body, url);
		return result;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function flectraIsAddonInstalled(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
): Promise<boolean> {
	try {
		const credentials = await this.getCredentials('flectraApi');
		const url = credentials?.url as string;
		const username = credentials?.username as string;
		const password = credentials?.password as string;
		const db = flectraGetDBName(credentials?.db as string, url);
		const userID = await flectraGetUserID.call(this, db, username, password, url);

		const body = {
			jsonrpc: '2.0',
			method: 'call',
			params: {
				service: serviceJSONRPC,
				method: methodJSONRPC,
				args: [db, userID, password, 'ir.model', 'search_read', [['model', '=', 'base']], []],
			},
			id: Math.floor(Math.random() * 100),
		};

		const result = (await flectraJSONRPCRequest.call(this, body, url)) as IDataObject[];
		if (result?.length === 1 && result[0].hasOwnProperty('methods')) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		return false;
	}
}

export async function flectraGetActionMethods(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	db: string,
	userID: number,
	password: string,
	resource: string,
	url: string,
): Promise<string[] | undefined> {
	try {
		const body = {
			jsonrpc: '2.0',
			method: 'call',
			params: {
				service: serviceJSONRPC,
				method: methodJSONRPC,
				args: [
					db,
					userID,
					password,
					'ir.model',
					'search_read',
					[['model', '=', resource]],
					['methods'],
				],
			},
			id: Math.floor(Math.random() * 100),
		};

		const result = (await flectraJSONRPCRequest.call(this, body, url)) as IDataObject[];
		if (result?.length === 1 && result[0].hasOwnProperty('methods')) {
			const methods = result[0]['methods'];
			return methods as string[];
		} else {
			return undefined;
		}
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function flectraCreate(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	db: string,
	userID: number,
	password: string,
	resource: string,
	operation: FlectraCRUD,
	url: string,
	newItem: IDataObject,
) {
	try {
		const body = {
			jsonrpc: '2.0',
			method: 'call',
			params: {
				service: serviceJSONRPC,
				method: methodJSONRPC,
				args: [
					db,
					userID,
					password,
					mapFlectraResources[resource] || resource,
					mapOperationToJSONRPC[operation],
					newItem || {},
				],
			},
			id: Math.floor(Math.random() * 100),
		};

		const result = await flectraJSONRPCRequest.call(this, body, url);
		return { id: result };
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function flectraGet(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	db: string,
	userID: number,
	password: string,
	resource: string,
	operation: FlectraCRUD,
	url: string,
	itemsID: string,
	fieldsToReturn?: IDataObject[],
) {
	try {
		if (!/^\d+$/.test(itemsID) || !parseInt(itemsID, 10)) {
			throw new NodeApiError(this.getNode(), {
				status: 'Error',
				message: `Please specify a valid ID: ${itemsID}`,
			});
		}
		const body = {
			jsonrpc: '2.0',
			method: 'call',
			params: {
				service: serviceJSONRPC,
				method: methodJSONRPC,
				args: [
					db,
					userID,
					password,
					mapFlectraResources[resource] || resource,
					mapOperationToJSONRPC[operation],
					[+itemsID] || [],
					fieldsToReturn || [],
				],
			},
			id: Math.floor(Math.random() * 100),
		};

		const result = await flectraJSONRPCRequest.call(this, body, url);
		return result;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function flectraGetAll(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	db: string,
	userID: number,
	password: string,
	resource: string,
	operation: FlectraCRUD,
	url: string,
	filters?: IFlectraFilterOperations,
	fieldsToReturn?: IDataObject[],
	offset = 0,
	limit = 0,
) {
	try {
		const body = {
			jsonrpc: '2.0',
			method: 'call',
			params: {
				service: serviceJSONRPC,
				method: methodJSONRPC,
				args: [
					db,
					userID,
					password,
					mapFlectraResources[resource] || resource,
					mapOperationToJSONRPC[operation],
					(filters && processFilters(filters)) || [],
					fieldsToReturn || [],
					offset,
					limit,
				],
			},
			id: Math.floor(Math.random() * 100),
		};

		const result = await flectraJSONRPCRequest.call(this, body, url);
		return result;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function flectraUpdate(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	db: string,
	userID: number,
	password: string,
	resource: string,
	operation: FlectraCRUD,
	url: string,
	itemsID: string,
	fieldsToUpdate: IDataObject,
) {
	try {
		if (!Object.keys(fieldsToUpdate).length) {
			throw new NodeApiError(this.getNode(), {
				status: 'Error',
				message: `Please specify at least one field to update`,
			});
		}
		if (!/^\d+$/.test(itemsID) || !parseInt(itemsID, 10)) {
			throw new NodeApiError(this.getNode(), {
				status: 'Error',
				message: `Please specify a valid ID: ${itemsID}`,
			});
		}
		const body = {
			jsonrpc: '2.0',
			method: 'call',
			params: {
				service: serviceJSONRPC,
				method: methodJSONRPC,
				args: [
					db,
					userID,
					password,
					mapFlectraResources[resource] || resource,
					mapOperationToJSONRPC[operation],
					[+itemsID] || [],
					fieldsToUpdate,
				],
			},
			id: Math.floor(Math.random() * 100),
		};

		await flectraJSONRPCRequest.call(this, body, url);
		return { id: itemsID };
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function flectraWorkflow(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	db: string,
	userID: number,
	password: string,
	resource: string,
	customOperation: string,
	url: string,
	itemsID: string,
	arg: string,
) {
	try {
		if (!/^\d+$/.test(itemsID) || !parseInt(itemsID, 10)) {
			throw new NodeApiError(this.getNode(), {
				status: 'Error',
				message: `Please specify a valid ID: ${itemsID}`,
			});
		}
		arg = JSON.parse(arg);
		const body = {
			jsonrpc: '2.0',
			method: 'call',
			params: {
				service: 'object',
				method: 'execute_kw',
				args: [db, userID, password, resource, customOperation, [[+itemsID] || []], arg],
			},
			id: Math.floor(Math.random() * 100),
		};

		const result = await flectraJSONRPCRequest.call(this, body, url);
		return result;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function flectraDelete(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	db: string,
	userID: number,
	password: string,
	resource: string,
	operation: FlectraCRUD,
	url: string,
	itemsID: string,
) {
	if (!/^\d+$/.test(itemsID) || !parseInt(itemsID, 10)) {
		throw new NodeApiError(this.getNode(), {
			status: 'Error',
			message: `Please specify a valid ID: ${itemsID}`,
		});
	}
	try {
		const body = {
			jsonrpc: '2.0',
			method: 'call',
			params: {
				service: serviceJSONRPC,
				method: methodJSONRPC,
				args: [
					db,
					userID,
					password,
					mapFlectraResources[resource] || resource,
					mapOperationToJSONRPC[operation],
					[+itemsID] || [],
				],
			},
			id: Math.floor(Math.random() * 100),
		};

		await flectraJSONRPCRequest.call(this, body, url);
		return { success: true };
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function flectraGetUserID(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	db: string,
	username: string,
	password: string,
	url: string,
): Promise<number> {
	try {
		const body = {
			jsonrpc: '2.0',
			method: 'call',
			params: {
				service: 'common',
				method: 'login',
				args: [db, username, password],
			},
			id: Math.floor(Math.random() * 100),
		};
		const loginResult = await flectraJSONRPCRequest.call(this, body, url);
		return loginResult as unknown as number;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function flectraGetServerVersion(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	url: string,
) {
	try {
		const body = {
			jsonrpc: '2.0',
			method: 'call',
			params: {
				service: 'common',
				method: 'version',
				args: [],
			},
			id: Math.floor(Math.random() * 100),
		};
		const result = await flectraJSONRPCRequest.call(this, body, url);
		return result;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
