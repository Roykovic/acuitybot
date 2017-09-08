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

var speech = 'empty speech';
var db = require('./db');
var interactor = require('./interactor');
var loginController = require('./loginController')
var auth = false;
var sessionId = "";
var login = false;
const express = require('express');
const bodyParser = require('body-parser');
const restService = express();
// Add headers
restService.use(function (req, res, next) {															//Method to allow http request from login site, this is a WIP, as there is no login site yet...
    res.setHeader('Access-Control-Allow-Origin', 'http://html-login.herokuapp.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', false);
    next();
});
restService.use(bodyParser.urlencoded({ extended: true }));        

restService.use(bodyParser.json());


restService.post('/hook', function(req, res) {
    console.log('hook request');
	
	
	if(req.body.result.metadata.intentName == "Default Welcome Intent" || req.body.result.action.includes("smalltalk.")){
		return wakeUp(req, res);
	}	 
	
	
	if(req.body.result.metadata.intentName == "Login"){
		login = false;
		var user = req.body.result.parameters['Username']
		var pass = req.body.result.parameters['Password']
		return loginController.login(user, pass, function(succes){
			if(succes){
				sessionId = req.body.sessionId;
				auth = true;
				var answerSpeech = interactor.getUserInfo("John Bond", "address", res);
				speech = ""
				var messages = [
						{
						"type": 0,
						"speech": "Login succesful, welcome back!"
						},
						{
						"type": 0,
						"speech": answerSpeech
						}
						]
			}
			else{
				speech = "Login failed, please check username and password"	
			}
			return returnJson(res, speech, messages)
		})
	}
	if(req.body.result.metadata.intentName == "Logout"){
			sessionId = "";
			auth = false;
		return returnJson(res, "User logged out succesfully, see you later!");
	}
	if(!login){
		if(!auth || req.body.sessionId != sessionId){
		return res.json({																				
							name: "Login",
							displayText: speech,
							source: 'apiai-webhook-sample',
							followupEvent: {
								name:"login"
							}
						});
		}
	}
	var name = req.body.result.parameters['sf-name'];
	var column = req.body.result.parameters['Variable_row']
	return interactor.getUserInfo(name, column, res)
})

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});

function wakeUp(req, res){
	if (req.body) {
		if (req.body.result) {
			speech = '';

			if (req.body.result.fulfillment) {
				speech += req.body.result.fulfillment.speech;
				speech += ' ';
			}
		}
	}
	return returnJson(res, speech);
}

function returnJson(res, speech, messages){
	return res.json({																				
						speech: speech,
						messages: messages,
						displayText: speech,
						source: 'apiai-webhook-sample'
					});
}


