/// <reference path="../tsd.d.ts" />
import nodefn = require('when/node');
import bunyan = require('bunyan');
import mysql = require('mysql');
import when = require('when');

export interface ResultSet {
	fields: string[];
	rows: any[];
}

export interface MysqlConnection {
	connect(): when.Promise<{}>;
	end(): when.Promise<{}>;
	query(queryText: string, params?: any[]): when.Promise<ResultSet>;

	release(): void;
}

export function createConnection(config: mysql.IConnectionConfig, logger: bunyan.Logger) : MysqlConnection {
	var connection = new Connection(logger);

	return connection.initializeWithConfig(config);
}

export function createPool(config: mysql.IPoolConfig, logger: bunyan.Logger): MysqlPool {
	return new Pool(config, logger);
}

interface LoggerContext {
	host: string;
	database: string;
	port: number;
	user: string;
}

function createLoggerContext(config: mysql.IConnectionConfig): LoggerContext {
	return {
		host: config.host,
		port: config.port,
		user: config.user,
		database: config.database
	};
}

class Connection implements MysqlConnection {
	private _connection: mysql.IConnection;

	constructor(private _logger: bunyan.Logger) {
	}

	initializeWithConfig(config: mysql.IConnectionConfig): Connection {
		return this.initializeWithConnection(mysql.createConnection(config));
	}

	initializeWithConnection(connection: mysql.IConnection): Connection {
		this._logger = this._logger.child(createLoggerContext(connection.config));
		this._connection = connection;
		return this;
	}

	connect(): when.Promise<{}> {
		this._logger.debug('Establishing connection');
		return nodefn.call(this._connection.connect.bind(this._connection));
	}

	end(): when.Promise<{}> {
		this._logger.debug('Ending connection');
		return nodefn.call(this._connection.end.bind(this._connection));
	}

	query(queryText: string, params?: any[]): when.Promise<ResultSet> {
		this._logger.debug('Executing query', { query: queryText, params: params });
		var start = Date.now();
		return when.promise<ResultSet>((resolve, reject) => {
			this._connection.query(queryText, params, (err, rows: Object[], fields: string[]) => {
				if (err) {
					reject(err);
				} else {
					var resultSet: ResultSet = {
						rows: rows,
						fields: fields
					};
					this._logger.debug('Query completed', { duration: Date.now() - start });
					resolve(resultSet);
				}
			});
		});
	}

	release(): void {
		this._logger.debug('Connection released');
		this._connection.release();
	}
}

export interface MysqlPool {
	config: mysql.IPoolConfig;

	getConnection(): when.Promise<MysqlConnection>;
	query(queryText: string, params?: any[]): when.Promise<ResultSet>;
}

class Pool implements MysqlPool {
	private pool: mysql.IPool;
	private _logger: bunyan.Logger;

	constructor(public config: mysql.IPoolConfig, logger: bunyan.Logger) {
		this._logger = logger.child(createLoggerContext(config));
		this.pool = mysql.createPool(config);
	}

	getConnection(): when.Promise<MysqlConnection> {
		this._logger.debug('Acquiring connection');
		return when.promise<MysqlConnection>((resolve, reject) => {
			this.pool.getConnection((err: mysql.IError, connection: mysql.IConnection) => {
				if (err) {
					reject(err);
				} else {
					resolve(new Connection(this._logger).initializeWithConnection(connection));
				}
			});
		});
	}

	query(queryText: string, params?: any[]): when.Promise<ResultSet> {
		return this.getConnection().then((connection) => {
			return connection.query(queryText, params).finally(() => {
				this._logger.debug('Releasing connection');
				connection.release();
			});
		});
	}
}
