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
	var path = "/activities/service/atom2/activitynode"
	var body ='<entry\r\n    xmlns="http://www.w3.org/2005/Atom"\r\n    xmlns:app="http://www.w3.org/2007/app"\r\n    xmlns:snx="http://www.ibm.com/xmlns/prod/sn"\r\n    xmlns:xhtml="http://www.w3.org/1999/xhtml"\r\n    xmlns:thr="http://purl.org/syndication/thread/1.0"\r\n  >\r\n  <id>1234</id>\r\n    <title type="text">New</title>\r\n\r\n    <category scheme="http://www.ibm.com/xmlns/prod/sn/type" term="activity" label="Activity"/>\r\n    <category scheme="http://www.ibm.com/xmlns/prod/sn/priority" term="1" label="Normal"/>\r\n    <category term="tag1" />\r\n    <category term="tag2" />\r\n    <content type="html">\r\n          \tGoalOfActivity\r\n     </content>\r\n</entry>'
	return	exports.getJSON(method, path,"activities", function(speech){
		callback(speech)
	}, body);

}

exports.getJSON = function(method, path, type, callback, body){
const https = require('https');
var options = {
	  "body" : body,
	  "method": method,
	  "hostname": "apps.ce.collabserv.com",
	  "port": null,
	  "path": path,
	  "headers": {
	  "authorization": exports.auth,
		"cache-control": "no-cache",
		}
	};

https.get(options, (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });
  resp.on('end', () => {
	var parser = new xml2js.Parser();
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
