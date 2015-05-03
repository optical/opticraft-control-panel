/// <reference path="tsd.d.ts" />
import rest = require('rest');
import mime = require('rest/interceptor/mime');
import errorCode = require('rest/interceptor/errorCode');
import timeout = require('rest/interceptor/timeout');
import pathPrefix = require('rest/interceptor/pathPrefix');
var template = require('rest/interceptor/template');

var client: rest.Client = null;

interface MakeRequest {
	(arg: string | rest.Request): rest.ResponsePromise;
	initialize: (basePath: URI) => void;
}

var makeRequest: MakeRequest = <MakeRequest>function (arg: string | rest.Request): rest.ResponsePromise {
	return client(arg);
};

makeRequest.initialize = function (basePath: URI) {
	var prefix = basePath.toString();
	if (prefix[prefix.length - 1] === '/') {
		prefix = prefix.substring(0, prefix.length - 1);
	}

	client = rest.wrap<mime.Config>(mime, { mime: 'application/json' })
		.wrap(template)
		.wrap(errorCode)
		.wrap(timeout)
		.wrap(pathPrefix, { prefix: prefix });
};

export = makeRequest;
