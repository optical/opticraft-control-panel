/// <reference path="tsd.d.ts" />
import DatabasePoolManager = require('../db-pools');
import express =  require('express');
import bunyan = require('bunyan');

import rewardHandler = require('./reward-handler');
import productsHandler = require('./products-handler');
import votersHandler = require('./voters-handler');
import authHandler = require('./auth-handler');

export function createApi(logger: bunyan.Logger, dbPools: DatabasePoolManager): express.Router {
	var router = express.Router();

	rewardHandler.setup(router, dbPools);
	productsHandler.setup(router, dbPools);
	votersHandler.setup(router, dbPools);
	authHandler.setup(logger, router, dbPools);
	return router;
}
