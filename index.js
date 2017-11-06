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
 
//'use strict';

var sessionId;
var username = 'r.tersluijsen@acuity.nl';
var password = 'Jidok1839';
var request;
var result;
var speech = 'empty speech';
var db = require('./db');
var service = require('./service')
var apiController = require('./apiController')
var loginController = require('./loginController')
var userController = require('./userController')
var verseController = require('./verseController')
verseController['auth'] = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
var auth = false;
var sessionId = "";
var httpRequest = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const restService = express();

restService.use(function(req, res, next) { //Method to allow http request from login site, this is a WIP, as there is no login site yet...
    res.setHeader('Access-Control-Allow-Origin', 'http://html-login.herokuapp.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', false);
    next();
});
restService.use(express.static('public'))

restService.use(bodyParser.urlencoded({
    extended: true
}));
restService.use(bodyParser.json());

restService.get('/connections', function(req, res) {
	res.sendFile(__dirname + '/OAuth/index.html');
})

restService.get('/auth', function(req, res) {
        code = req.query.code,
		grant_type = "authorization_code"
		client_id = "3MVG9HxRZv05HarTorx5Mf0IjDgnpJGwNuO0DCiL0y070i3yFQiLuVegdzZ9oupv5F2AWU1rRT5fv9EpGGfb1"
		client_secret = "236296553525088968"
		callback_uri = "https%3A%2F%2Fsafe-ocean-30268.herokuapp.com%2Fauth"
	
	var options = {
        url: "https://login.salesforce.com/services/oauth2/token?code="+code+"&grant_type="+grant_type+"&client_id="+client_id+"&client_secret="+client_secret+"&redirect_uri="+callback_uri,
        method: "GET"
    }

    // Start the request
    httpRequest(options, function(error, response, body) {
		return parser.parseString(body, function(err, HTTPresult) {
                console.log(HTTPresult['acces_token']
            })
		res.sendFile(__dirname + '/OAuth/loginSucces.html');
	})
})

restService.post('/hook', function(req, res) {
    console.log('hook request');
    request = req;
    result = res;
	sessionId = req.body.sessionId;
    var intent = req.body.result.metadata.intentName;
    if (intent != "Login") {
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
            db.updateQuery(column, variables, function() {
                return returnJson(context.parameters['sf-name'] + "\'s " + column + " changed to " + context.parameters['variable']);
            })
            break;
        case "User-info":
            var nameObj = request.body.result.parameters['fullName']
			var fullName = nameObj[Object.keys(nameObj)[0]]
            var column = request.body.result.parameters['Variable_row']
			return userController.getServiceByName(fullName, function(serviceType){
					if(serviceType == service.services.IBM){
						return returnJson("Getting info from IBM is still a work in progress. "+fullName+" has been found. However, no further functionality is implemented yet")
					}
					if(serviceType == service.services.SalesForce){
						return userController.getUserInfo(fullName, column, function(speech, followUp) {
							return returnJson(speech, followUp)
						});						
					}
				})
            break;
        case "getNodeFromIBM":
        case "getFromIBM":
            verseController.getFromIBM(request.body.result.parameters['type'], function(speech) {
                return returnJson(speech);
            });
            break;
        case "ibmPost":
        case "ibmPostNode":
            verseController.postToIBM(function(speech, followUp) {
                return returnJson(speech, followUp);
            }, request.body.result.parameters['content'], request.body.result.parameters['type'], request.body.result.parameters['activity']);
            break;
        case "markTodo":
            verseController.updateIBM(request.body.result.parameters['todoName'], function(speech) {
                return returnJson(speech);
            });
            break;
		case "joke":
			apiController.get('https://icanhazdadjoke.com/', function(joke){
				return returnJson(joke)
			})
			break;		
        default:
		return userController.getAllNames(function(names){
			 return wakeUp();
		})
            return wakeUp();
            break;
    }
})

restService.listen((process.env.PORT || 5000), function() {
    console.log("Server listening");
});

function login() {
    login = false;
    var user = request.body.result.parameters['Username']
    var pass = request.body.result.parameters['Password']
    return loginController.login(user, pass, function(succes) {
        if (succes) {
            sessionId = request.body.sessionId;
            auth = true;
            speech = "Login succesful, welcome back!"
        } else {
            speech = "Login failed, please check username and password"
        }
        return returnJson(speech)
    })
}

function wakeUp() {
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

function log(reqIn, resIn, score, intent, callback){
	var resOut = resIn.split(':')[0];	
			db.log(reqIn, resOut, score, intent, function(connectionEnd){
				console.log("**********************************CONNECTION END******************************************")
				console.log(connectionEnd)
				callback();
			})
	
}

function returnJson(speech, followUp) {
	var postPath = "https://api.api.ai/v1/userEntities?v=20150910&sessionId=" + sessionId
	var accesToken = "5462b4a0987946ee967dbea809dd6676";
	
	return apiController.post(postPath, accesToken, null, function(){
		var reqIn = request.body.result.resolvedQuery
		var intent = request.body.result.metadata.intentName
		var score =  request.body.result.score
		log(reqIn,speech,score, intent ,function(){
			return result.json({
				speech: speech,
				displayText: speech,
				source: 'apiai-webhook-sample',
				followupEvent: {
					name: followUp
				}
			});			
		})
	})
}