'use strict'

var exports = module.exports = {};
var http = require("http");
var https = require("https");
http.post = require('http-post');
var request = require('request');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

exports.auth = "";

exports.getFromIBM = function (type, callback){
	var path;
	switch(type) {
    case "communities":
		var path = "/communities/service/atom/communities/my"
        break;
    case "activities":
        var path = "/activities/service/atom2/activities?includeCommunityActivities=no"
        break;
	case "files":
        var path = "/files/basic/api/documents/feed?visibility=public"
		break;
	default:
		callback("Cannot find " + type + " in system. Please check  your spelling or try again.");
	
}
	var method ="GET"
	
	return	exports.getJSON(method, path, type, function(speech, followUp){
		callback(speech, followUp)
	});
}

exports.postToIBM = function (callback, name, type, activity){
	var path;
	var body;
	exports.getActivityId(activity, function(activityID){
		switch(type) {
    case "communities":
		path = "/communities/service/atom/communities/my"
		body = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:app="http://www.w3.org/2007/app" xmlns:snx="http://www.ibm.com/xmlns/prod/sn"><title type="text">'+name+'</title><content type="html"></content><category term="community" scheme="http://www.ibm.com/xmlns/prod/sn/type"></category><snx:communityType>public</snx:communityType></entry>'
        break;
    case "activities":
        path = "/activities/service/atom2/activities"
		body = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:app="http://www.w3.org/2007/app" xmlns:snx="http://www.ibm.com/xmlns/prod/sn" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:thr="http://purl.org/syndication/thread/1.0"  > <title type="text">'+name+'</title>    <category scheme="http://www.ibm.com/xmlns/prod/sn/type" term="activity" label="Activity"/>    <category scheme="http://www.ibm.com/xmlns/prod/sn/priority" term="1" label="Normal"/>    <content type="html">             </content></entry>'
        break;
	case "activity nodes":
			if(!activityID){
				return callback("The activity doesn't exist")
			}
		path = "/activities/service/atom2/activity?activityUuid="+activityID
		body = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:snx="http://www.ibm.com/xmlns/prod/sn"> <title type="text">'+name+'</title> <category scheme="http://www.ibm.com/xmlns/prod/sn/type" term="todo" label="To Do"/> <content type="html">          	&lt;p dir="ltr">&lt;/p>      	  </content> <snx:communityUuid/> </entry>'
		}

	var method = "POST"
	return	exports.getJSON(method, path,type, function(speech){
		callback(speech)
	}, body);

		})
		}

exports.getJSON = function(method, path, type, callback, body){
	console.log("GETJSON")
var headers = {
	"Content-Type": 'application/atom+xml',
	"authorization": exports.auth
}

// Configure the request
var options = {
    url: 'https://apps.ce.collabserv.com' + path,
    method: method,
    headers: headers,
    body: body
}

// Start the request
request(options, function (error, response, body) {
	//No error, and get was succesful
    if (!error && response.statusCode == 200) {
					console.log("200")
 	parser.parseString(body, function (err, HTTPresult){
		var entries = HTTPresult['feed']['entry'];
		var titles = ""
		for(var index = 0; index < entries.length; ++index){
			titles += "\n"+entries[index]['title'][0]['_']+"\n";
			if(type == "files"){
				var URL = entries[index]['link'][0]['$']['href'].replace(/entry/g, 'media')
				titles += URL;
		
		}
			
		}
		callback("These are you "+type+": " + titles)
	})
    }
	//No error and creation was succesful
	if (!error && response.statusCode == 201){
							console.log("201")
		callback("Entry has been succesfully added to your "+type)
	}
	//Either an error, or a statuscode for an insuccesful request
	else{
		console.log("ERROR")
		var speech = "Something went wrong, please check if this record exists. And if you have the appropriate rights to fulfill this action"
		if(response){
		speech += "(" + response.statusCode + ")"
			}
		callback(speech)
	}
})}

exports.getActivityId = function(activityName, callback){
	var id = "";
	var headers = {
	"Content-Type": 'application/atom+xml',
	"authorization": exports.auth
	}
	
	var options = {
    url: 'https://apps.ce.collabserv.com/activities/service/atom2/activities',
    method: "GET",
    headers: headers,
	}
	
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			return parser.parseString(body, function (err, HTTPresult){
				var entries = HTTPresult['feed']['entry'];
				for(var index = 0; index < entries.length; ++index){
					if(entries[index]['title'][0]['_'] == activityName){
						var unformattedId = entries[index]['id'][0];	
						var parts = unformattedId.split(':')
						id = parts[parts.length-1]
						return callback(id);
					}				
				}
				return callback();
			})
		}
		return callback();
})
}
