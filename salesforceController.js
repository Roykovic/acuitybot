'use strict'

var self = this;
var oauth = require('./oauth')
var httpRequest = require('request');
var exports = module.exports = {};

exports.getContacts = function(access_token, callback){
		var headers = {
			"Authorization": "Bearer " +  access_token
		}

		var options = {
			url: 'https://eu11.salesforce.com/services/data/v20.0/query?q=SELECT+Name,MailingStreet,Phone,email,birthdate,department,HomePhone,Fax,MobilePhone,Title,Mailingcity+from+contact',
			method: "GET",
			headers: headers
		}
		
		httpRequest(options, function(error, response, body) {
			body = JSON.parse(body)
			callback(body.records)
		})		
}

exports.getColumns = function(userID, callback){
	oauth.getAccessToken(userID, function(access_token){
		var headers = {
			"Authorization": "Bearer " +  access_token
		}

		var options = {
			url: 'https://eu11.salesforce.com/services/data/v20.0/sobjects/Account/describe/',
			method: "GET",
			headers: headers
		}
		
		httpRequest(options, function(error, response, body) {
			body = JSON.parse(body)
			console.log(response)
			for (var i = 0, len = body.fields.length; i < len; i++) {
				console.log(body.fields[i].name)
			}			
			//callback(body.records)
		})	
	})			
}

exports.getURLByName = function(access_token, fullname, callBack){
		return exports.getContacts(access_token, function(contacts){
			for (var i = 0, len = contacts.length; i < len; i++) {
				if(contacts[i].Name == fullname){
					var url = contacts[i].attributes.url
					return callBack(url)
				}
			}
		})
}

exports.getUserInfo = function(userID, fullname, column, callBack){
	oauth.getAccessToken(userID, function(access_token){
		exports.getContacts(access_token, function(contacts){
			for (var i = 0, len = contacts.length; i < len; i++) {
				if(contacts[i].Name == fullname){
					var answer = contacts[i][column]
					if(answer){
						var speech = fullname+"'s " + column + " is " + answer
						return callBack(speech)
					}
					else{
						return callBack("", "update")	
					}
				}
			}
		})
	})
}

exports.updateUserInfo = function(userID, fullname, column, variable, callBack){
	oauth.getAccessToken(userID, function(access_token){
			exports.getURLByName(access_token, fullname, function(url){
				var headers = {
					"Authorization": "Bearer " +  access_token,
					"Content-Type": 'application/json'					
				}
		
				var body = {}
				body[column] = variable;
				
				var options = {
					'url': 'https://eu11.salesforce.com/'+url,
					'method': "PATCH",
					'headers': headers,
					'body': JSON.stringify(body)
				}				
				
				httpRequest(options, function(error, response, body) {
					callBack()
				})						
			})
	})	
}

exports.checkColumn = function (column, callBack){
	exports.query("*", "false", function(columns){
		if(columns){
			for (var i = 0, len = columns.fields.length; i < len; i++) {
				var columnFromDB = columns.fields[i].name;
				var lowerCaseColumn = columnFromDB.toLowerCase();
				if(lowerCaseColumn == column.toLowerCase()){
					callBack(column);
					return
				}
			}
		}
	})
	return callBack(null);

}

 
