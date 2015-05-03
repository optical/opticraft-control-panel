/// <reference path="tsd.d.ts" />
import bunyan = require('bunyan');
import express = require('express');

function setup(logger: bunyan.Logger): express.RequestHandler {
	function logRequest(req: express.Request, res: express.Response, next: Function): void {
		req.log = logger.child({ method: req.method, path: req.path, ip: req.ip, UA: req.user});
		var start = Date.now();
		req.log.debug('Handling request');
		res.on('finish', () => {
			var duration = Date.now() - start;
			req.log.info('Finished handling request', { duration: duration, code: res.statusCode });
		});
		next();
	}

	return logRequest;
}

export = setup;
