/// <reference path="tsd.d.ts" />
import DatabasePoolManager = require('../db-pools');
import express =  require('express');

import donations = require('../donations');

import ProductResponse = require('../../shared/model/product-response');

export function setup(app: express.Router, dbPools: DatabasePoolManager): void {

	app.get('/products', (req: express.Request, res: express.Response, next: Function) => {
		req.log.info('Handling request for all products');
		dbPools.donationsPool.getConnection().then((connection) => {
			return donations.getProducts(connection).then((donations) => {
				var response: ProductResponse[] = donations;
				res.json(response);
			}).finally(() => connection.release());
		}).catch((err) => next(err));
	});

	app.get('/products/:id', (req: express.Request, res: express.Response, next: Function) => {
		req.log.info('Handling request for product', { productId: req.params.id });
		dbPools.donationsPool.getConnection().then((connection) => {
			donations.getProduct(connection, req.params.id).then((product) => {
				if (product) {
					var response: ProductResponse = product;
					res.json(response);
				} else {
					res.status(404).json({
						error: 'No such product'
					});
				}
			}).finally(() => connection.release());
		}).catch((err) => next(err));
	});
}
