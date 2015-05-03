/// <reference path="../tsd.d.ts" />
import _ = require('lodash');
import nodeMysql = require('./node-mysql');
import when = require('when');

export interface Product {
	productId: string;
	price: number;
	rewardStrings: string[];
}

export function getProducts(connection: nodeMysql.MysqlConnection | nodeMysql.MysqlPool): when.Promise<Product[]> {
	var query = 'SELECT * FROM `products`;';
	return connection.query(query).then((resultSet: nodeMysql.ResultSet) => {
		return _.map(resultSet.rows, parseProduct);
	});
}

export function getProduct(connection: nodeMysql.MysqlConnection | nodeMysql.MysqlPool, id: string): when.Promise<Product> {
	var query = 'SELECT * FROM `products` WHERE `product_id` = ?';
	return connection.query(query, [id]).then((resultSet: nodeMysql.ResultSet) => {
		if (resultSet.rows.length > 0) {
			return parseProduct(resultSet.rows[0]);
		} else {
			return null;
		}
	});
}

function parseProduct(row: any): Product {
	return {
		productId: row.product_id,
		price: row.price,
		rewardStrings: row.reward_data.split(';')
	};
}

