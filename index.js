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
var db = require('./db');
var service = require('./service')
var apiController = require('./apiController')
var userController = require('./userController')
var ibmController = require('./ibmController')
var salesforceController = require('./salesforceController')
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var OAuthController = require('./oauth')
const express = require('express');
const bodyParser = require('body-parser');
const restService = express();
var cookieParser = require('cookie-parser')
var userID;
var sessionId;
restService.use(cookieParser())

restService.use(express.static('public'))

restService.use(bodyParser.urlencoded({
    extended: true
}));
restService.use(bodyParser.json());

restService.get('/login/:service/:userID/:sessionId', function(req, res) {
    userID = req.params.userID
    sessionId = req.params.sessionId
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
    console.log(sessionId)
    userID = req.body.originalRequest.data.data.personId
    request = req;
    result = res;
    sessionId = req.body.sessionId;
    userController.addUserEntities(sessionId, userID, function(succes) {
        if (!succes) return returnJson("You must login for this action, please use this link: " + 'https://safe-ocean-30268.herokuapp.com' + "/login/salesforce/" + userID + '/' + sessionId);
        var intent = req.body.result.metadata.intentName;
        switch (intent) {
            case "update":
            case "data for update":
                var context = req.body.result.contexts[1]
                var column = context.parameters.Variable_row;
                var variable = context.parameters['variable.original']
                var fullname = context.parameters['fullName']['sf-name']
                salesforceController.updateUserInfo(userID, fullname, column, variable, function() {
                    return returnJson(fullname + "\'s " + column + " changed to " + variable);
                })
                break;
            case "User-info":
                var nameObj = request.body.result.parameters['fullName']
                var fullName = nameObj[Object.keys(nameObj)[0]]
                var column = request.body.result.parameters['Variable_row']
                if (!fullName) {
                    return userController.getUserEntities(sessionId, function(userEntities) {
                        if (userEntities) {
                            return returnJson("This user could not be found in any of your connected apps")
                        } else {
                            return returnJson("You must login for this action, please use this link: " + 'https://safe-ocean-30268.herokuapp.com' + "/login/salesforce/" + userID + "/" + sessionId)
                        }
                    })
                }
                return userController.getServiceByName(fullName, userID, function(serviceType) {
                    if (serviceType == service.services.IBM) {
                        return returnJson("Getting info from IBM is still a work in progress. " + fullName + " has been found. However, no further functionality is implemented yet")
                    }
                    if (serviceType == service.services.SalesForce) {
                        return salesforceController.getUserInfo(userID, fullName, column, function(speech, followUp) {
                            return returnJson(speech, followUp)
                        });
                    }
                    if (serviceType == service.services.None) {
                        return returnJson("This user could not be found in any of your connected apps")
                    }
                })
                break;
            case "getNodeFromIBM":
            case "getFromIBM":
                ibmController.getFromIBM(request.body.result.parameters['type'], function(speech) {
                    return returnJson(speech);
                });
                break;
            case "ibmPost":
            case "ibmPostNode":
                ibmController.postToIBM(function(speech, followUp) {
                    return returnJson(speech, followUp);
                }, request.body.result.parameters['content'], request.body.result.parameters['type'], request.body.result.parameters['activity']);
                break;
            case "markTodo":
                ibmController.updateIBM(request.body.result.parameters['todoName'], function(speech) {
                    return returnJson(speech);
                });
                break;
            case "joke":
                apiController.get('https://icanhazdadjoke.com/', function(joke) {
                    return returnJson(joke)
                })
                break;
            default:
                return wakeUp();
                break;
        }
    })
})

restService.listen((process.env.PORT || 5000), function() {
    console.log("Server listening");
});

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

function log(reqIn, resIn, score, intent, callBack) {
    var resOut = resIn.split(':')[0];
    db.log(reqIn, resOut, score, intent, function(connectionEnd) {
        callBack();
    })
}

function returnJson(speech, followUp) {
    console.log("caller is " + arguments.callee.caller.toString())
	console.log("****************************SPEECH********************************")
	console.log(speech)
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