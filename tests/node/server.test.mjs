import test from 'node:test';
import assert from 'node:assert/strict';

import {
	buildPublicUrl,
	formatRequestLogMessage,
	FUNNEL_PORT_CHOICES,
	hasUsableConfig,
	getRequestSource,
	parseBooleanEnv,
	parseEnvFile,
	parseNumberOrFallback,
	PLUGIN_RELEASES_URL,
} from '../../local/server.mjs';

test( 'parseEnvFile parses quoted values and ignores comments', () => {
	const env = parseEnvFile( `
# Comment
PORT="13531"
BACKEND_URL='http://localhost:11434'
NO_TUNNEL=1
` );

	assert.deepEqual( env, {
		PORT: '13531',
		BACKEND_URL: 'http://localhost:11434',
		NO_TUNNEL: '1',
	} );
} );

test( 'buildPublicUrl omits port 443 and includes non-default public ports', () => {
	assert.equal( buildPublicUrl( 'wiebook.tail7a347e.ts.net', 443 ), 'https://wiebook.tail7a347e.ts.net' );
	assert.equal( buildPublicUrl( 'wiebook.tail7a347e.ts.net', 8443 ), 'https://wiebook.tail7a347e.ts.net:8443' );
} );

test( 'default funnel choice is 8443', () => {
	assert.equal( FUNNEL_PORT_CHOICES[0].port, 8443 );
	assert.equal( FUNNEL_PORT_CHOICES[0].label, '8443 (default)' );
} );

test( 'hasUsableConfig requires backend URL and API key', () => {
	assert.equal( hasUsableConfig( { backendUrl: 'http://localhost:11434', apiKey: 'secret' } ), true );
	assert.equal( hasUsableConfig( { backendUrl: '', apiKey: 'secret' } ), false );
	assert.equal( hasUsableConfig( { backendUrl: 'http://localhost:11434', apiKey: '' } ), false );
} );

test( 'parseBooleanEnv and parseNumberOrFallback normalize persisted values', () => {
	assert.equal( parseBooleanEnv( '1' ), true );
	assert.equal( parseBooleanEnv( 'true' ), true );
	assert.equal( parseBooleanEnv( '0' ), false );
	assert.equal( parseNumberOrFallback( '13531', 1 ), 13531 );
	assert.equal( parseNumberOrFallback( 'not-a-number', 8443 ), 8443 );
} );

test( 'getRequestSource prefers forwarded headers and includes host context', () => {
	const req = {
		headers: {
			'x-forwarded-for': '203.0.113.10, 10.0.0.1',
			origin: 'https://example.com',
		},
		socket: {
			remoteAddress: '::ffff:127.0.0.1',
		},
	};

	assert.equal( getRequestSource( req ), 'example.com (203.0.113.10)' );
} );

test( 'formatRequestLogMessage includes status, method, path, and source', () => {
	const req = {
		method: 'POST',
		url: '/v1/chat/completions',
		headers: {
			host: 'wiebook.tail7a347e.ts.net:8443',
		},
		socket: {
			remoteAddress: '::ffff:198.51.100.25',
		},
	};

	const message = formatRequestLogMessage( req, 200 );

	assert.match( message, /\] 200 POST \/v1\/chat\/completions from wiebook\.tail7a347e\.ts\.net:8443 \(198\.51\.100\.25\)$/ );
} );

test( 'plugin releases URL points to the GitHub latest release page', () => {
	assert.equal( PLUGIN_RELEASES_URL, 'https://github.com/mattwiebe/ai-connector-for-local-ai/releases/latest' );
} );
