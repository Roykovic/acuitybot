/**
 * Copyright 2017 Google Inc. All Rights Reserved.
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
const express = require('express');
const bodyParser = require('body-parser');
	var connectionString = 'postgres://xkmrmtanjzvitd:50a15571798f062acd52e12385a13083eeaa326ca4d562272ef7002fcc2a641e@ec2-54-75-239-190.eu-west-1.compute.amazonaws.com:5432/danmi0s4e2dhn4'
	var pg = require('pg');

const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function(req, res) {

    console.log('hook request');
	var speech = 'empty speech';

		 
    try {

			var fullName = req.body.result.parameters['sf-name']
			query(req, function(result){
				if(result.rows[0] != undefined){
					var keys = Object.keys(result.rows[0]);
					var resultKey = keys[0]
					var answer = result.rows[0][resultKey];
					if(answer == null){
						speech = "Sorry i couldn't find" + fullName + "\'s " + resultKey; 
					}
				speech = "The " + resultKey + " is " +answer;}
					
					return res.json({
						speech: speech,
						displayText: speech,
						source: 'apiai-webhook-sample'
					});
			});
						
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

function query(req, callBack){
			var requestBody = req.body;
			var column = requestBody.result.parameters['Variable_row']
			var fullName = requestBody.result.parameters['sf-name']
			pg.defaults.ssl = true;
			var pool = new pg.Pool({
			  connectionString: connectionString,
			})
	
			pool.connect(function(err, client) {
			  if (err) throw err;
			  console.log('Connected to postgres! Getting schemas...');
			  client
				.query('SELECT '+ column + ' FROM salesforce.Contact WHERE name=\'' + fullName + "\';")
				.then(res => callBack(res))
				.catch(e => console.error(e.stack));
			})
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});