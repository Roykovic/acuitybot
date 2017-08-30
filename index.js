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
 
 
 
var connectionString = "postgres://kajfadstryppyp:f165079bc885c141465673e6e3c15f5372b0cdc77a739f99e2ce5384130295a5@ec2-184-72-230-93.compute-1.amazonaws.com:5432/dc533m8c3hgprj?ssl=true"
var pg = require('pg');
var pool = new pg.Pool()
/* pg.connect(connectionString, function(err, client, done) {
			client.query('SELECT Name FROM salesforce.Contact', function(err, result) {
				done();
				if(err) return console.error(err);
				console.log(result.rows);
			});
		}); */
		
 
 
 
'use strict';
const express = require('express');
const bodyParser = require('body-parser');


const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function (req, res) {

    console.log('hook request');

    try {
        var speech = 'empty speech';

        if (req.body) {
            var requestBody = req.body;

            if (requestBody.result) {
                speech = '';

                if (requestBody.result.fulfillment) {
                    speech += requestBody.result.fulfillment.speech;
                    speech += ' ';
                }

                if (requestBody.result.action) {
                    speech += 'action: ' + requestBody.result.action;
                }
            }
        }
		 let Firstname = req.body.result.parameters['given-name'];
		 let Lastname = req.body.result.parameters['last-name'];
		 let Fullname = Firstname + " " + Lastname;
			pool.connect(connectionString, function(err, client, done) {
				client.query('SELECT * FROM salesforce.Contact WHERE Name LIKE John Bond', function(err, result) {
					done();
					if(err) return console.error(err);
				});
			});
			
			pool.end()	
		speech = result.rows;
        return res.json({
            speech: speech,
            displayText: speech,
            source: 'apiai-webhook-sample'
        });
    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});