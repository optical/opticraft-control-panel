/// <reference path="tsd.d.ts" />
import _ = require('lodash');
import nodeMysql = require('./node-mysql');
import when = require('when');

export interface UserVoteSummary {
	username: string;
	votes: number;
}

export interface VotePeriods {
	years: {
		year: number;
		months: number[];
	}[]
}

export function getVotePeriods(connection: nodeMysql.MysqlConnection | nodeMysql.MysqlPool): when.Promise<VotePeriods> {
	var query = 'SELECT year, month ' +
		'FROM vote_logs ' +
		'GROUP BY month, year ' +
		'ORDER BY year ASC, month ASC';


	return connection.query(query).then((results: nodeMysql.ResultSet) => {
		var grouped = _.groupBy(results.rows, (row => row.year));
		return {
			years: _.map(_.keys(grouped), (key) => {
				return {
					year: parseInt(key, 10),
					months: _.map(grouped[key], (grouping) => grouping.month)
				};
			})
		};
	});
}

export function getTopVoters(connection: nodeMysql.MysqlConnection | nodeMysql.MysqlPool, month: Date, limit: number): when.Promise<UserVoteSummary[]> {
	var query: string = 'SELECT `Username` as `username`, COUNT(*) as `count` ' +
		'FROM `vote_logs` ' +
		'WHERE `month` = ? ' +
		'AND `year` = ? ' +
		'GROUP BY `Username` ' +
		'ORDER BY COUNT(*) DESC ' +
		'LIMIT ?';

	return connection.query(query, [month.getMonth() + 1, month.getFullYear(), limit]).then((results: nodeMysql.ResultSet) => {
		return _.map(results.rows, parseVoteSummary);
	});
}

function parseVoteSummary(row: any): UserVoteSummary {
	return {
		username: row.username,
		votes: row.count
	};
}
