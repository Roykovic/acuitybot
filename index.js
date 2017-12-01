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

var db = require('./db');
var service = require('./service')
var apiController = require('./apiController')
var userController = require('./userController')
var ibmController = require('./ibmController')
var salesforceController = require('./salesforceController')
var messageController = require('./messageController')
var messages = require('./messages')
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var OAuthController = require('./oauth')
const express = require('express');
const bodyParser = require('body-parser');
const restService = express();
var cookieParser = require('cookie-parser')
restService.use(cookieParser())

restService.use(express.static('public'))

restService.use(bodyParser.urlencoded({
    extended: true
}));
restService.use(bodyParser.json());

restService.get('/login/:service/:userID/:sessionId', function(req, res) {
    var userID = req.params.userID
    var sessionId = req.params.sessionId
    var fileName = OAuthController.getWebpage(req.params.service)
    res.cookie('id_token', userID);
    res.cookie('session_token', sessionId);
    res.sendFile(__dirname + '/OAuth/' + fileName + '.html');
})

restService.get('/auth/:service', function(req, res) {
    var userID = req.cookies.id_token;
    var sessionId = req.cookies.session_token;
    OAuthController.getTokens(req.params.service, req.query.code, userID, function() {
        userController.addUserEntities(sessionId, userID, function(succes) {
            res.sendFile(__dirname + '/OAuth/loginSucces.html');
        })
    })
})

restService.post('/hook', function(req, res) {
    var userID = req.body.originalRequest.data.data.personId
    var sessionId = req.body.sessionId;
	console.log(sessionId)
    var intent = req.body.result.metadata.intentName;
    switch (intent) {
        case "update":
        case "data for update":
			var parameters = req.body.result.parameters
			if(!parameters) parameters = req.body.result.contexts[1].parameters
			console.log(req.body.result)
            var column = parameters.Variable_row;
            var variable = parameters['variable'].replace("?","")
            var fullname = parameters['sf-name']
            return salesforceController.updateUserInfo(userID, fullname, column, variable, function(error) {
				if(error){
					return returnJson(res, req, error);
				}
				else{
					return returnJson(res, req, fullname + "\'s " + column + " changed to " + variable);
				}
            })
            break;
        case "User-info":
		case "user-info.context":		
		 userController.addUserEntities(sessionId, userID, function(succes) {
			var index = 0;
			var nameObj = req.body.result.parameters['fullName']
			 if(!nameObj){
				 index = 1;
				 nameObj = req.body.result.contexts[0].parameters['fullName']
			 }
            var fullName = nameObj[Object.keys(nameObj)[index]]
            var column = req.body.result.parameters['Variable_row']
            if (!fullName) {
                return OAuthController.checkExpiration(userID, function(expired) {
                    if (expired && expired.length > 0) {
						var speech = messageController.getLoginMessage(expired, userID, sessionId)
					} else {
						var speech = messageController.getMessage("MESSAGE_USER_NOT_FOUND")
                    }
					return returnJson(res, req, speech)
                })
            }
            return userController.getServiceByName(fullName, userID, function(serviceType) {
                if (serviceType == service.services.IBM) {
					return ibmController.getUserInfo(userID, fullName, column, function(speech, followUp) {
                        return returnJson(res, req, speech, followUp)
                    });
                }
                if (serviceType == service.services.SalesForce) {
                    return salesforceController.getUserInfo(userID, fullName, column, function(speech, followUp) {
                        return returnJson(res, req, speech, followUp)
                    });
                }
                if (serviceType == service.services.None) {
					var speech = messageController.getMessage("MESSAGE_USER_NOT_FOUND")
                }
            })
			})
            break;
        case "getNodeFromIBM":
        case "getFromIBM":
            ibmController.getFromIBM(userID, req.body.result.parameters['type'], function(speech) {
                return returnJson(res, req, speech);
            });
            break;
        case "ibmPost":
        case "ibmPostNode":
            ibmController.postToIBM(req.body.result.parameters['content'], req.body.result.parameters['type'], req.body.result.parameters['activity'], userID, function(speech) {
                return returnJson(res, req, speech);
            });
            break;
        case "markTodo":
            ibmController.updateIBM(req.body.result.parameters['todoName'], userID, function(speech) {
                return returnJson(res, req, speech);
            });
            break;
        case "joke":
            apiController.get('https://icanhazdadjoke.com/', function(res, joke) {
                return returnJson(res, req, joke)
            })
            break;
		case "test":
			OAuthController.checkExpiration();
        default:
		console.log("DEFAULT")
            return wakeUp();
            break;
    }
})

restService.listen((process.env.PORT || 5000), function() {
    console.log("Server listening");
});

function wakeUp(res, req) {
    if (req.body) {
        if (req.body.result) {
            var speech = '';

            if (req.body.result.fulfillment) {
                speech += req.body.result.fulfillment.speech;
                speech += ' ';
            }
        }
    }
    return returnJson(res, req, speech);
}

function log(reqIn, resIn, score, intent, callback) {
    var resOut = resIn.split(':')[0];
    return db.log(reqIn, resOut, score, intent, function(connectionEnd) {
        callback();
    })
}

function returnJson(result, request, speech, followUp) {
		var reqIn = request.body.result.resolvedQuery
		var intent = request.body.result.metadata.intentName
		var score = request.body.result.score
		return log(reqIn, speech, score, intent, function() {
			return result.json({
				speech: speech,
				displayText: speech,
				source: 'apiai-webhook-sample',
				followupEvent: {
					name: followUp
				}
			});
		})
}