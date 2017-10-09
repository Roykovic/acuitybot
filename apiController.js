'use strict'

var exports = module.exports = {};

exports.get = function(path, callback) {
    // Configure the request
    var options = {
        url: path,
        method: "GET",
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
