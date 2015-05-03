/// <reference path="tsd.d.ts" />
import express = require('express');
import session = require('express-session');
import bunyan = require('bunyan');

import config = require('./config');

var RedisStore = require('connect-redis')(session);

export function initializeSessions(logger:  bunyan.Logger): express.RequestHandler {
	if (!config.get('session.secret')) {
		throw new Error('session-secret must be set in configuration, or passed via commandline');
	}

	var store: any;

	if (config.get('session.store') === 'memory') {
		logger.warn('Using memory store for sessions');
		store = new session.MemoryStore();
	} else if (config.get('session.store') === 'redis') {
		var redisOptions = {
			host: config.get('redis.ip'),
			port: config.get('redis.port')
		};
		logger.info({ redis: redisOptions }, 'Using redis for session store');
		store = new RedisStore(redisOptions);
	} else {
		throw new Error('Unable to create session store: ' + config.get('session.store'));
	}

	return session({
		name: 'opticraft-session',
		secret: config.get('session.secret'),
		resave: false,
		rolling: true,
		saveUninitialized: false,
		store: store,
		cookie: {
			path: '/',
			httpOnly: true,
			secure: false,
			maxAge: config.get('session.expiry-hours') * 3600 * 1000
		}
	});
}
