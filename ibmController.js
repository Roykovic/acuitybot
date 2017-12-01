'use strict'

var exports = module.exports = {};
var messageController = require("./messageController");
var http = require("http");
http.post = require('http-post');
var request = require('request');
var oauth = require('./oauth')
var config = require('./config/config');
var xml2js = require('xml2js');
var xpath = require("xml2js-xpath");
var parser = new xml2js.Parser();

exports.getFromIBM = function(userID, type, callback) {
    var path;
    switch (type) {
        case "communities":
            var path = "communities/service/atom/communities/my"
            break;
        case "activities":
            var path = "activities/service/atom2/activities?includeCommunityActivities=no"
            break;
        case "files":
            var path = "files/basic/api/documents/shared/feed?sK=created&sO=dsc&sC=docshare&direction=inbound"
            break;
        case "todos":
            var path = "activities/service/atom2/todos"
            break;
        default:
			return callback(messageController.getMessage('MESSAGE_TYPE_NOT_FOUND', [type]));
    }
    var method = "GET"
	return oauth.getAccessToken('ibm', userID, function(access_token){
		if(access_token){
			return exports.getJSON(access_token, method, path, type, function(entries, error) {
				if (error) {
					return callback(entries)
				}
				if (entries) {
					var speech = messageController.getMessage('MESSAGE_TYPE_ENTRIES', [type, entries])
				} else {
					var speech = messageController.getMessage('MESSAGE_TYPE_ENTRIES_NOT_FOUND', [type])
				}
				callback(speech)
			});		
		}
		else{
			callback()
		}	
	})
}

exports.postToIBM = function(name, type, activity, userID, callback) {
	return oauth.getAccessToken('ibm', userID, function(access_token){
		if(!access_token){
			return callback() //unauthorized
		}
		var path;
		var body;
	exports.getIdByName(access_token, activity, '/activities/service/atom2/activities', function(activityID) {		
			switch (type) {
				case "communities":
					path = "communities/service/atom/communities/my"
					body = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:app="http://www.w3.org/2007/app" xmlns:snx="http://www.ibm.com/xmlns/prod/sn"><title type="text">' + name + '</title><content type="html"></content><category term="community" scheme="http://www.ibm.com/xmlns/prod/sn/type"></category><snx:communityType>public</snx:communityType></entry>'
					break;
				case "activities":
					path = "activities/service/atom2/activities"
					body = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:app="http://www.w3.org/2007/app" xmlns:snx="http://www.ibm.com/xmlns/prod/sn" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:thr="http://purl.org/syndication/thread/1.0"  > <title type="text">' + name + '</title>    <category scheme="http://www.ibm.com/xmlns/prod/sn/type" term="activity" label="Activity"/>    <category scheme="http://www.ibm.com/xmlns/prod/sn/priority" term="1" label="Normal"/>    <content type="html">             </content></entry>'
					break;
				case "activity nodes":
					if (!activityID) {
						return callback(messageController.getMessage('MESSAGE_TYPE_NOT_FOUND', ['activity']))
					}
					else{
						path = "activities/service/atom2/activity?activityUuid=" + activityID
						body = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:snx="http://www.ibm.com/xmlns/prod/sn"> <title type="text">' + name + '</title> <category scheme="http://www.ibm.com/xmlns/prod/sn/type" term="todo" label="To Do"/> <content type="html">          	&lt;p dir="ltr">&lt;/p>      	  </content> <snx:communityUuid/> </entry>'
					}
			}

			var method = "POST"
			return exports.getJSON(access_token, method, path, type, function(error) {
				if (error) {
					var speech = messageController.getErrorMessage(error)
				} else {
					var speech =  messageController.getMessage('MESSAGE_TYPE_ENTRY_ADDED', [type])
				}
				callback(speech)
			}, body);
		})
	})	
}

exports.updateIBM = function(varName, userID, callback) {
	return oauth.getAccessToken('ibm', userID, function(access_token){
		if(!access_token){
			return callback() //unauthorized
		}
		exports.getIdByName(access_token, varName, '/activities/service/atom2/todos', function(id) {
			if (!id) {
				return callback(messageController.getMessage('MESSAGE_TYPE_NOT_FOUND', ['Todo']))
			}
			exports.getJSON(access_token, "GET", '/activities/service/atom2/activitynode?activityNodeUuid=' + id, "updateTodo", function(body) {
				var splittedString = body.split('</entry>')
				var completed = '<category scheme="http://www.ibm.com/xmlns/prod/sn/flags" term="completed" label="Completed"/>'
				exports.getJSON("PUT", '/activities/service/atom2/activitynode?activityNodeUuid=' + id, "updateTodo", function(parameter) {
				body = splittedString[0] + completed + '</entry>'
					return callback( messageController.getMessage('MESSAGE_TODO_COMPLETED', [varName]))
				}, body)

			})
		})
	})
}


exports.getJSON = function(access_token, method, path, type, callback, body) {
	console.log(type)
    var headers = {
        "Content-Type": 'application/atom+xml',
        "authorization": "Bearer " + access_token
    }

    // Configure the request
    var options = {
        url: config.ibm.url + path,
        method: method,
        headers: headers,
        body: body
    }

    // Start the request
    request(options, function(error, response, body) {
        //No error, and get was succesful
        if (!error && response.statusCode == 200) {
            if (type == "updateTodo") {
                return callback(body)
            }
            return parser.parseString(body, function(err, HTTPresult) {
                var entries = HTTPresult['feed']['entry'];
                if (!entries) {
                    return callback()
                }
                var titles = ""
                for (var index = 0; index < entries.length; ++index) {
                    titles += "\n" + entries[index]['title'][0]['_'] + "\n";
                    if (type == "files") {
                        var URL = entries[index]['link'][0]['$']['href'].replace(/entry/g, 'media')
                        titles += URL;

                    }

                }
                return callback(titles)
            })
        }
        //No error and creation was succesful
        if (!error && response.statusCode == 201) {
            return callback()
        }
        //Either an error, or a statuscode for an insuccesful request
        else {
            return callback(messageController.getErrorMessage(error, response.statusCode), true)
        }
    })
}

exports.getIdByName = function(access_token, varName, path, callback) {
	if(!varName) return callback();
    var id = "";
    var headers = {
        "Content-Type": 'application/atom+xml',
        "authorization": "Bearer " + access_token
    }

    var options = {
        url: config.ibm.url + path,
        method: "GET",
        headers: headers,
    }
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            return parser.parseString(body, function(err, HTTPresult) {
                var entries = HTTPresult['feed']['entry'];
                if (!entries) {
                    return callback()
                }
                for (var index = 0; index < entries.length; ++index) {
                    if (entries[0]['title'][0]['_'].trim() == varName.trim()) {
                        var unformattedId = entries[index]['id'][0];
                        var parts = unformattedId.split(':')
                        id = parts[parts.length - 1]
                        return callback(id);
                    }
                }
                return callback();
            })
        }
        return callback();
    })
}

exports.getUser = function(access_token, name, callback) {
    var id = "";
    var headers = {
        "authorization": "Bearer "+access_token
    }

    var options = {
        url: config.ibm.url+'profiles/atom/search.do?name=' + name,
        method: "GET",
        headers: headers
    }
    return request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            return parser.parseString(body, function(err, HTTPresult) {
                var entries = HTTPresult['feed']['entry'];
                return callback(entries)
            })
        }
        return callback();
    })
}

exports.getContacts = function(access_token, callback) {
	if(!access_token){
		return callback()
	}
    var headers = {
        "authorization": "Bearer " + access_token
    }
    var options = {
        url: config.ibm.url+'profiles/atom/connections.do?connectionType=colleague&userid=203079380',
        method: "GET",
        headers: headers,
    }
    return request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            return parser.parseString(body, function(err, HTTPresult) {
                var entries = HTTPresult['feed']['entry'];
                var names = [];
                for (var i = 0; i < entries.length; ++i) {
                    var name = entries[i]['title'][0]['_']
                    names[i] = {};
					names[i].Name = name;
                }
                return callback(names)
            })
        }
        return callback();
    })
}

exports.getUserInfo = function(userID, fullname, column, callback) {
	column = column.toLowerCase()
	var  columnNo = Object.keys(config.ibm.columns).indexOf(column);
	if(columnNo > -1){
		oauth.getAccessToken('ibm', userID, function(access_token) {
			var headers = {
				"authorization": "Bearer " + access_token
			}
			var options = {
				url: config.ibm.url+'profiles/atom/search.do?name='+fullname,
				method: "GET",
				headers: headers,
			}
			return request(options, function(error, response, body) {
				if (!error && response.statusCode == 200) {
					return parser.parseString(body, function(err, json) {
						console.log(columnNo)
						if(columnNo == 0){
							var answerObj = xpath.find(json, "//a[@class='email']");
							var answer = answerObj[0]['_']
						}
						else{
							var answerObj = xpath.find(json, "//div[@class='tel']/span");
							var answer = answerObj[0]['_']
						}
						if(answer){
							return callback(messageController.getMessage("MESSAGE_USER_INFO", [fullname, column, answer]))
						}
						else{
							return callback(messageController.getMessage("MESSAGE_USER_INFO_NOT_FOUND", [fullname, column]))
						}
					})
				}
				return callback(messageController.getMessage("MESSAGE_USER_INFO_NOT_FOUND", [fullname, column]))
			})
		})
	}	
	else{
		return callback(messageController.getMessage("MESSAGE_USER_INFO_NOT_FOUND", [fullname, column]))
	}
}