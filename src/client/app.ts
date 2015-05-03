/// <reference path="tsd.d.ts" />
import $ = require('jquery');
// This sucks...
(<any>window).jQuery = $;
require('bootstrap');

import ko = require('knockout');
// load all our custom bindings
require('./bindings/custom-bindings');

import _ = require('lodash');
import URI = require('URIjs');

import restClient = require('./rest-client');

import AuthenticationViewModel = require('./view-models/authentication-view-model');
import TopVotersViewModel = require('./view-models/top-voters-view-model');
import RewardSenderViewModel = require('./view-models/reward-sender-view-model');

import productsHelper = require('./products-helper');

// Setup the rest client so API requests go the correct URL
var script = _.last($('script'));
var root = new URI(script.src).filename('../');
restClient.initialize(root);

class MainPageViewModel {
	authInfo: KnockoutObservable<AuthenticationViewModel>;
	topVoters: TopVotersViewModel;
	rewardSender: RewardSenderViewModel;
	products: KnockoutObservableArray<productsHelper.ProductResponse>;

	constructor() {
		this.products = ko.observableArray<productsHelper.ProductResponse>();
		this.loadProducts();
		this.authInfo = ko.observable(new AuthenticationViewModel());
		this.topVoters = new TopVotersViewModel();
		this.rewardSender = new RewardSenderViewModel(this.products);
	}

	loadProducts() {
		productsHelper.fetchProducts().then((products) => {
			_.forEach(products, (product) => this.products.push(product));
		});
	}
}

$(document).ready(function() {
	ko.applyBindings(new MainPageViewModel());
});
