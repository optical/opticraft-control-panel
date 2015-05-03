/// <reference path="tsd.d.ts" />
import nodemailer = require('nodemailer');
import smtpTransport = require('nodemailer-smtp-transport');
import when = require('when');
import nodefn = require ('when/node');
import config = require('./config');

var options: smtpTransport.SmtpOptions = {
	host: config.get('mailer.smtp.host'),
	port: config.get('mailer.smtp.port'),
	secure: config.get('mailer.smtp.ssl'),
	tls: {
		rejectUnauthorized: config.get('mailer.smtp.reject-unauthorized')
	}
};

export function sendNotification(subject: string, text: string): when.Promise<{}> {
	var transporter = nodemailer.createTransport(smtpTransport(options));

	var mailOptions: nodemailer.SendMailOptions = {
		to: config.get('mailer.addresses'),
		from: config.get('mailer.from'),
		subject: subject,
		text: text
	};

	var promise = nodefn.call(transporter.sendMail.bind(transporter), mailOptions);
	promise.finally(() => transporter.close());
	return promise;

}

