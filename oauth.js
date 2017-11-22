'use strict'

var config = require('./config/config.js');
var db = require('./db');
var httpRequest = require('request');
var exports = module.exports = {};

exports.getWebpage = function(service) {
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

exports.getTokens = function(service, code, userID, callback) {
    var url;
    switch (service) {
        case "salesforce":
            url = "https://login.salesforce.com/services/oauth2/token?code=" + code + "&grant_type=" + config.grant_type + "&client_id=" + config.client_id + "&client_secret=" + config.client_secret + "&redirect_uri=" + config.callback_uri
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
        var validity = 12 * 3600000;
        var expiresAtSeconds = +issued_at + +validity;
        var d = new Date(expiresAtSeconds);
        var access_token = body.access_token
        return exports.registerToken(userID, access_token, d, function(access_token, succes) {
            callback(access_token)
        })
    })
}

exports.registerToken = function(userID, access_token, expiresAt, callback) {
    return db.query('REPLACE INTO auth (userID, access_token, expires_at) VALUES (?,?,?)', [userID, access_token, expiresAt], function(result) {
        return callback()
    })
}

exports.getAccessToken = function(userID, callback) {
    return db.query('SELECT access_token, expires_at FROM auth WHERE userID = ?', userID, function(result) {
        if (result && result.length > 0) {
            if (result[0].expires_at < new Date()) {
                return callback()
            }
            return callback(result[0].access_token)
        }
        return callback()
    })
}