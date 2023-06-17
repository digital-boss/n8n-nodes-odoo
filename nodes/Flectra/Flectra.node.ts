import { IExecuteFunctions } from 'n8n-core';
import { OptionsWithUri } from 'request';

import {
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeCredentialTestResult,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';

import {
	IFlectraFilterOperations,
	flectraCreate,
	flectraDelete,
	flectraGet,
	flectraGetActionMethods,
	flectraGetAll,
	flectraGetDBName,
	flectraGetModelFields,
	flectraGetUserID,
	flectraIsAddonInstalled,
	flectraJSONRPCRequest,
	flectraUpdate,
	flectraWorkflow,
	processNameValueFields,
} from './GenericFunctions';
import { resourceDescription, resourceOperations } from './ResourceDescription';

export class Flectra implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Flectra',
		name: 'flectra',
		icon: 'file:flectra.svg',
		group: ['transform'],
		version: 1,
		description: 'Consume Flectra API',
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		defaults: {
			name: 'Flectra',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'flectraApi',
				required: true,
				testedBy: 'flectraApiTest',
			},
		],
		properties: [...resourceOperations, ...resourceDescription],
	};

	methods = {
		loadOptions: {
			async getModelFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				let resource;
				resource = this.getCurrentNodeParameter('resource') as string;
				if (!resource) {
					return [];
				}

				const credentials = await this.getCredentials('flectraApi');
				const url = credentials?.url as string;
				const username = credentials?.username as string;
				const password = credentials?.password as string;
				const db = flectraGetDBName(credentials?.db as string, url);
				const userID = await flectraGetUserID.call(this, db, username, password, url);

				const response = await flectraGetModelFields.call(
					this,
					db,
					userID,
					password,
					resource,
					url,
				);

				const options = Object.entries(response).map(([k, v]) => {
					const optionField = v as { [key: string]: string };
					return {
						name: optionField.string,
						value: k,
						// nodelinter-ignore-next-line
						description: `name: ${optionField?.string}, type: ${optionField?.type} required: ${optionField?.required}`,
					};
				});

				return options.sort((a, b) => a.name?.localeCompare(b.name) || 0);
			},
			async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
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
						service: 'object',
						method: 'execute',
						args: [
							db,
							userID,
							password,
							'ir.model',
							'search_read',
							[],
							['name', 'model', 'modules'],
						],
					},
					id: Math.floor(Math.random() * 100),
				};

				const response = (await flectraJSONRPCRequest.call(this, body, url)) as IDataObject[];

				const options = response.map((model) => {
					return {
						name: model.name,
						value: model.model,
						description: `model: ${model.model}<br> modules: ${model.modules}`,
					};
				});
				return options as INodePropertyOptions[];
			},
			async getStates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
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
						service: 'object',
						method: 'execute',
						args: [db, userID, password, 'res.country.state', 'search_read', [], ['id', 'name']],
					},
					id: Math.floor(Math.random() * 100),
				};

				const response = (await flectraJSONRPCRequest.call(this, body, url)) as IDataObject[];

				const options = response.map((state) => {
					return {
						name: state.name as string,
						value: state.id,
					};
				});
				return options.sort((a, b) => a.name?.localeCompare(b.name) || 0) as INodePropertyOptions[];
			},
			async getCountries(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
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
						service: 'object',
						method: 'execute',
						args: [db, userID, password, 'res.country', 'search_read', [], ['id', 'name']],
					},
					id: Math.floor(Math.random() * 100),
				};

				const response = (await flectraJSONRPCRequest.call(this, body, url)) as IDataObject[];

				const options = response.map((country) => {
					return {
						name: country.name as string,
						value: country.id,
					};
				});

				return options.sort((a, b) => a.name?.localeCompare(b.name) || 0) as INodePropertyOptions[];
			},
			async getActions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				let resource;
				resource = this.getCurrentNodeParameter('resource') as string;
				if (!resource) {
					return [];
				}

				const credentials = await this.getCredentials('flectraApi');
				const url = credentials?.url as string;
				const username = credentials?.username as string;
				const password = credentials?.password as string;
				const db = flectraGetDBName(credentials?.db as string, url);
				const userID = await flectraGetUserID.call(this, db, username, password, url);

				const response = await flectraGetActionMethods.call(
					this,
					db,
					userID,
					password,
					resource,
					url,
				);

				if (response) {
					const options = response.map((x) => {
						return {
							name: x,
							value: x,
						};
					});

					return options;
				} else {
					return [];
				}
			},
			async getOperations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const operations = [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new item',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an item',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get an item',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get all items',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an item',
					},
				];

				const installed = await flectraIsAddonInstalled.call(this);

				if (installed) {
					operations.push({
						name: 'Workflow',
						value: 'workflow',
						description: 'Trigger a workflow action',
					});
				}

				return operations;
			},
		},
		credentialTest: {
			async flectraApiTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const credentials = credential.data;

				try {
					const body = {
						jsonrpc: '2.0',
						method: 'call',
						params: {
							service: 'common',
							method: 'login',
							args: [
								flectraGetDBName(credentials?.db as string, credentials?.url as string),
								credentials?.username,
								credentials?.password,
							],
						},
						id: Math.floor(Math.random() * 100),
					};

					const options: OptionsWithUri = {
						headers: {
							'User-Agent': 'n8n',
							Connection: 'keep-alive',
							Accept: '*/*',
							'Content-Type': 'application/json',
						},
						method: 'POST',
						body,
						uri: `${(credentials?.url as string).replace(/\/$/, '')}/jsonrpc`,
						json: true,
					};
					const result = await this.helpers.request!(options);
					if (result.error || !result.result) {
						return {
							status: 'Error',
							message: `Credentials are not valid`,
						};
					} else if (result.error) {
						return {
							status: 'Error',
							message: `Credentials are not valid: ${result.error.data.message}`,
						};
					}
				} catch (error) {
					return {
						status: 'Error',
						message: `Settings are not valid: ${error}`,
					};
				}
				return {
					status: 'OK',
					message: 'Authentication successful!',
				};
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		let items = this.getInputData();
		items = JSON.parse(JSON.stringify(items));
		const returnData: IDataObject[] = [];
		let responseData;

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('flectraApi');
		const url = (credentials?.url as string).replace(/\/$/, '');
		const username = credentials?.username as string;
		const password = credentials?.password as string;
		const db = flectraGetDBName(credentials?.db as string, url);
		const userID = await flectraGetUserID.call(this, db, username, password, url);

		//----------------------------------------------------------------------
		//                            Main loop
		//----------------------------------------------------------------------

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'create') {
					const fields = this.getNodeParameter('fieldsToCreateOrUpdate', i) as IDataObject;
					responseData = await flectraCreate.call(
						this,
						db,
						userID,
						password,
						resource,
						operation,
						url,
						processNameValueFields(fields),
					);
				}

				if (operation === 'delete') {
					const id = this.getNodeParameter('id', i) as string;
					responseData = await flectraDelete.call(
						this,
						db,
						userID,
						password,
						resource,
						operation,
						url,
						id,
					);
				}

				if (operation === 'get') {
					const id = this.getNodeParameter('id', i) as string;
					const options = this.getNodeParameter('options', i) as IDataObject;
					const fields = (options.fieldsList as IDataObject[]) || [];
					responseData = await flectraGet.call(
						this,
						db,
						userID,
						password,
						resource,
						operation,
						url,
						id,
						fields,
					);
				}

				if (operation === 'getAll') {
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					const options = this.getNodeParameter('options', i) as IDataObject;
					const fields = (options.fieldsList as IDataObject[]) || [];
					const filter = this.getNodeParameter('filterRequest', i) as IFlectraFilterOperations;
					if (returnAll) {
						responseData = await flectraGetAll.call(
							this,
							db,
							userID,
							password,
							resource,
							operation,
							url,
							filter,
							fields,
						);
					} else {
						const offset = this.getNodeParameter('offset', i) as number;
						const limit = this.getNodeParameter('limit', i) as number;
						responseData = await flectraGetAll.call(
							this,
							db,
							userID,
							password,
							resource,
							operation,
							url,
							filter,
							fields,
							offset,
							limit,
						);
					}
				}

				if (operation === 'update') {
					const id = this.getNodeParameter('id', i) as string;
					const fields = this.getNodeParameter('fieldsToCreateOrUpdate', i) as IDataObject;
					responseData = await flectraUpdate.call(
						this,
						db,
						userID,
						password,
						resource,
						operation,
						url,
						id,
						processNameValueFields(fields),
					);
				}

				if (operation === 'workflow') {
					const id = this.getNodeParameter('id', i) as string;
					const args = this.getNodeParameter('args', i) as string;
					const customOperation = this.getNodeParameter('customOperation', i) as string;
					responseData = await flectraWorkflow.call(
						this,
						db,
						userID,
						password,
						resource,
						customOperation,
						url,
						id,
						args,
					);
				}

				if (Array.isArray(responseData)) {
					returnData.push.apply(returnData, responseData);
				} else if (responseData !== undefined) {
					returnData.push(responseData);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: (error as JsonObject).message });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
