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

var request;
var result;
var speech = 'empty speech';
var db = require('./db');
var loginController = require('./loginController')
var userController = require('./userController')
var auth = false;
var sessionId = "";
var http = require("http");
var https = require("https");
var xml2js = require('xml2js');
const express = require('express');
const bodyParser = require('body-parser');
const restService = express();

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
	request = req;
	result = res;
	var intent = req.body.result.metadata.intentName;
	if(intent != "Login"){
//		if(!auth || request.body.sessionId != sessionId){
//		return result.json({																				
//							name: "Login",
//							displayText: speech,
//							source: 'apiai-webhook-sample',
//							followupEvent: {
//								name:"login"
//							}
//						});
//		}
	}
	
	switch (intent) {
    case "Login":
		return login();
        break;
    case "Logout":
        sessionId = "";
		auth = false;
		return returnJson("User logged out succesfully, see you later!");
        break;
	case "update":	
    case "data for update":
		var context = req.body.result.contexts[0]
		var column = context.parameters.Variable_row;
		var variables = [context.parameters['variable'], context.parameters['sf-name']];
			db.updateQuery(column, variables, function(){
			return returnJson(context.parameters['sf-name']+"\'s "+column+" changed to "+context.parameters['variable']);
			})
		break;
	case "User-info":
		var fullName = request.body.result.parameters['sf-name']
		var column = request.body.result.parameters['Variable_row']
		userController.getUserInfo(fullName, column, function(speech, followUp){
			return returnJson(speech, followUp)
		});
		break;
	case "ibmtest":	
		console.log('ibmtest')
		var username = 'r.tersluijsen@acuity.nl';
		var password = 'Jidok1839';
		var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
		var options = {
		  "method": "GET",
		  "hostname": "apps.ce.collabserv.com",
		  "port": null,
		  "path": "/files/basic/api/documents/feed?sK=created&sO=dsc&visibility=public",
		  "headers": {
			"authorization": auth,
			"cache-control": "no-cache",
		}};
				getJSON(options)
		break;		
	default:
       	return wakeUp();
        break;
	}
})

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});

function login(){
	login = false;
	var user = request.body.result.parameters['Username']
	var pass = request.body.result.parameters['Password']
	return loginController.login(user, pass, function(succes){
		if(succes){
			sessionId = request.body.sessionId;
			auth = true;		
			speech = "Login succesful, welcome back!"
		}
		else{
			speech = "Login failed, please check username and password"	
		}
		return returnJson(speech)
	})
}

function wakeUp(){
	if (request.body) {
		if (request.body.result) {
			speech = '';

			if (request.body.result.fulfillment) {
				speech += request.body.result.fulfillment.speech;
				speech += ' ';
			}
		}
	}
	return returnJson(speech);
}

function getJSON(options)
{
const https = require('https');

https.get(options, (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
	var parser = new xml2js.Parser();
	parser.parseString(data, function (err, result){

		var entries = result['feed']['entry'];
		var names = ""
		for(var index = 0; index < entries.length; ++index){
			if(index>0){
				names+= ", "
			}
			console.dir(entries[index]['link'][0]['$']['href'])
			names += "["+entries[index]['title'][0]['_']+"]("+entries[index]['link'][0]['$']['href']+")"
		}
		
		return returnJson("- [Oh yea!](http://example.com/polls/yd242?response=yes)\n- [Ewww Sushi](http://example.com/polls/yd242?response=no)\n- [Not today](http://example.com/polls/yd242?response=later)")
		//returnJson("These are you files: " + names);
	})
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
}

function returnJson(speech, followUp){
	return result.json({																				
						speech: speech,
						displayText: speech,
						source: 'apiai-webhook-sample',
						followupEvent: {
							name:followUp
						},
						messages: [
								{
								  "type": 4,
								  "speech": "Hi! Nice to meet you, $name! What is your hobby?"
								}
							  ]							
					});
}



