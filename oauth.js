//'use strict'

var config = require('./config/config.js');
var db = require('./db');
var httpRequest = require('request');
var serviceEnum = require('./service');
var exports = module.exports = {};
var oauthUtils = require('./utils/oauthUtils')

exports.getWebpage = function(service) {
    var webpage;
    switch (service) {
        case "salesforce":
            webpage = "salesforceIndex"
            break;
        case "ibm":
            webpage = "connectionsIndex"
            break;
        default:
            webpage = "404"
    }
    return webpage
}

exports.getTokens = function(service, code, userID, callback) {
    var url;
    switch (service) {
        case "salesforce":
            url = "https://login.salesforce.com/services/oauth2/token?code=" + code + "&grant_type=" + config.grant_type + "&client_id=" + config.salesforce.client_id + "&client_secret=" + config.salesforce.client_secret + "&redirect_uri=" + config.salesforce.callback_uri
			break;
        case "ibm":
            url = "https://apps.ce.collabserv.com/manage/oauth2/token?code=" + code + "&grant_type=" + config.grant_type + "&client_id=" + config.ibm.client_id + "&client_secret=" + config.ibm.client_secret + "&callback_uri=" + config.ibm.callback_uri
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
		var parsedBody = oauthUtils.parseBody(body, service)
		body = parsedBody[0];
		var expireDate = parsedBody[1]
        var access_token = body.access_token
		var refresh_token = body.refresh_token
        return exports.registerToken(service, userID, access_token, refresh_token, expireDate, function(access_token, succes) {
            callback(access_token)
        })
    })
}

exports.registerToken = function(service, userID, access_token, refresh_token, expiresAt, callback) {
	if(!refresh_token){
		var query = 'INSERT INTO auth (userID, '+service+'_access_token, '+service+'_expires_at) VALUES (?,?,?) ON DUPLICATE KEY UPDATE  `userID`=VALUES(`userID`), `'+service+'_access_token`=VALUES(`'+service+'_access_token`), `'+service+'_expires_at`=VALUES(`'+service+'_expires_at`)'
	}
	else{
		var query = 'INSERT INTO auth (userID, '+service+'_access_token, '+service+'_expires_at,  '+service+'_refresh_token) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE  `userID`=VALUES(`userID`), `'+service+'_access_token`=VALUES(`'+service+'_access_token`), `'+service+'_expires_at`=VALUES(`'+service+'_expires_at`), `'+service+'_refresh_token`=VALUES(`'+service+'_refresh_token`)'
	}
	
	return db.query(query, [userID, access_token, expiresAt, refresh_token], function(result) {
        return callback()
    })
}

exports.getAccessToken = function(service, userID, callback) {
	return exports.checkExpiration(userID, function(expired){
		if(expired.indexOf(service) > -1){
			return callback(false)
		}
		else{
			var query ='SELECT '+service+'_access_token, '+service+'_expires_at FROM auth WHERE userID = ?'
			return db.query(query, userID, function(result) {
				if (result && result.length > 0) {
					return callback(result[0][service + "_access_token"])
				}
			})
		}
	})
}

exports.checkExpiration = function(userID, callback){
	var expired = [];
	var services = Object.keys(serviceEnum.services);
	var i = 1;
	var loop = function(services){
		var service = services[i];
		var query ='SELECT * FROM auth WHERE userID = ?'
		return db.query(query, userID, function(result){
			i++;
			serviceResult = result[0];
			service = service.toLowerCase();
			if(!serviceResult){
				expired.push(service);
			}
			else if (result.length < 1 || serviceResult[service+"_expires_at"] < new Date()) {
				if(serviceResult[service+"_refresh_token"]){
					exports.refreshAccesToken(service, serviceResult[service, service+"_refresh_token"], userID, function(succes){
						if(!succes){
							expired.push(service);
						}
					})
				}
				else{
					expired.push(service);
				}
            }
			if(i == services.length){
				return callback(expired)
			}
			else{loop(services)}
		})
	}
	return loop(services);
}

exports.refreshAccesToken = function(service, refreshToken, userID, callback){
	if(service == "ibm"){
		var url = "https://apps.ce.collabserv.com/manage/oauth2/token?grant_type=refresh_token&client_id=" + config.ibm.client_id + "&client_secret=" + config.ibm.client_secret + "&refresh_token=" + refreshToken
	}
	
	var options = {
		url: url,
		method: "GET"
	}
	
	httpRequest(options, function(error, response, body) {
		if(error) callback()
		returnBody = oauthUtils.parseBody(body, service)
		body = returnBody[0]
		var expiresAt = returnBody[1]
		exports.registerToken(service, userID, body.access_token, body.refresh_token, expiresAt, function(){
			callback(true);
		})
	})	
}	