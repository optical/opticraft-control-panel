/// <reference path="api/tsd.d.ts" />
import express =  require('express');

export interface SessionAuthDetails {
	username: string;
}

var authKey = 'auth-key';

export function requestLogging(req: express.Request, res: express.Response, next: Function) {
	var details = getAuthDetails(req);
	req.log = req.log.child({ auth: details });

	next();
}

export function ensureAuthenticated(req: express.Request, res: express.Response, next: Function) {
	if (!req.session[authKey]) {
		res.status(401).send({ message: 'Authentication required' });
	} else {
		next();
	}
}

export function getAuthDetails(req: express.Request): SessionAuthDetails {
	return req.session ? req.session[authKey] : null;
}

export function setAuthDetails(req: express.Request, authDetails: SessionAuthDetails): void {
	req.session[authKey] = authDetails;
}
