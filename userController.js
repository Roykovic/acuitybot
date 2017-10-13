'use strict'

var exports = module.exports = {};
var salesForcedb = require('./db');
var verseController = require('./verseController')
var service = require('./service')

exports.getUserInfo = function (fullName, Pcolumn, callback){
	try {
		salesForcedb.checkColumn(Pcolumn , function(column){										//check if the column exists in the db (to prevent exploits)
			salesForcedb.query(column, fullName, function(result){									//Run 'query' function, and when finished run this function
			if(result && result.rows[0]){															//If there is a result
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
		for(int i = 0; i<users.length; ++i){
			var name = users[i].name
			names[i] = name
		}
		console.log(names)
		callback();
	})	
}

exports.getServiceByName = function(fullname, callback){
	salesForcedb.getUser(fullname, function(sfUser){	
	console.log("#1")
		if(sfUser['rows'].length > 0){
				console.log("if")
			return callback(service.services.SalesForce)
		}
		else{
				console.log("else")
			verseController.getUser(fullname, function(ibmUser){
					console.log("#2")
				if(ibmUser){
					console.log("IBM IS TRUE")
					return callback(service.services.IBM)
				}			
					console.log("Past if")
			})		
		}
		return callback()
	})
}
