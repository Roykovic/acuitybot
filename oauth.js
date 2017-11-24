//'use strict'

var config = require('./config/config.js');
var db = require('./db');
var httpRequest = require('request');
var exports = module.exports = {};
var httpUtils = require('./utils/httpUtils')
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
		var parsedBody = oauthUtils.parseBody(body)
		body = parsedBody[0];
		var expireDate = parsedBody[1]
        var access_token = body.access_token
        return exports.registerToken(service, userID, access_token, expireDate, function(access_token, succes) {
            callback(access_token)
        })
    })
}

exports.registerToken = function(service, userID, access_token, expiresAt, callback) {
	var query = 'REPLACE INTO auth (userID, '+service+'_access_token, '+service+'_expires_at) VALUES (?,?,?)'
    return db.query(query, [userID, access_token, expiresAt], function(result) {
        return callback()
    })
}

exports.getAccessToken = function(service, userID, callback) {
    return db.query('SELECT '+service+'_access_token, '+service+'_expires_at FROM auth WHERE userID = ?', userID, function(result) {
        if (result && result.length > 0) {
            if (result[0].expires_at < new Date()) {
                return callback()
            }
            return callback(result[0].access_token)
        }
        return callback()
    })
}