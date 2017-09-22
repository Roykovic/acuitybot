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
	var body = '<entry>\r\n<id>urn:lsid:ibm.com:oa:CB6G0A0A0A0A6A64A3530068E6E73C0002FF</id>\r\n<title type="text">this is a longer one</title>\r\n<updated>2008-04-22T17:22:43Z</updated>\r\n<published>2008-04-22T17:22:43Z</published>\r\n<author>\r\n<name>Michelle Jenkins</name>\r\n<email>michelle_jenkins@us.example.com</email>\r\n<snx:userid>937965j0-4f0c-1028-5a06-db07163b51b2</snx:userid>\r\n<snx:ldapid>96CG046E0E4B47BEF6967B3131AD5900026D</snx:ldapid>\r\n</author>\r\n<contributor>\r\n<name>Michelle Jenkins</name>\r\n<email>michelle_jenkins@us.example.com</email>\r\n<snx:userid>937965j0-4f0c-1028-5a06-db07163b51b2</snx:userid>\r\n<snx:ldapid>96CG046E0E4B47BEF6967B3131AD5900026D</snx:ldapid>\r\n</contributor>\r\n<category\r\nscheme="http://www.ibm.com/xmlns/prod/sn/type" term="todo" label="To Do" />\r\n<snx:duedate>2008-04-23T04:00:00Z</snx:duedate>\r\n<snx:activity>3F8G0A0A0A0AAAF115C2B208A75140000002</snx:activity>\r\n<link\r\nrel="edit"\r\ntype="application/atom+xml"\r\nhref="https://sales.enterprise.example.com/activities/service/atom2/\r\nactivitynode?activityNodeUuid=CB6G0A0A0A0A6A64A3530068E6E73C0002FF" />\r\n<link\r\nrel="self"\r\ntype="application/atom+xml"\r\nhref="https://sales.enterprise.example.com/activities/service/atom2/\r\nactivitynode?activityNodeUuid=CB6G0A0A0A0A6A64A3530068E6E73C0002FF" />\r\n<link\r\nrel="alternate"\r\ntype="application/xhtml+xml"\r\nhref="https://sales.enterprise.example.com:443/activities/service/html2/\r\nactivityentry?uuid=CB6G0A0A0A0A6A64A3530068E6E73C0002FF" />\r\n<link\r\nrel="alternate"\r\ntype="text/html"\r\nhref="https://sales.enterprise.example.com:443/activities/service/html2/\r\nactivityentry?uuid=CB6G0A0A0A0A6A64A3530068E6E73C0002FF" />\r\n<snx:position>16000</snx:position>\r\n<snx:icon>https://sales.enterprise.example.com/activities/images/\r\nicon_taskIncomplete.gif</snx:icon>\r\n<content type="html">Will add more info here.<br>&nbsp;</content>\r\n</entry>'
	var path = "/activities/service/atom2/activity?activityUuid=ac7081f8-417c-407c-a3bb-c13ddc541ea8"
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
		  "Content-Type": 'application/atom+xml',
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
