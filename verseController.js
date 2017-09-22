'use strict'

var exports = module.exports = {};
var http = require("http");
var https = require("https");
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
	var body = ''
	var path = "/activities/service/atom2/activity?activityUuid=ac7081f8-417c-407c-a3bb-c13ddc541ea8"
	return	exports.getJSON(method, path,"activities", function(speech){
		callback(speech)
	}, body);

}

exports.getJSON = function(method, path, type, callback, body){
const https = require('https');
var options = {
	  "body" : body,
	  "method": "POST",
	  "hostname": "apps.ce.collabserv.com",
	  "port": null,
	  "path": path,
	  "headers": {
		  "Content-Type": 'application/atom+xml',
		  "authorization": exports.auth
		}
	};

https.get(options, (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });
  resp.on('end', () => {
	var parser = new xml2js.Parser();
		console.log("************************************DATA************************************")
		console.log(data);
		console.log("************************************DATA************************************")
		parser.parseString(data, function (err, HTTPresult){

		console.log("************************************Result************************************")
		console.log(HTTPresult);
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
  });

}).on("error", (err) => {
  callback(err);
});
}
