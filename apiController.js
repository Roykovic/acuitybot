'use strict'

var exports = module.exports = {};
var http = require("http");
var https = require("https");
http.post = require('http-post');
var request = require('request');

exports.get = function(path, callback) {
    // Configure the request
	  var headers = {
        "Accept": 'application/json',
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
                return callback(body)
        }
        //Either an error, or a statuscode for an insuccesful request
        else {

            var speech = error + "\nSomething went wrong, please check if this record exists. And if you have the appropriate rights to fulfill this action"
            if (response) {
                speech += "(" + response.statusCode + ")"
            }
            return callback(speech, true)
        }
    })
}
