'use strict'

var accesToken = "5462b4a0987946ee967dbea809dd6676";
var exports = module.exports = {};
var salesForcedb = require('./db');
var salesforceController = require('./salesforceController')
var apiController = require('./apiController')
var ibmController = require('./ibmController')
var service = require('./service')
var oauth = require('./oauth')

exports.getUserInfo = function (fullName, Pcolumn, callback){
	try {
		salesForcedb.checkColumn(Pcolumn , function(column){										//check if the column exists in the db (to prevent exploits)
			salesForcedb.query(column, fullName, function(result){									//Run 'query' function, and when finished run this function
			if(result && result.rows[0]){			
			//If there is a result
				var resultObject = result.rows[0]
				var keys = Object.keys(resultObject);
				var resultKey = keys[0]
				var answer = resultObject[resultKey];												//Get the first property present in the result.rows[0] object
				if(!answer){
					return callback("", "update")													//the query returned 'null' so the record doesn't exist, the user is now given an update event
				}
				else{
					var speech =  fullName + "\'s " + resultKey + " is " + answer;
				}
				return callback(speech)																//the value is shown to the user
			};
					
			})	
		})
				
	} 
	catch (err) {
        console.error("Can't process request", err);
        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
}

exports.getAllNames = function(callback){
	salesForcedb.getUser('%%', function(result){
		var users = result.rows
		var names = [];
		for(var i = 0; i<users.length; ++i){
			var name = users[i].name
			names[i] = name
		}
		callback(names);
	})	
}

exports.getServiceByName = function(fullname, userID, callback){
	return oauth.getAccessToken(userID, function(access_token){
		if(access_token){
			salesforceController.getUser(access_token, fullname, function(sfUser){	
				if(sfUser){
							return callback(service.services.SalesForce)
				}
				ibmController.getUser(fullname, function(ibmUser){	
						if(ibmUser){
							return callback(service.services.IBM)
						}			
						return callback(service.services.None)	
				})
			})			
		}
	else{
		return callback();
	}
	})					
}

exports.addUserEntities = function(sessionId,userId, callback){
	var postPath = "https://api.api.ai/v1/userEntities?v=20150910&sessionId=" + sessionId
	
	exports.getUserEntities(sessionId, function(response){
		if(!response || response < 0){
			var body = '{ "entities": [ { "entries": ['
			var bodyEnd = '], "name": "sf-name" } ], "sessionId":' +sessionId+ '}'
			return oauth.getAccessToken(userId, function(access_token){
				if(!access_token){
					return callback(false) 
				}
				salesforceController.getContacts(access_token, function(contacts){
					for(var i = 0; i<contacts.length; ++i){
						if(i>0) body+=','
						body+= '{ "synonyms": [ "'+contacts[i].Name+'" ], "value": "'+contacts[i].Name+'" }'
					}
					body += bodyEnd;
					return apiController.post(postPath, accesToken, body, function(response){
						callback(true)
					})
				})
			})
		}
		callback(true)
	})
}

exports.getUserEntities = function(sessionId, callback){
	var getPath = "https://api.dialogflow.com/v1/userEntities/sf-name?v=20150910&sessionId=" + sessionId
	apiController.get(getPath,function(response){
		console.log(response)
		callback(response.entities)
	}, accesToken, "application/json")
}
