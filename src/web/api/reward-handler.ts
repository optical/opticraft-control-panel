/// <reference path="tsd.d.ts" />
import DatabasePoolManager = require('../db-pools');
import express =  require('express');
import util = require('util');

import authMiddleware = require('../auth-middleware');
import donations = require('../donations');
import rewardSender = require('../reward-sender');
import mailer = require('../mailer');

interface RewardRequest {
	playerName: string;
	reward: string;
};

export function setup(app: express.Router, dbPools: DatabasePoolManager): void {

	app.post('/reward', authMiddleware.ensureAuthenticated, (req: express.Request, res: express.Response, next: Function) => {
		var request: RewardRequest = req.body;
		if (!request || !request.playerName || !request.reward) {
			res.status(400);
			res.end();
		} else {
			donations.getProduct(dbPools.donationsPool, request.reward).then((product) => {
				if (!product) {
					req.log.debug('Product did not exist');
					res.status(400).json({ error: 'No such product' });
				} else {
					var rewardInfo: rewardSender.RewardInformation = {
						player: request.playerName,
						rewards: product.rewardStrings
					};
					return rewardSender.sendReward(dbPools.rewardsPool, rewardInfo);
				}
			}).then(() => res.send({ Message: 'Reward sent successfully' }))
				.then(() =>  {
					var sender = authMiddleware.getAuthDetails(req).username;
					req.log.info(util.format('%s rewarded %s with %s', sender, request.playerName, request.reward),
						{ recipient: request.playerName, reward: request.reward });

					var subject = util.format('%s sent %s %s', sender, request.playerName, request.reward);
					var message = util.format('Sent from IP: %s', req.ip);
					mailer.sendNotification(subject, message).catch((err) => req.log.error('Failed to send notification email', err));

				}).catch((err) => next(err));
		}
	});
}
