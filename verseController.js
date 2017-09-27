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
		body = '<atom:id>https://apps.ce.collabserv.com/communities/service/atom/catalog/my</atom:id><atom:title><![CDATA[My Communities]]></atom:title><atom:author><atom:name>Communities Catalog REST Services</atom:name></atom:author><atom:link href="https://apps.ce.collabserv.com/communities/service/atom/catalog/my" rel="self" type="application/atom+xml"/><atom:updated>2017-09-27T13:19:57.360Z</atom:updated><opensearch:Query role="request" searchTerms="*"/><opensearch:startIndex>0</opensearch:startIndex><opensearch:itemsPerPage>10</opensearch:itemsPerPage><opensearch:totalResults exact="true">1</opensearch:totalResults><atom:entry><atom:id>59cc8b20-b222-4ddd-9c73-4a01e7ea1215</atom:id><atom:title><![CDATA[Stage Rick en Roy]]></atom:title><atom:contributor><snx:userid>203079380</snx:userid><atom:name>Roy Tersluijsen</atom:name></atom:contributor><atom:link href="https://apps.ce.collabserv.com/communities/service/html/communitystart?communityUuid=59cc8b20-b222-4ddd-9c73-4a01e7ea1215" rel="alternate" hreflang="en"/><atom:updated>2017-09-11T09:07:30.427Z</atom:updated><atom:summary type="html"><![CDATA[  ]]></atom:summary><snx:isExternal>false</snx:isExternal><opensearch:relevance>1.0</opensearch:relevance><ibmsc:field id="ATOMAPISOURCE">https://apps.ce.collabserv.com/communities/service/atom/community/instance?communityUuid=59cc8b20-b222-4ddd-9c73-4a01e7ea1215</ibmsc:field><ibmsc:field id="FIELD_LIST_WHEN_PRIVATE">false</ibmsc:field><ibmsc:field id="AccessControlLevel">public</ibmsc:field><ibmsc:field id="isInternalOnly">true</ibmsc:field><ibmsc:field id="FIELD_COMMUNITY_MEMBER_COUNT">4</ibmsc:field><ibmsc:field id="FIELD_IS_TRASHED">false</ibmsc:field><ibmsc:field id="ImageLastMod">1503905485929</ibmsc:field><ibmsc:field id="groupCount">0</ibmsc:field><ibmsc:field id="FIELD_MEMBERS_UPDATE_DATE">1503905535335</ibmsc:field><ibmsc:field id="ContentSourceType">Communities</ibmsc:field><ibmsc:field id="FIELD_UPDATE_FLAG">NONE</ibmsc:field></atom:entry>'
        break;
    case "activities":
        path = "/activities/service/atom2/activities"
		body
        break;
	case "files":
        var path = "/files/basic/api/documents/feed?visibility=public"
		break;
	case "activity nodes":
		path = "/activities/service/atom2/activity?activityUuid=ac7081f8-417c-407c-a3bb-c13ddc541ea8"
		body = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:snx="http://www.ibm.com/xmlns/prod/sn"> <title type="text">'+name+'</title> <category scheme="http://www.ibm.com/xmlns/prod/sn/type" term="todo" label="To Do"/> <content type="html">          	&lt;p dir="ltr">TEST&lt;/p>      	  </content> <snx:communityUuid/> </entry>'
}

	var method = "POST"
//	var body = '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:snx="http://www.ibm.com/xmlns/prod/sn"> <title type="text">'+name+'</title> <category scheme="http://www.ibm.com/xmlns/prod/sn/type" term="todo" label="To Do"/> <content type="html">          	&lt;p dir="ltr">TEST&lt;/p>      	  </content> <snx:communityUuid/> </entry>'
//	var path = "/activities/service/atom2/activity?activityUuid=ac7081f8-417c-407c-a3bb-c13ddc541ea8"
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
		callback("Entry has been succesfully added to your "+type)
	}
})
}
