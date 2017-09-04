/**
 * Copyright 2017 Acuity BV. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var connectionString = require('./config/config.js');
var pg = require('pg');

var speech = 'empty speech';

const express = require('express');
const bodyParser = require('body-parser');
const restService = express();
restService.use(bodyParser.json());


restService.post('/hook', function(req, res) {

    console.log('hook request');

	if(req.body.result.metadata.intentName == "Default Welcome Intent" || req.body.result.action.includes("smalltalk.")){
		wakeUp(req);
		return res.json({																		//return the result in a json response
						speech: speech,
						displayText: speech,
						source: 'apiai-webhook-sample'
					});
		
	}	 
    try {
			var fullName = req.body.result.parameters['sf-name']
				var requestBody = req.body;	
				var fullName = requestBody.result.parameters['sf-name']
				var column = checkColumn(requestBody.result.parameters['Variable_row'])
			query(column, fullName, function(result, columnName){											//Run 'query' function, and when finished run this function
				if(result && result.rows[0]){													//If there is a result
					var resultObject = result.rows[0]
					console.log('Result object')
					console.log(resultObject)
					var keys = Object.keys(resultObject);
					var resultKey = keys[0]
					var answer = resultObject[resultKey];										//Get the first property present in the result.rows[0] object
					if(!answer){
						speech = "Sorry i couldn't find " + fullName + "\'s " + columnName; 
					}
					else{
						speech =  fullName + "\'s " + columnName + " is " + answer;
					}
					
					return res.json({															//return the result in a json response
						speech: speech,
						displayText: speech,
						source: 'apiai-webhook-sample'
					});
				};
						
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
})

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});

function wakeUp(req){
	if (req.body) {
		var requestBody = req.body;

		if (requestBody.result) {
			speech = '';

			if (requestBody.result.fulfillment) {
				speech += requestBody.result.fulfillment.speech;
				speech += ' ';
			}
		}
	}
}

function checkColumn(column){
	query("*", "false", function(result){
		console.log("Checkcolumn result: ")
		console.log(result)
	}
/* 	for (var i = 0, len = arr.length; i < len; i++) {
		someFn(arr[i]);
	} */
	return column;
}

function query(column, variable, callBack){
	if(column && variable){
		pg.defaults.ssl = true;
		var pool = new pg.Pool({
		  connectionString: connectionString,
		})
		pool.connect(function(err, client) {
		  if (err) throw err;
		  console.log('Connected to postgres! Getting schemas...');
		  client
		  //.query("select * from salesforce.contact where false;")
			.query('SELECT $1::text FROM salesforce.contact WHERE name=$2', [column, variable])
			.then(res => callBack(res))
			.catch(e => console.error("Error while executing query\n" +e.stack));
		})
	}
	callBack(null)
}

