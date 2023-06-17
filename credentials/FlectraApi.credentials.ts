import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class FlectraApi implements ICredentialType {
	name = 'flectraApi';
	displayName = 'Flectra API';
	properties: INodeProperties[] = [
		{
			displayName: 'Site URL',
			name: 'url',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Password or API Key',
			name: 'password',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			required: true,
		},
		{
			displayName: 'Database Name',
			name: 'db',
			type: 'string',
			default: '',
		},
	];
}
