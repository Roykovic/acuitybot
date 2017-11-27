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
	var query ='SELECT '+service+'_access_token, '+service+'_expires_at FROM auth WHERE userID = ?'
    return db.query(query, userID, function(result) {
        if (result && result.length > 0) {
            if (result[0].expires_at < new Date()) {
                return callback()
            }
            return callback(result[0][service + "_access_token"])
        }
        return callback()
    })
}

exports.checkExpiration = function(userID){
	var expired;
	var services = serviceEnum.services;
	for(var i = 1; i<services.length; ++i){
		var service = services[i];
		var query ='SELECT '+service+'_expires_at FROM auth WHERE userID = ?'
		db.query(query, userID, function(result){
			console.log("Result")
			console.log(result)
			if (result[0].expires_at < new Date()) {
                expired[i-1] = service;
            }
		})
	}
	console.log("Expired")
	console.log(expired)
	return expired;
}