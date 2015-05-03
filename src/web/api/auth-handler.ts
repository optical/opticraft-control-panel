/// <reference path="tsd.d.ts" />
import DatabasePoolManager = require('../db-pools');
import express =  require('express');
import nodefn = require('when/node');
import bunyan = require('bunyan');
import fs = require('fs');

import authMiddleware = require('../auth-middleware');
import config = require('../config');

import AuthenticationResponse = require('../../shared/model/authentication-response');
import LoginRequest = require('../../shared/model/login-request');

// Temporary solution - store users in a file.
// TODO: Hook this up to SMF, minecraft or something else

interface UserFile {
	[key: string]: string;
}
var userFile: UserFile;

function loadUserFile(logger: bunyan.Logger): void {
	try {
		var filePath = config.get('user-file');
		logger.debug('Loading userfile from: ' + filePath);
		userFile = <UserFile>JSON.parse(fs.readFileSync(filePath, 'utf8'));
	} catch (err) {
		logger.warn('Failed to load userfile.', err);
		userFile = {};
	}
}

export function setup(logger: bunyan.Logger, router: express.Router, dbPools: DatabasePoolManager): void {

	loadUserFile(logger);

	router.get('/auth', authMiddleware.ensureAuthenticated, (req: express.Request, res: express.Response, next: Function) => {
		sendAuthResponse(res, authMiddleware.getAuthDetails(req));
	});

	router.post('/auth', (req: express.Request, res: express.Response, next: Function) => {
		var existingLogin = authMiddleware.getAuthDetails(req);
		if (existingLogin) {
			res.status(400).send({message: 'Already logged in as ' + existingLogin.username});
		} else {
			var loginRequest: LoginRequest = req.body;
			if (!loginRequest.username || !loginRequest.password) {
				res.status(400).send({message: 'Must supply both a username and password'});
			} else {

				if (!validLogin(loginRequest.username, loginRequest.password)) {
					res.status(400).send({ message: 'Invalid username or password' });
				} else {
					var authDetails: authMiddleware.SessionAuthDetails = {
						username: loginRequest.username
					};

					authMiddleware.setAuthDetails(req, authDetails);
					sendAuthResponse(res, authDetails);
				}
			}
		}
	});

	router.delete('/auth', authMiddleware.ensureAuthenticated, (req: express.Request, res: express.Response, next: Function) => {
		nodefn.call(req.session.destroy.bind(req.session)).then(() => {
			res.send({ message: 'Successfully logged out' });
		}).catch((err) => next(err));
	});


	function sendAuthResponse(res: express.Response, authDetails: authMiddleware.SessionAuthDetails): void {
		var response: AuthenticationResponse = {
			username: authDetails.username
		};
		res.send(response);
	}
}

export function validLogin(login: string, password: string): boolean {
	var actualPassword = userFile[login.toLowerCase()];
	return password === actualPassword;
}
