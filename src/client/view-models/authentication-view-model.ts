/// <reference path="tsd.d.ts" />
import ko = require('knockout');

import restClient = require('../rest-client');
import AuthenticationResponse = require('../../shared/model/authentication-response');
import LoginRequest = require('../../shared/model/login-request');

class AuthenticationViewModel {
	username: KnockoutObservable<string>;
	requestInFlight: KnockoutObservable<boolean>;
	errorMessage: KnockoutObservable<string>;

	loggedIn: KnockoutComputed<boolean>;

	usernameField: KnockoutObservable<string>;
	passwordField: KnockoutObservable<string>;

	loading: KnockoutObservable<boolean>;

	constructor() {
		this.username = ko.observable(null);
		this.requestInFlight = ko.observable(false);
		this.errorMessage = ko.observable(null);
		this.usernameField = ko.observable(null);
		this.passwordField = ko.observable(null);
		this.loading = ko.observable(true);

		this.loggedIn = ko.pureComputed(() => this.username() !== null);
		this.checkAuth();
	}

	login(): boolean {
		var loginRequest: LoginRequest = {
			username: this.usernameField(),
			password: this.passwordField()
		};

		restClient({
			method: 'post',
			path: '/api/auth',
			entity: loginRequest
		}).then((res) => {
			var authResponse: AuthenticationResponse = res.entity;
			this.setAuthDetails(authResponse);
		}).catch((err) => {
			if (err.status.code >= 400 && err.status.code < 500) {
				this.errorMessage(err.entity.message);
			} else {
				throw err;
			}
		}).finally(() => this.requestInFlight(false));

		this.requestInFlight(true);

		return false;
	}

	logout(): void {
		restClient({
			method: 'delete',
			path: '/api/auth',
			entity: {}
		}).then(() => {
			this.username(null);
		});
	}

	checkAuth(): void {
		restClient('/api/auth/').then((res) => {
			var authResponse: AuthenticationResponse = res.entity;
			this.setAuthDetails(authResponse);
		}).catch((err) => {
			if (err.status.code === 401) {
				this.username(null);
			} else {
				throw err;
			}
		}).finally(() => this.loading(false));
	}

	setAuthDetails(authResponse: AuthenticationResponse): void {
		this.username(authResponse.username);
		this.errorMessage(null);
		this.usernameField(null);
		this.passwordField(null);
	}
}

export = AuthenticationViewModel;
