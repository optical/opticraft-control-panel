/// <reference path="tsd.d.ts" />

declare module 'express' {
	import bunyan = require('bunyan');

	module e {
		interface Request {
			log: bunyan.Logger
		}
	}
}

