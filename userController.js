'use strict'

var exports = module.exports = {};
var db = require('./db');

exports.getUserInfo = function (fullName, Pcolumn, callback){
	try {
		db.checkColumn(Pcolumn , function(column){													//check if the column exists in the db (to prevent exploits)
			db.query(column, fullName, function(result){											//Run 'query' function, and when finished run this function
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
