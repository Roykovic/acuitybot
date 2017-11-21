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

exports.getTokens = function(service, code, userID, callBack) {
    var url;
    switch (service) {
        case "salesforce":
            url = "https://login.salesforce.com/services/oauth2/token?code=" + code + "&grant_type=" + config.grant_type + "&client_id=" + config.client_id + "&client_secret=" + config.client_secret + "&redirect_uri=" + config.callBack_uri
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
            callBack(access_token)
        })
    })
}

exports.registerToken = function(userID, access_token, expiresAt, callBack) {
    return db.query('REPLACE INTO auth (userID, access_token, expires_at) VALUES (?,?,?)', [userID, access_token, expiresAt], function(result) {
        return callBack()
    })
}

exports.getAccessToken = function(userID, callBack) {
    return db.query('SELECT access_token, expires_at FROM auth WHERE userID = ?', userID, function(result) {
        if (result && result.length > 0) {
            if (result[0].expires_at < new Date()) {
                return callBack()
            }
            return callBack(result[0].access_token)
        }
        return callBack()
    })
}