//'use strict'
var exports = module.exports = {};
var http = require("http");
http.post = require('http-post');
var request = require('request');

exports.get = function(path, callBack, auth, contentType) {
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
            return callBack(body)
        }
        //Either an error, or a statuscode for an insuccesful request
        else {
            var speech = error + "\nSomething went wrong"
            if (response) {
                speech += "(" + response.statusCode + ")"
            }
            return callBack(speech)
        }
    })
}

exports.post = function(path, accesToken, body, callBack) {
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
            return callBack(body)
        }
        //Either an error, or a statuscode for an insuccesful request
        else {
            var speech = error + "\nSomething went wrong"
            if (response) {
                speech += "(" + response.statusCode + ")\n"
            }
            speech += body
            return callBack(speech)
        }
    })
}