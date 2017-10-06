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
	case "todos":
        var path = "/activities/service/atom2/todos"
		break;
	default:
		return callback("Cannot find " + type + " in system. Please check  your spelling or try again.");
	
}
	var method ="GET"
	
	return	exports.getJSON(method, path, type, function(entries, error){
		if(error){
		return callback(entries)
		}
		if(entries){
			var speech = "These are you "+type+": " + entries
		}
		else{
			var speech = "You don't have any "+type
		}
		callback(speech)
	});
}

exports.postToIBM = function (callback, name, type, activity){
	var path;
	var body;
	exports.getIdByName(activity, '/activities/service/atom2/activities' , function(activityID){
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
	return	exports.getJSON(method, path,type, function(error){
		if(error){
			var speech = error
		}
		else{
			var speech = "Entry has been succesfully added to your " + type;
		}
		callback(speech)
	}, body);

		})
		}

exports.updateIBM = function (varName, varValue, callback){
	exports.getIdByName("NIEUWE TODO",'/activities/service/atom2/todos', function(id){
			exports.getJSON("GET", '/activities/service/atom2/activitynode?activityNodeUuid='+id, "updateTodo", function(){
			var body = '<entry> <id>urn:lsid:ibm.com:oa:24b3163d-cedb-41e2-89de-b0eabfd7c2b2</id> <title type="text">NIEUWE TODO</title> <updated>2017-10-06T06:40:37Z</updated> <published>2017-10-05T08:20:35Z</published> <author> <snx:org><uri>https://apps.ce.collabserv.com/activities/service/atom2/memberprofile?memberid=</uri> </snx:org> <name>Roy Tersluijsen</name> <snx:userid>203079380</snx:userid> <snx:ldapid>7fa6bb89-a0c2-409f-8cdc-b11bd1f3e23c</snx:ldapid> <snx:userState>active</snx:userState> <snx:isExternal>false</snx:isExternal> <snx:defaultMemberRole>author</snx:defaultMemberRole> </author> <contributor> <snx:org><uri>https://apps.ce.collabserv.com/activities/service/atom2/memberprofile?memberid=</uri> </snx:org> <name>Roy Tersluijsen</name> <snx:userid>203079380</snx:userid> <snx:ldapid>7fa6bb89-a0c2-409f-8cdc-b11bd1f3e23c</snx:ldapid> <snx:userState>active</snx:userState> <snx:isExternal>false</snx:isExternal> <snx:defaultMemberRole>author</snx:defaultMemberRole> </contributor> <category scheme="http://www.ibm.com/xmlns/prod/sn/type" term="todo" label="To Do"/> <category scheme="http://www.ibm.com/xmlns/prod/sn/flags" term="completed" label="Completed"/> <category scheme="http://www.ibm.com/xmlns/prod/sn/flags" term="checked" label="Checked"/> <category scheme="http://www.ibm.com/xmlns/prod/sn/flags" term="external" label="External"/> <snx:isExternal>true</snx:isExternal> <thr:in-reply-to ref="urn:lsid:ibm.com:oa:8e7ef6d8-a283-4e53-8653-6711c9c0e8b9" type="application/atom+xml" href="https://apps.ce.collabserv.com/activities/service/atom2/activitynode?activityNodeUuid=8e7ef6d8-a283-4e53-8653-6711c9c0e8b9" source="urn:lsid:ibm.com:oa:8e7ef6d8-a283-4e53-8653-6711c9c0e8b9" /> <snx:activity>8e7ef6d8-a283-4e53-8653-6711c9c0e8b9</snx:activity> <link rel="edit" type="application/atom+xml" href="https://apps.ce.collabserv.com/activities/service/atom2/activitynode?activityNodeUuid=24b3163d-cedb-41e2-89de-b0eabfd7c2b2" /> <link rel="self" type="application/atom+xml" href="https://apps.ce.collabserv.com/activities/service/atom2/activitynode?activityNodeUuid=24b3163d-cedb-41e2-89de-b0eabfd7c2b2"/> <link rel="alternate" type="application/xhtml+xml" href="https://apps.ce.collabserv.com/activities/service/html/activityentry?uuid=24b3163d-cedb-41e2-89de-b0eabfd7c2b2"/> <link rel="alternate" type="text/html" href="https://apps.ce.collabserv.com/activities/service/html/activityentry?uuid=24b3163d-cedb-41e2-89de-b0eabfd7c2b2"/> <snx:position>5000</snx:position> <snx:depth>1</snx:depth> <snx:permissions>none, create_activity, view_activity, edit_activity, delete_activity, activity_owner, edit_activity_tags, design_activity, edit_statements, delete_statements, add_members, delete_members, create_entries, edit_personal_entries, edit_all_entries, delete_personal_entries, delete_all_entries, edit_personal_entry_tags, edit_all_entry_tags, view_members</snx:permissions> <snx:icon>https://apps.ce.collabserv.com/activities/nav/common/styles/images/iconTask.gif</snx:icon> <content type="html"> <p dir="ltr"></p> </content> <snx:communityUuid></snx:communityUuid> </entry>'
			console.log("******************************BODY*****************************")
			console.log(body)
				exports.getJSON("PUT", '/activities/service/atom2/activitynode?activityNodeUuid='+id, "updateTodo", function(parameter){
				}, body)
		
	})
	})
}

exports.getJSON = function(method, path, type, callback, body){
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
		if(type == "updateTodo"){
			return callback(body)
		}
 	return parser.parseString(body, function (err, HTTPresult){
		var entries = HTTPresult['feed']['entry'];
		if(!entries){
			return callback()
		}
		var titles = ""
		for(var index = 0; index < entries.length; ++index){
			titles += "\n"+entries[index]['title'][0]['_']+"\n";
			if(type == "files"){
				var URL = entries[index]['link'][0]['$']['href'].replace(/entry/g, 'media')
				titles += URL;
		
		}
			
		}
		return callback(titles)
	})
    }
	//No error and creation was succesful
	if (!error && response.statusCode == 201){
		return callback()
	}
	//Either an error, or a statuscode for an insuccesful request
	else{
		
		var speech = error + "\nSomething went wrong, please check if this record exists. And if you have the appropriate rights to fulfill this action"
		if(response){
		speech += "(" + response.statusCode + ")"
			}
		return callback(speech, true)
	}
})}

exports.getIdByName = function(varName ,path ,callback){
	var id = "";
	var headers = {
	"Content-Type": 'application/atom+xml',
	"authorization": exports.auth
	}
	
	var options = {
	url: 'https://apps.ce.collabserv.com' + path,
    method: "GET",
    headers: headers,
	}
	
	request(options, function (error, response, body) {		
		if (!error && response.statusCode == 200) {
			return parser.parseString(body, function (err, HTTPresult){
				var entries = HTTPresult['feed']['entry'];
			if(!entries){
				return callback()
			}
				for(var index = 0; index < entries.length; ++index){
					if(entries[index]['title'][0]['_'] == varName){
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
