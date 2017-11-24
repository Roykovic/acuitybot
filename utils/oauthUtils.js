'use strict'
var httpUtils = require('./httpUtils')
var exports = module.exports = {};

exports.parseBody = function(body, service){
	var expiresAtSeconds;
    switch (service) {
        case "salesforce":
			body = JSON.parse(body)
			var issued_at = body.issued_at;
			var validity = 12 * 3600000;
			expiresAtSeconds = +issued_at + +validity;
			break;
        case "ibm":
			body = httpUtils.parseFormData(body)
			expiresAtSeconds = +body.issued_on + +body.expires_in
            break;
    }
	var date = new Date(expiresAtSeconds);
	return [body, date]
}