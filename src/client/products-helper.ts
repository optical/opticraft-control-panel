/// <reference path="view-models/tsd.d.ts" />
import when = require('when');

import restClient = require('./rest-client');
export import ProductResponse = require('../shared/model/product-response');

export function fetchProducts(): when.Promise<ProductResponse[]> {
	return restClient('/api/products').then((res) => {
		var products: ProductResponse[] = res.entity;
		return products;
	});
}
