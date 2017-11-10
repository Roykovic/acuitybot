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
					"Authorization": "Bearer " +  access_token
					"Content-Type": 'application/json',					
				}
		
				var body = {}
				body[column] = variable;
				
				var options = {
					'url': 'https://eu11.salesforce.com/'+url,
					'method': "PATCH",
					'headers': headers,
					'form': body
				}				
				
				httpRequest(options, function(error, response, body) {
					console.log(error)
					console.log(body)
					body = JSON.parse(body)
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

exports.log = function(reqIn, resIn, score, intent,callback){
	var pool  = mysql.createPool({
	  database: "ibmx_a6f1d89267096f1",
	  host: "us-cdbr-sl-dfw-01.cleardb.net",
	  user: "b332003fffc8cc",
	  password: "d446664b"
	});

   pool.getConnection(function(err,connection){
        if (err) {
          callback();
          return;
        }
        connection.query('INSERT INTO logs (request, result, score, intent) VALUES (?,?,?,?)', [reqIn, resIn, score, intent],function(err,results){
            connection.release();
            if(!err) {
                callback();
            }
            // check null for results here
        });
        connection.on('error', function(err) {
              callback();
              return;
        });
    });
}

 
