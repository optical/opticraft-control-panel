/// <reference path="tsd.d.ts" />
import DatabasePoolManager = require('../db-pools');
import express =  require('express');

import voteHelper = require('../votes-helper');

import VotersResponse = require('../../shared/model/voters-response');
import VotePeriodResponse = require('../../shared/model/vote-period-response');

export function setup(app: express.Router, dbPools: DatabasePoolManager): void {
	app.get('/voters', (req: express.Request, res: express.Response, next: Function) => {

		voteHelper.getVotePeriods(dbPools.votesPool).then((periods) => {
			var votePeriodResponse: VotePeriodResponse = periods;
			res.send(votePeriodResponse);

		}).catch((err) => next(err));
	});

	app.get('/voters/:year/:month', (req: express.Request, res: express.Response, next: Function) => {
		var year = req.params.year;
		var month = req.params.month;

		var date = new Date(year, month - 1);
		if (!isNaN(date.getTime()) && month <= 12 && month > 0) {
			voteHelper.getTopVoters(dbPools.votesPool, date, 10).then((voters) => {
				var response: VotersResponse = {
					result: voters
				};
				res.json(response);
			}).catch((err) => next(err));
		} else {
			res.status(400).json({ error: 'Invalid date' });
		}
	});
}
