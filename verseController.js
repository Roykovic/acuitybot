'use strict'

var exports = module.exports = {};
var http = require("http");
var https = require("https");
http.post = require('http-post');
var xml2js = require('xml2js');

exports.auth = "";
exports.getCommunities = function (callback){
	var method = "GET"
	var path = "/communities/service/atom/communities/my"
	return	exports.getJSON(method, path,"communities", function(speech){
		callback(speech)
	});

}

exports.getActivities = function (callback){
	var method = "GET"
	var path = "/activities/service/atom2/activities?includeCommunityActivities=no"
	return	exports.getJSON(method, path,"activities", function(speech){
		callback(speech)
	});

}

exports.getFiles = function (callback){
	var method = "GET"
	var path = "/files/basic/api/documents/feed?visibility=public"
	return	exports.getJSON(method, path, "files", function(speech){
		callback(speech)
	});

}

exports.postActivities = function (callback){
	var method = "POST"
	var body = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:snx="http://www.ibm.com/xmlns/prod/sn"> <title type="text">TEST22222222222222222</title> <category scheme="http://www.ibm.com/xmlns/prod/sn/type" term="todo" label="To Do"/> <content type="html">          	&lt;p dir="ltr">TEST&lt;/p>      	  </content> <snx:communityUuid/> </entry>'
	var path = "/activities/service/atom2/activity?activityUuid=ac7081f8-417c-407c-a3bb-c13ddc541ea8"
	return	exports.getJSON(method, path,"activities", function(speech){
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
    if (!error && response.statusCode == 200 || response.statusCode == 201) {
	var parser = new xml2js.Parser();
 	parser.parseString(body, function (err, HTTPresult){
		var entries = HTTPresult['feed']['entry'];
		var titles = ""
		for(var index = 0; index < entries.length; ++index){
			if(index>0){
				titles+= ", "
			}
			titles += "\n"+entries[index]['title'][0]['_']+"\n";
			if(type == "files"){
				var URL = entries[index]['link'][0]['$']['href'].replace(/entry/g, 'media')
				titles += URL;
			}
			
		}
		callback("These are you "+type+": " + titles)
	})
    }
	console.log("************************************Status************************************")
	console.log(error)
	console.log(response.statusCode)
})
	

//const https = require('https');
//http.post(options, (resp) => {
//  let data = '';
//
//  resp.on('data', (chunk) => {
//    data += chunk;
//  });
//  resp.on('end', () => {
//	var parser = new xml2js.Parser();
//		parser.parseString(data, function (err, HTTPresult){
//		console.log("************************************Data************************************")
//		console.log(data)		
//		console.log("************************************Result************************************")
//		console.log(HTTPresult);
//		var entries = HTTPresult['feed']['entry'];
//		var titles = ""
//		for(var index = 0; index < entries.length; ++index){
//			if(index>0){
//				titles+= ", "
//			}
//			titles += "\n"+entries[index]['title'][0]['_']+"\n";
//			if(type == "files"){
//				var URL = entries[index]['link'][0]['$']['href'].replace(/entry/g, 'media')
//				titles += URL;
//			}
//			
//		}
//		callback("These are you "+type+": " + titles)
//	})
//  });
//
//}).on("error", (err) => {
//  callback(err);
//});
}
