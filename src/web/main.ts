/// <reference path="tsd.d.ts" />
import bunyan = require('bunyan');
import config = require('./config');
import express = require('express');
import path = require('path');
import bodyParser = require('body-parser');
import util = require('util');
import favicon = require('serve-favicon');
import compression = require('compression');

import apiHandler = require('./api/api-handler');
import authMiddleware = require('./auth-middleware');
import DatabasePoolManager = require('./db-pools');
import session = require('./session');
import reqLogging = require('./logging');

var logger = bunyan.createLogger({
	name: 'donations-app',
	level: config.get('log-level')
});

logger.info('Initializing application');

var dbPools = new DatabasePoolManager(logger);
var app = express();

if (config.get('trust-proxy')) {
	logger.info('Trust proxy enabled');
	app.enable('trust proxy');
}

app.disable('x-powered-by');
app.use(reqLogging(logger));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(favicon(path.resolve(path.join(__dirname, '/res/images/favicon.png'))));
app.use(session.initializeSessions(logger));
app.use(authMiddleware.requestLogging);

app.get('/', (req: express.Request, res: express.Response, next: Function) => {
	sendResource(res, 'index.html');
});

app.use('/res', express.static(path.resolve(path.join(__dirname, 'res'))));

// Register the api route and all endpoints.
app.use('/api', apiHandler.createApi(logger, dbPools));

// 404 - Not found
// TODO: This should send JSON / Html based on the accept headers. Html as default
app.use((req: express.Request, res: express.Response, next: Function) => {
	res.status(404).send({ error: 'Resource not found' });
});

// The error handler should be last
app.use((err: any, req: express.Request, res: express.Response, next: Function) => {
	if (err) {
		// bodyParser will suggest a status when something goes wrong. This means we can send the proper status code back
		if (err.status) {
			res.status(err.status).send(util.inspect(err));
		} else {
			console.log(err);
			req.log.warn({ error: err }, 'Unhandled error occurred in a request');
			res.status(500).send(util.inspect(err));
		}
	} else {
		next();
	}
});

logger.info('Starting up. Trying to listen on  on %s:%d', config.get('ip'), config.get('port'));
app.listen(config.get('port'), config.get('ip'), () => {
	logger.info('Server is now ready to serve requests');
});

function sendResource(res: express.Response, fileName: string): void {
	var fullPath = path.resolve(path.join(path.join(__dirname, '/res/'), fileName));
	res.sendFile(fullPath);
}

