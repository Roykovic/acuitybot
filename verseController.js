'use strict'

var exports = module.exports = {};
var http = require("http");
var https = require("https");
var xml2js = require('xml2js');

exports.auth = "";
exports.getCommunities = function (callback){
	var method = "GET"
	var path = "/communities/service/atom/communities/my"
	return	exports.getJSON(method, path, function(speech){
		callback(speech)
	});

}

exports.getFiles = function (callback){
	var method = "GET"
	var path = "/files/basic/api/myuserlibrary/feed"
	return	exports.getJSON(method, path, function(speech){
		callback(speech)
	});

}


exports.getJSON = function(method, path, callback)
{
const https = require('https');
var options = {
	  "method": method,
	  "hostname": "apps.ce.collabserv.com",
	  "port": null,
	  "path": path,
	  "headers": {
	  "authorization": exports.auth,
		"cache-control": "no-cache",
		}
	};
console.log("**********************OPTIONS**********************")
console.log(options)	
https.get(options, (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });
  resp.on('end', () => {
	var parser = new xml2js.Parser();
	parser.parseString(data, function (err, HTTPresult){
		var entries = HTTPresult['feed']['entry'];
		var titles = ""
		for(var index = 0; index < entries.length; ++index){
			if(index>0){
				titles+= ", "
			}
			titles += "\n"+entries[index]['title'][0]['_']+"\n";
			if(entries[index][link]){
				var URL = entries[index]['link'][0]['$']['href'].replace(/entry/g, 'media')
				titles += URL;
			}
			
		}
		callback("These are you Communities: " + titles)
	})
  });

}).on("error", (err) => {
  callback(err);
});
}
