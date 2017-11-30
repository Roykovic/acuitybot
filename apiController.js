'use strict'
var exports = module.exports = {};
var messageController = require("./messageController");
var http = require("http");
http.post = require('http-post');
var request = require('request');

exports.get = function(path, callback, auth, contentType) {
    // Configure the request
    var headers = {}

    if (auth) {
        headers['Authorization'] = "Bearer " + auth
    }
    if (contentType) {
        headers['Content-Type'] = contentType
    } else {
        headers['Accept'] = 'text/plain'
    }


    var options = {
        url: path,
        method: "GET",
        headers: headers
    }

    // Start the request
    request(options, function(error, response, body) {
        //No error, and get was succesful
        if (!error && response.statusCode == 200) {
            if (headers['Content-Type']) {
                body = JSON.parse(body);
            }
            return callback(body)
        }
        //Either an error, or a statuscode for an insuccesful request
        else {
			return callback(messageController.getErrorMessage(error, response.statuscode))
        }
    })
}

exports.post = function(path, accesToken, body, callback) {
    var headers = {
        "Content-Type": 'application/json',
        "Authorization": 'Bearer ' + accesToken
    }
    var options = {
        url: path,
        method: "POST",
        body: body,
        headers: headers
    }

    // Start the request
    request(options, function(error, response, body) {
        //No error, and get was succesful
        if (!error && response.statusCode == 200) {
            return callback(body)
        }
        //Either an error, or a statuscode for an insuccesful request
        else {
           return callback(messageController.getErrorMessage(error, response.statuscode))
        }
    })
}