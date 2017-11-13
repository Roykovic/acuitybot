var config = require('./config/oauthConfig.js');
var db = require('./db');
var httpRequest = require('request');
var index = require('./index');
var exports = module.exports = {};

exports.getWebpage = function (service){
	var webpage;
	 switch (service) {
        case "salesforce":
            webpage = "salesforceIndex"
            break;
		 case "connections":
            webpage = "connectionsIndex"
            break;	
		default:
			webpage = "404"
		}
	return webpage	
}

exports.getTokens = function(service, code, userID){
	var url;
	 switch (service) {
        case "salesforce":
            url = "https://login.salesforce.com/services/oauth2/token?code="+code+"&grant_type="+config.grant_type+"&client_id="+config.client_id+"&client_secret="+config.client_secret+"&redirect_uri="+config.callback_uri
            break;
		 case "connections":
            url = "connectionsIndex"
            break;	
		default:
			webpage = "404"
		}
	
		var options = {
        url: url,
        method: "GET"
    }
    // Start the request
    httpRequest(options, function(error, response, body) {
		body = JSON.parse(body)

		var issued_at = body.issued_at;
		var validity = 12*3600;
		var expiresAtSeconds = +issued_at + +validity;
		var d = new Date(expiresAtSeconds);
		//d.setUTCSeconds(expiresAtSeconds)
		console.log("************************Auth Body**********************************")
		console.log(issued_at)
		console.log(d);
		var access_token = body.access_token
		return exports.registerToken(userID, access_token, function(access_token){
			return access_token
		})
	})	
}

exports.registerToken = function(userID, access_token, callback){
	return db.query('INSERT INTO auth (userID, access_token) VALUES (?,?)', [userID, access_token], function(result){
		return callback()
	})
}

exports.getAccessToken = function(userID, callback){
	return db.query('SELECT access_token FROM auth WHERE userID = ?', userID, function(result){
		if(result && result.length > 0){
			return callback(result[0].access_token)
		}
		return callback()
	})
}