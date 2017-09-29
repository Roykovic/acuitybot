'use strict'

var exports = module.exports = {};
var http = require("http");
var https = require("https");
http.post = require('http-post');
var xml2js = require('xml2js');

exports.auth = "";

exports.getFromIBM = function (type, callback){
	var path;
	switch(type) {
    case "communities":
		var path = "/communities/service/atom/communities/my"
        break;
    case "activities":
        var path = "/activities/service/atom2/?includeCommunityActivities=no"
        break;
	case "files":
        var path = "/files/basic/api/documents/feed?visibility=public"
}
	var method ="GET"
	
	return	exports.getJSON(method, path, type, function(speech){
		callback(speech)
	});
}

exports.postToIBM = function (callback, name, type){
	var path;
	var body;
		switch(type) {
    case "communities":
		path = "/communities/service/atom/communities/my"
		body = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:app="http://www.w3.org/2007/app" xmlns:snx="http://www.ibm.com/xmlns/prod/sn"><title type="text">'+name+'</title><content type="html"></content><category term="community" scheme="http://www.ibm.com/xmlns/prod/sn/type"></category><snx:communityType>public</snx:communityType></entry>'
        break;
    case "activities":
        path = "/activities/service/atom2/activities"
		body = ""
        break;
	case "files":
        path = "/files/basic/api/documents/feed?visibility=public"
		break;
	case "activity nodes":
		path = "/activities/service/atom2/activity?activityUuid=ac7081f8-417c-407c-a3bb-c13ddc541ea8"
		body = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:snx="http://www.ibm.com/xmlns/prod/sn"> <title type="text">'+name+'</title> <category scheme="http://www.ibm.com/xmlns/prod/sn/type" term="todo" label="To Do"/> <content type="html">          	&lt;p dir="ltr">TEST&lt;/p>      	  </content> <snx:communityUuid/> </entry>'
}

	var method = "POST"
	return	exports.getJSON(method, path,type, function(speech){
		callback(speech)
	}, body);

}

exports.postActivityNodes = function (callback, name){
	var method = "POST"
	var body = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:snx="http://www.ibm.com/xmlns/prod/sn"> <title type="text">'+name+'</title> <category scheme="http://www.ibm.com/xmlns/prod/sn/type" term="todo" label="To Do"/> <content type="html">          	&lt;p dir="ltr">TEST&lt;/p>      	  </content> <snx:communityUuid/> </entry>'
	var path = "/activities/service/atom2/activity?activityUuid=ac7081f8-417c-407c-a3bb-c13ddc541ea8"
	return	exports.getJSON(method, path,"activity nodes", function(speech){
		callback(speech)
	}, body);

}

exports.getJSON = function(method, path, type, callback, body){
var request = require('request');
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
    if (!error && response.statusCode == 200) {
	var parser = new xml2js.Parser();
	console.log("********************BODY********************")
	console.log(body)
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
	if (!error && response.statusCode == 201){
		console.log("SUCCES")
		callback("Entry has been succesfully added to your "+type)
	}
	console.log("**STATUS**")
	console.log(error)
	console.log(response.statusCode)
})
}
