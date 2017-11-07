var config = require('./config/oauthConfig.js');
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
            webpage = "https://login.salesforce.com/services/oauth2/token?code="+code+"&grant_type="+oauthCfg.grant_type+"&client_id="+oauthCfg.client_id+"&client_secret="+oauthCfg.client_secret+"&redirect_uri="+oauthCfg.callback_uri
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

    // Start the request
    httpRequest(options, function(error, response, body) {
		body = JSON.parse(body)
		console.log(body.access_token)
		res.sendFile(__dirname + '/OAuth/loginSucces.html');
	})	
}