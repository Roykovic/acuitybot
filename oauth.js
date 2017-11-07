var config = require('./config/oauthConfig.js');
var httpRequest = require('request');
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

exports.getTokens = function(service, code){
	var url;
	 switch (service) {
        case "salesforce":
            webpage = "https://login.salesforce.com/services/oauth2/token?code="+code+"&grant_type="+config.grant_type+"&client_id="+config.client_id+"&client_secret="+config.client_secret+"&redirect_uri="+config.callback_uri
            break;
		 case "connections":
            webpage = "connectionsIndex"
            break;	
		default:
			webpage = "404"
		}
	
		var options = {
        url: url,
        method: "GET"
    }
		console.log("********************************************DINGEN?******************************************")
    // Start the request
    httpRequest(options, function(error, response, body) {
		console.log("********************************************DINGEN?******************************************")
		body = JSON.parse(body)
		console.log(body.access_token)
		res.sendFile(__dirname + '/OAuth/loginSucces.html');
	})	
}