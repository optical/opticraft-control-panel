/// <reference path="tsd.d.ts" />
import ko = require('knockout');
import rest = require('rest');

import restClient = require('../rest-client');
import ProductResponse = require('../../shared/model/product-response');

interface LastRequest {
	playerName: string;
	reward: string;
}

class RewardSenderViewModel {

	selectedProduct: KnockoutObservable<ProductResponse>;
	username: KnockoutObservable<string>;
	requestInFlight: KnockoutObservable<boolean>;
	lastRequest: KnockoutObservable<LastRequest>;
	lastRequestMessage: KnockoutObservable<string>;

	constructor(public products: KnockoutObservableArray<ProductResponse>) {
		this.selectedProduct = ko.observable(null);
		this.username = ko.observable('');
		this.requestInFlight = ko.observable(false);
		this.lastRequest = ko.observable(null).extend({ notify: 'always' });
		// This shouldn't really be here.
		this.lastRequestMessage = ko.computed(() => {
			if (this.lastRequest()) {
				return 'Sent ' + this.lastRequest().playerName + ' ' + this.lastRequest().reward;
			} else {
				return '';
			}
		});
	}

	performRequest(arg: string | rest.Request): rest.ResponsePromise {
		this.requestInFlight(true);
		var promise = restClient(arg);
		promise.finally(() => this.requestInFlight(false));
		return promise;
	}

	sendReward(): void {
		var entity = {
			playerName: this.username(),
			reward: this.selectedProduct().productId
		};
		var restRequest: rest.Request = {
			method: 'POST',
			path: 'api/reward',
			entity: entity
		};

		// TODO: handle errors!
		this.performRequest(restRequest).then(() => this.lastRequest(entity));
	}
}

export = RewardSenderViewModel;
