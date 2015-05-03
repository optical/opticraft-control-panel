/// <reference path='tsd.d.ts' />
import convict = require('convict');
import fs = require('fs');

function checkNotFalsy(message: string): (val: any) => void {
	return (value) => {
		if (!value) {
			throw new Error(message);
		}
	};
}

var config = convict({
	'config-file': {
		default: 'config.json',
		arg: 'config-file',
		env: 'CONFIG_FILE'
	},
	'log-level': {
		default: 'info',
		format: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
		arg: 'log-level',
		env: 'LOG_LEVEL'
	},
	'trust-proxy': {
		default: false,
		format: Boolean,
		arg: 'trust-proxy',
		env: 'TRUST_PROXY'
	},
	mailer: {
		enabled: {
			doc: 'Enable sending out email notifications when admin events occur',
			default: false,
			format: Boolean
		},
		addresses: {
			doc: 'List of email addresses to send emails to',
			format: Array,
			default: [],
			arg: 'mailer-addresses',
			env: 'MAILER_ADDRESSES'
		},
		from: {
			doc: 'Email address to send from',
			default: 'admin@opticraft.net',
			arg: 'mailer-from',
			env: 'MAILER_FROM'
		},
		smtp: {
			host: {
				doc: 'SMTP Server hostname to be used for sending out email notifications',
				default: 'localhost',
				arg: 'mailer-smtp-host',
				env: 'MAILER_SMTP_HOST'
			},
			port: {
				doc: 'Port for the SMTP server',
				default: '465',
				arg: 'mailer-smtp-port',
				env: 'MAILER_SMTP_PORT'
			},
			ssl: {
				doc: 'Use SMTPS (SSL?)',
				default: true,
				format: Boolean,
				arg: 'mailer-smtp-ssl',
				env: 'MAILER_SMTP_SSL'
			},
			'reject-unauthorized': {
				doc: 'Accept invalid certificates when using TLS',
				default: true,
				format: Boolean,
				arg: 'mailer-smtp-reject-unauthorized',
				env: 'MAILER_SMTP_REJECT_UNAUTHORIZED',
			}
		}
	},
	session: {
		secret: {
			default: null,
			arg: 'session-secret',
			env: 'SESSION_SECRET'
		},
		store: {
			default: 'memory',
			format: ['memory', 'redis'],
			arg: 'session-store',
			env: 'SESSION_STORE'
		},
		'expiry-hours': {
			default: 4 * 7 * 24,
			format: Number,
			arg: 'session-expiry-hours',
			env: 'SESSION_EXPIRY_HOURS'
		}
	},
	redis: {
		port: {
			format: 'port',
			default: 6379,
			arg: 'redis-port',
			env: 'REDIS_PORT'
		},
		ip: {
			format: 'ipaddress',
			default: '127.0.0.1',
			arg: 'redis-ip',
			env: 'REDIS_IP'
		}
	},
	ip: {
		doc: 'The IP address to bind.',
		format: 'ipaddress',
		default: '0.0.0.0',
		arg: 'ip',
		env: 'IP_ADDRESS'
	},
	'user-file': {
		doc: 'Temporary file containing all users and their passwords for the panel',
		default: 'users.json',
		arg: 'user-file',
		env: 'USER_FILE'
	},
	port: {
		doc: 'The port to bind.',
		format: 'port',
		default: 8080,
		arg: 'port',
		env: 'PORT'
	},

	rewarder: {
		db: {
			host: {
				default: 'localhost',
				arg: 'rewarder-db-host',
				env: 'REWARDER_DB_HOST'
			},
			port: {
				default: 3306,
				arg: 'rewarder-db-port',
				env: 'REWARDER_DB_PORT'
			},
			database: {
				default: '',
				format: checkNotFalsy('Database for rewarder must be specified'),
				arg: 'rewarder-db-database',
				env: 'REWARDER_DB_DATABASE'
			},
			username: {
				default: 'root',
				arg: 'rewarder-db-username',
				env: 'REWARDER_DB_USERNAME'
			},
			password: {
				default: '',
				arg: 'rewarder-db-password',
				env: 'REWARDER_DB_PASSWORD'
			}
		}
	},

	donations: {
		db: {
			host: {
				default: 'localhost',
				arg: 'donations-db-host',
				env: 'DONATIONS_DB_HOST'
			},
			port: {
				default: 3306,
				arg: 'donations-db-port',
				env: 'DONATIONS_DB_PORT'
			},
			database: {
				default: '',
				format: checkNotFalsy('Database for donations must be specified'),
				arg: 'donations-db-database',
				env: 'DONATIONS_DB_DATABASE'
			},
			username: {
				default: 'root',
				arg: 'donations-db-username',
				env: 'DONATIONS_DB_USERNAME'
			},
			password: {
				default: '',
				arg: 'donations-db-password',
				env: 'DONATIONS_DB_PASSWORD'
			}
		}
	},

	votes: {
		db: {
			host: {
				default: 'localhost',
				arg: 'votes-db-host',
				env: 'VOTES_DB_HOST'
			},
			port: {
				default: 3306,
				arg: 'votes-db-port',
				env: 'VOTES_DB_PORT'
			},
			database: {
				default: '',
				format: checkNotFalsy('Database for votes must be specified'),
				arg: 'votes-db-database',
				env: 'VOTES_DB_DATABASE'
			},
			username: {
				default: 'root',
				arg: 'votes-db-username',
				env: 'VOTES_DB_USERNAME'
			},
			password: {
				default: '',
				arg: 'votes-db-password',
				env: 'VOTES_DB_PASSWORD'
			}
		}
	}
});

if (fs.existsSync(config.get('config-file'))) {
	config.loadFile(config.get('config-file'));
}

export = config;
