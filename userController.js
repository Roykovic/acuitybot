'use strict'

var exports = module.exports = {};
var salesForcedb = require('./db');
var salesforceController = require('./salesforceController')
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
			return salesforceController.getContacts(fullname, userID, function(sfUser){	
						if(sfUser['rows'].length > 0){
							return callback(service.services.SalesForce, url)
						}	
				})
				return ibmController.getUser(fullname, function(ibmUser){
							if(ibmUser){
								return callback(service.services.IBM)
							}			
				})	
		}
	else{
		return callback();
	}
	})					
}

