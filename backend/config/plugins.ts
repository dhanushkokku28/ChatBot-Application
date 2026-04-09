import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
	'users-permissions': {
		config: {
			providers: {
				google: {
					enabled: true,
					key: env('GOOGLE_CLIENT_ID', ''),
					secret: env('GOOGLE_CLIENT_SECRET', ''),
					callback: `${env('STRAPI_URL', 'http://localhost:1337')}/api/connect/google/callback`,
					scope: ['email', 'profile'],
				},
				facebook: {
					enabled: true,
					key: env('FACEBOOK_APP_ID', ''),
					secret: env('FACEBOOK_APP_SECRET', ''),
					callback: `${env('STRAPI_URL', 'http://localhost:1337')}/api/connect/facebook/callback`,
					scope: ['email', 'public_profile'],
				},
			},
		},
	},
});

export default config;
