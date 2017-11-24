'use strict'

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
		console.log("IBM")
			body = httpUtils.parseFormData(body)
			console.log(+body.issued_on + +body.expires_in)
			expiresAtSeconds = +body.issued_on + +body.expires_in
            break;
    }
	var date = new Date(expiresAtSeconds);
	console.log(expiresAtSeconds)
	console.log(date)
	return [body, date]
}