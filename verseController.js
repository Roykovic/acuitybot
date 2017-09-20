'use strict'

var exports = module.exports = {};
var http = require("http");
var https = require("https");
var xml2js = require('xml2js');

exports.auth = "";
exports.getCommunities = function (){
	var method = "GET"
	var path = "/communities/service/atom/communities/my"
		exports.getJSON(method, path);
		
		return exports.getJSON();
}

// exports.getFiles = function(){
	
// }

exports.getJSON = function(method, path)
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
https.get(options, (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });
  resp.on('end', () => {
	var parser = new xml2js.Parser();
	parser.parseString(data, function (err, HTTPresult){
		console.log("STATUS")
		console.log(HTTPresult.html.body.p)
		var entries = HTTPresult['feed']['entry'];
		var titles = ""
		for(var index = 0; index < entries.length; ++index){
			if(index>0){
				titles+= ", "
			}
			titles += "\n"+entries[index]['title'][0]['_']+"\n";
		}
		return "These are you Communities: " + titles
	})
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
}
