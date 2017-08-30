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
 
 
 var connectionString = 'postgres://xkmrmtanjzvitd:50a15571798f062acd52e12385a13083eeaa326ca4d562272ef7002fcc2a641e@ec2-54-75-239-190.eu-west-1.compute.amazonaws.com:5432/danmi0s4e2dhn4'
 var pg = require('pg');
 
var pool = new pg.Pool({
  connectionString: connectionString,
})
pg.defaults.ssl = true;
pool.connect(function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

  client
    .query('SELECT table_schema,table_name FROM information_schema.tables;')
    .then(res => console.log(res.rows[0]));
});
 
 
 
 
 
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
		 let city = req.body.result.parameters['geo-city'];
			 let date = 'Today';
		if (req.body.result.parameters['date']) {
			date = req.body.result.parameters['date'];
			console.log('Date: ' + date);
			date = "on " + date;
			}
        speech = "It will be hot in " + city + " " + date;

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