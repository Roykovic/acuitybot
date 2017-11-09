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
		var acess_token = body.access_token
		exports.registerToken(userID, acces_token)
	})	
}

exports.registerToken = function(userID, accces_token){
	var pool  = mysql.createPool({
	  database: "ibmx_a6f1d89267096f1",
	  host: "us-cdbr-sl-dfw-01.cleardb.net",
	  user: "b332003fffc8cc",
	  password: "d446664b"
	});

   pool.getConnection(function(err,connection){
        if (err) {
          callback();
          return;
        }
        connection.query('INSERT INTO auth (userID, acces_token) VALUES (?,?,?,?)', [userID, acces_token],function(err,results){
            connection.release();
            if(!err) {
                callback();
            }
        });
        connection.on('error', function(err) {
              callback();
              return;
        });
    });
	pool.end();
}