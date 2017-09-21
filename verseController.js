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
	var body = '<entry>\r\n<id>urn:lsid:ibm.com:oa:3F8G0A0A0A0AAAF115C2B208A75140000002</id>\r\n<title type="text">Michelle\'s test activity for 2.0 doc</title>\r\n<updated>2008-04-16T15:06:16Z</updated>\r\n<published>2008-01-25T19:23:48Z</published>\r\n<author>\r\n<name>Michelle Jenkins</name>\r\n<email>michelle_jenkins@us.example.com</email>\r\n<snx:userid>937965j0-4f0c-1028-5a06-db07163b51b2</snx:userid>\r\n<snx:ldapid>96CG046E0E4B47BEF6967B3131AD5900026D</snx:ldapid>\r\n</author>\r\n<contributor>\r\n<name>Michelle Jenkins</name>\r\n<email>michelle_jenkins@us.example.com</email>\r\n<snx:userid>937965j0-4f0c-1028-5a06-db07163b51b2</snx:userid>\r\n<snx:ldapid>96CG046E0E4B47BEF6967B3131AD5900026D</snx:ldapid>\r\n</contributor>\r\n<category\r\nscheme="http://www.ibm.com/xmlns/prod/sn/type"\r\nterm="activity"\r\nlabel="Activity" />\r\n<category\r\nscheme="http://www.ibm.com/xmlns/prod/sn/priority"\r\nterm="3000"\r\nlabel="High" />\r\n<snx:duedate>2008-01-31T05:00:00Z</snx:duedate>\r\n<category term="two-word" />\r\n<link\r\nrel="http://www.ibm.com/xmlns/prod/sn/member-list"\r\ntype="application/atom+xml"\r\nhref="https://sales.enterprise.example.com/activities/service/atom2/\r\nacl?activityUuid=3F8G0A0A0A0AAAF115C2B208A75140000002" />\r\n<link\r\nrel="http://www.ibm.com/xmlns/prod/sn/history"\r\ntype="application/atom+xml"\r\nhref="https://sales.enterprise.example.com/activities/service/atom2/\r\nactivity/history?activityUuid=3F8G0A0A0A0AAAF115C2B208A75140000002" />\r\n<app:collection\r\nhref="https://sales.enterprise.example.com/activities/service/atom2/\r\nactivity?activityUuid=3F8G0A0A0A0AAAF115C2B208A75140000002">\r\n<title type="text">Michelle\'s 2.0 activity</title>\r\n<app:categories\r\nhref="https://sales.enterprise.example.com/activities/service/atom2/activity/\r\ncategories?activityUuid=3F8G0A0A0A0AAAF115C2B208A75140000002" />\r\n</app:collection>\r\n<snx:activity>3F8G0A0A0A0AAAF115C2B208A75140000002</snx:activity>\r\n<link\r\nrel="edit"\r\ntype="application/atom+xml"\r\nhref="https://sales.enterprise.example.com/activities/service/atom2/\r\nactivitynode?activityNodeUuid=3F8G0A0A0A0AAAF115C2B208A75140000002" />\r\n<link\r\nrel="self"\r\ntype="application/atom+xml"\r\nhref="https://sales.enterprise.example.com/activities/service/atom2/\r\nactivity?activityUuid=3F8G0A0A0A0AAAF115C2B208A75140000002" />\r\n<link\r\nrel="alternate"\r\ntype="application/xhtml+xml"\r\nhref="https://sales.enterprise.example.com/activities/service/html2/activity/\r\nrecent?activityUuid=3F8G0A0A0A0AAAF115C2B208A75140000002" />\r\n<link\r\nrel="alternate"\r\ntype="text/html"\r\nhref="https://sales.enterprise.example.com/activities/service/html2/activity/\r\nrecent?activityUuid=3F8G0A0A0A0AAAF115C2B208A75140000002" />\r\n<snx:icon>\r\nhttps://sales.enterprise.example.com/activities/images/priority_high.gif\r\n</snx:icon>\r\n<content type="text"><br _moz_editor_bogus_node="TRUE" /></content>\r\n</entry>\r\n' 
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
