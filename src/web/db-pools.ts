/// <reference path="tsd.d.ts" />
import nodeMysql = require('../shared/node-mysql');
import mysql = require('mysql');
import config = require('./config');
import bunyan = require('bunyan');

class DatabasePoolManager {
	public rewardsPool: nodeMysql.MysqlPool;
	public donationsPool: nodeMysql.MysqlPool;
	public votesPool: nodeMysql.MysqlPool;

	constructor(logger: bunyan.Logger) {
		var rewardsConfig: mysql.IPoolConfig = {
			host: config.get('rewarder.db.host'),
			port: config.get('rewarder.db.port'),
			user: config.get('rewarder.db.username'),
			password: config.get('rewarder.db.password'),
			database: config.get('rewarder.db.database')
		};

		var donationsConfig: mysql.IPoolConfig = {
			host: config.get('donations.db.host'),
			port: config.get('donations.db.port'),
			user: config.get('donations.db.username'),
			password: config.get('donations.db.password'),
			database: config.get('donations.db.database')
		};

		var votesConfig: mysql.IPoolConfig = {
			host: config.get('votes.db.host'),
			port: config.get('votes.db.port'),
			user: config.get('votes.db.username'),
			password: config.get('votes.db.password'),
			database: config.get('votes.db.database')
		};

		this.rewardsPool = nodeMysql.createPool(rewardsConfig, logger);
		this.donationsPool = nodeMysql.createPool(donationsConfig, logger);
		this.votesPool = nodeMysql.createPool(votesConfig, logger);
	}
}

export = DatabasePoolManager;
