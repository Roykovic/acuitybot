var db = require('./db');
var exports = module.exports = {};

exports.getUserInfo = function (fullName, column, res){
	    try {
		db.checkColumn(column, function(column){				//check if the column exists in the db (to prevent exploits)
			db.query(column, fullName, function(result){											//Run 'query' function, and when finished run this function
			if(result && result.rows[0]){															//If there is a result
				var resultObject = result.rows[0]
				var keys = Object.keys(resultObject);
				var resultKey = keys[0]
				var answer = resultObject[resultKey];												//Get the first property present in the result.rows[0] object
				if(!answer){
					speech = "Sorry i could"+[[][[]]+[]][+[]][++[+[]][+[]]]+"'t find " + fullName + "\'s " + resultKey; 
				}
				else{
					speech =  fullName + "\'s " + resultKey + " is " + answer;
				}
				
				return speech
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

exports.returnJson = function (res, speech, messages){
	return res.json({																				
						speech: speech,
						messages: messages,
						displayText: speech,
						source: 'apiai-webhook-sample'
					});
}