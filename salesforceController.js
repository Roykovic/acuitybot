'use strict'

var messageController = require('./messageController');
var oauth = require('./oauth')
var httpRequest = require('request');
var config = require('./config/config');
var exports = module.exports = {};

exports.getContacts = function(access_token, callback) {
	if(!access_token){
		return callback()
	}
    var headers = {
        "Authorization": "Bearer " + access_token
    }

    var options = {
        url: config.salesforce.url+'query?q=SELECT+Name,MailingStreet,Phone,email,birthdate,department,HomePhone,Fax,MobilePhone,Title,Mailingcity+from+contact',
        method: "GET",
        headers: headers
    }

    httpRequest(options, function(error, response, body) {
        body = JSON.parse(body)
        callback(body.records)
    })
}

exports.getUser = function(access_token, fullname, callback) {
	console.log("*************GETUSER*****************")
	console.log(fullname)
    exports.getContacts(access_token, function(contacts) {
		if(contacts){
			for (var i = 0; i < contacts.length; ++i) {
				if (contacts[i].Name == fullname) {
					return callback(true)
				}
			}
		}
        return callback(false)
    })
}
exports.getColumns = function(userID, callback) {
    oauth.getAccessToken('salesforce', userID, function(access_token) {
        var headers = {
            "Authorization": "Bearer " + access_token
        }

        var options = {
            url: config.salesforce.url+'sobjects/contact/describe',
            method: "GET",
            headers: headers
        }

        httpRequest(options, function(error, response, body) {
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
	console.log("GETUSERINFO")
    oauth.getAccessToken('salesforce', userID, function(access_token) {
		console.log("GETACCESTOKEN")
		access_token = 'AR8AQGPbm4EmsCVyw2ytsqkY5jYdq58qSQObKasjTKTwNdWsCA7a6qVoWU5BWzhRpIqK3taRS._pSuE_DXpTuzI2VpGTU57G';
        exports.checkColumn(column, userID, function(returnColumn) {
			console.log("*************RETURNCOLUMN*********************")
			console.log(returnColumn)
            if (returnColumn) {
                exports.getContacts(access_token, function(contacts) {
					console.log("*************CONTACTS*****************")
                    for (var i = 0, len = contacts.length; i < len; i++) {
                        if (contacts[i].Name == fullname) {
							console.log(contacts[i])
                            var answer = contacts[i][returnColumn]
                            if (answer) {
                                return callback(messageController.getMessage('MESSAGE_USER_INFO', [fullname, returnColumn,answer]))
                            } else {
                                return callback("", "update")
                            }
                        }
                    }
                })
            } else {
				return callback(messageController.getMessage('MESSAGE_TYPE_NOT_FOUND', [column]))
            }
        })
    })
}

exports.updateUserInfo = function(userID, fullname, column, variable, callback) {
	console.log("VARIABLE")
	console.log(variable)
	oauth.getAccessToken('salesforce', userID, function(access_token) {
		if(!access_token){
			return callback(true, true)
		}
		exports.getUser(access_token, fullname, function(sfUser) {
			if (sfUser) {		
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
						console.log(response.statusCode)
						var error;
						if(body){
							body = JSON.parse(body);
							error = body[0]['message'];
							retcallback(messageController.getErrorMessage(error))
						}
						return callback()
					})
				})
			}
			else{
				callback(messageController.getMessage('MESSAGE_USER_INFO_NOT_FOUND_2', [column]))
			}
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