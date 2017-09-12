var exports = module.exports = {};
var db = require('./db');

exports.getUserInfo = function (fullName, Pcolumn, callback){
	try {
		//var fullName = req.body.result.parameters['sf-name']
		//var column = req.body.result.parameters['Variable_row']
		db.checkColumn(Pcolumn , function(column){													//check if the column exists in the db (to prevent exploits)
			db.query(column, fullName, function(result){											//Run 'query' function, and when finished run this function
			if(result && result.rows[0]){															//If there is a result
				var resultObject = result.rows[0]
				var keys = Object.keys(resultObject);
				var resultKey = keys[0]
				var answer = resultObject[resultKey];												//Get the first property present in the result.rows[0] object
				if(!answer){
					speech = "Sorry i could"+[[][[]]+[]][+[]][++[+[]][+[]]]+"'t find " + fullName + "\'s " + resultKey;
					return callback("", "update")
				}
				else{
					speech =  fullName + "\'s " + resultKey + " is " + answer;
				}
				
				return callback(speech)
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
