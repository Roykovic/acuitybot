'use strict';

var config = require('./config/config')
var messages = require('./messages')
var messageMapEN;
var messageMapNL;
var exports = module.exports = {};

exports.getLoginMessage = function(services, userID, sessionId, language){
	if(!language) language = "EN"
	var speech = messages[language].MESSAGE_LOGIN;
	for(var i = 0; i<services.length; ++i){
		speech += "\n"
		speech += services[i]
		speech += "\n"							
		speech += config.url + "/login/"+services[i]+"/" + userID + "/" + sessionId
	}
	return speech;
}

exports.getMessage = function(messageType, variables, language){
	if(!language) language = "EN"
	var speech = messages[language][messageType]
	return exports.insertIntoString(speech, variables)
}

exports.getErrorMessage = function(error, statusCode, language){
		if(!language) language = "EN"
		var speech = error + "\nSomething went wrong"
        if (statusCode) speech += "(" + statusCode + ")"
		return speech
}

exports.insertIntoString = function(string, inputArray){
	var counter = 0;
	while(string.indexOf('?') > -1 && counter<string.length){
		console.log( "JA DINGEN")
		//string = string.replace('?', inputArray[counter]);
		counter++;
	}
	return string;
}