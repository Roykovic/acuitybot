'use strict'

var oauth = require('./oauth')
var httpRequest = require('request');
var exports = module.exports = {};

exports.getContacts = function(access_token, callback) {
    var headers = {
        "Authorization": "Bearer " + access_token
    }

    var options = {
        url: 'https://eu11.salesforce.com/services/data/v20.0/query?q=SELECT+Name,MailingStreet,Phone,email,birthdate,department,HomePhone,Fax,MobilePhone,Title,Mailingcity+from+contact',
        method: "GET",
        headers: headers
    }

    httpRequest(options, function(error, response, body) {
        body = JSON.parse(body)
        callback(body.records)
    })
}

exports.getUser = function(access_token, fullname, callback) {
    exports.getContacts(access_token, function(contacts) {
        for (var i = 0; i < contacts.length; ++i) {
            if (contacts[i].Name == fullname) {
                return callback(true)
            }
        }
        return callback(false)
    })
}
exports.getColumns = function(userID, callback) {
    oauth.getAccessToken('salesforce', userID, function(access_token) {
		console.log(acces_token)
        var headers = {
            "Authorization": "Bearer " + access_token
        }

        var options = {
            url: 'https://eu11.salesforce.com/services/data/v20.0/sobjects/contact/describe',
            method: "GET",
            headers: headers
        }

        httpRequest(options, function(error, response, body) {
			console.log(body)
            body = JSON.parse(body)
            var columns = [];
            for (var i = 0, len = body.fields.length; i < len; i++) {
                columns[i] = body.fields[i].name
            }
            callback(columns)
        })
    })
}

exports.getURLByName = function(access_token, fullname, callback) {
    return exports.getContacts(access_token, function(contacts) {
        for (var i = 0, len = contacts.length; i < len; i++) {
            if (contacts[i].Name == fullname) {
                var url = contacts[i].attributes.url
                return callback(url)
            }
        }
    })
}

exports.getUserInfo = function(userID, fullname, column, callback) {
    oauth.getAccessToken('salesforce', userID, function(access_token) {
        exports.checkColumn(column, userID, function(returnColumn) {
            if (returnColumn) {
                exports.getContacts(access_token, function(contacts) {
                    for (var i = 0, len = contacts.length; i < len; i++) {
                        if (contacts[i].Name == fullname) {
                            var answer = contacts[i][returnColumn]
                            if (answer) {
                                var speech = fullname + "'s " + returnColumn + " is " + answer
                                return callback(speech)
                            } else {
                                return callback("", "update")
                            }
                        }
                    }
                })
            } else {
                return callback(column + " does not exist, please check your spelling.")
            }
        })
    })
}

exports.updateUserInfo = function(userID, fullname, column, variable, callback) {
    oauth.getAccessToken('salesforce', userID, function(access_token) {
        exports.getURLByName(access_token, fullname, function(url) {
            var headers = {
                "Authorization": "Bearer " + access_token,
                "Content-Type": 'application/json'
            }

            var body = {}
            body[column] = variable;

            var options = {
                'url': 'https://eu11.salesforce.com/' + url,
                'method': "PATCH",
                'headers': headers,
                'body': JSON.stringify(body)
            }

            httpRequest(options, function(error, response, body) {
                callback()
            })
        })
    })
}

exports.checkColumn = function(column, userID, callback) {
    exports.getColumns(userID, function(columns) {
        if (columns) {
            for (var i = 0, len = columns.length; i < len; i++) {
                var columnFromDB = columns[i];
                var lowerCaseColumn = columnFromDB.toLowerCase();
                if (lowerCaseColumn == column.toLowerCase()) {
                    callback(column);
                    return
                }
            }
        }
        return callback(null);
    })
}