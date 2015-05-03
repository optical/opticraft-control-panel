/// <reference path="tsd.d.ts" />
import ko = require('knockout');
import _ = require('lodash');
import moment = require('moment');
import rest = require('rest');

import restClient = require('../rest-client');
import VotersResponse = require('../../shared/model/voters-response');
import VotePeriodResponse = require('../../shared/model/vote-period-response');

class TopVoter {
	rank: KnockoutObservable<number>;
	username: KnockoutObservable<string>;
	votes: KnockoutObservable<number>;

	constructor(rank: number, username: string, votes: number) {
		this.rank = ko.observable(rank);
		this.username = ko.observable(username);
		this.votes = ko.observable(votes);
	}
}

interface VoteMonth {
	month: number;
	prettyMonth: string;
}

class VoteYear {
	year: number;
	months: KnockoutObservableArray<VoteMonth>;

	constructor(year: number, months: number[]) {
		this.year = year;
		this.months = ko.observableArray(_.map(months, (month) => {
			return {
				month: month,
				prettyMonth: moment({ year: year, month: month - 1 }).format('MMMM')
			};
		}));
	}
}

class TopVotersViewModel {
	availableYears: KnockoutObservableArray<VoteYear>;
	topVoters: KnockoutObservableArray<TopVoter>;
	selectedYear: KnockoutObservable<VoteYear>;
	selectedMonth: KnockoutObservable<VoteMonth>;
	year: KnockoutComputed<number>;
	month: KnockoutComputed<number>;

	requestsInFlight: KnockoutObservable<number>;
	refresh: KnockoutComputed<void>;

	constructor() {
		this.topVoters = ko.observableArray<TopVoter>();
		this.selectedMonth = ko.observable(null);
		this.selectedYear = ko.observable(null).extend({ rateLimit: 0 });
		this.requestsInFlight = ko.observable(0);
		this.year = ko.pureComputed(() => {
			return this.selectedYear() ?  this.selectedYear().year : null;
		});
		this.month = ko.pureComputed(() => {
			return this.selectedMonth() ? this.selectedMonth().month : null;
		});
		this.availableYears = ko.observableArray<VoteYear>();
		this.selectedYear.subscribe((newYear) => {
			if (newYear) {
				setTimeout(() => this.selectedMonth(_.last(newYear.months())), 0);
			}
		});
		this.setupRefresh();
		this.loadVotePeriods();
	}

	loadVotePeriods(): void {
		this.performRequest('/api/voters').then((res) => {
			this.availableYears.removeAll();

			var votePeriodResponse: VotePeriodResponse = res.entity;
			_.forEach(votePeriodResponse.years, (year) => {
				this.availableYears.push(new VoteYear(year.year, year.months));
			});
			if (this.availableYears().length > 0) {
				this.selectedYear(_.last(this.availableYears()));
			}
		});
	}

	// Extreme caution: Do not invoke this inside a computed - you'll end up in an infinite loop :(
	performRequest(arg: string | rest.Request): rest.ResponsePromise {
		this.requestsInFlight(this.requestsInFlight() + 1);
		var promise = restClient(arg);
		promise.finally(() => this.requestsInFlight(this.requestsInFlight() - 1));
		return promise;
	}

	setupRefresh(): void {
		this.refresh = ko.computed(() => {
			if (this.year() && this.month()) {
				// Invoke outside of the function - otherwise we end up in an infinite loop. Crikey
				setTimeout(() => this.performRequest({
					path: '/api/voters/{year}/{month}',
					params: {
						year: this.year().toString(),
						month: this.month().toString()
					}
				}).then((res) => {
					this.topVoters.removeAll();
					var votersResponse: VotersResponse = res.entity;
					var rank = 0;
					var previousVotes = 0;
					for (var i = 0; i < votersResponse.result.length; i++) {
						var vote = votersResponse.result[i];
						if (vote.votes !== previousVotes) {
							rank = i;
						}
						this.topVoters.push(new TopVoter(rank + 1, vote.username, vote.votes));
						previousVotes = vote.votes;
					}
				}), 0);
			}
		}).extend({ rateLimit: 10 });
	}
}

export = TopVotersViewModel;

