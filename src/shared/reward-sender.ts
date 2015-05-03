/// <reference path="../tsd.d.ts" />
import when = require('when');

import nodeMysql = require('./node-mysql');

export interface RewardInformation {
	player: string;
	rewards: string[];
}

export function sendReward(connection: nodeMysql.MysqlConnection | nodeMysql.MysqlPool, information: RewardInformation): when.Promise<{}> {
	var query =
		'INSERT INTO `pendingrewards` (`PlayerName`, `Reward_0`, `Reward_1`, `Reward_2`, `Reward_3`, `Reward_4`) VALUES(?, ?, ?, ?, ?, ?);';

	var params: string[] = [information.player].concat(information.rewards);
	for (var i: number = params.length; i < 6; i++) {
		params[i] = '';
	}

	return connection.query(query, params);
}
