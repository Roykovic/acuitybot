'use strict';

var config = require('./config/config')
var messages = require('./messages')
var messageMapEN;
var messageMapNL;
var exports = module.exports = {};

exports.getLoginMessage = function(services, userID, sessionId, language){
	var speech = messages[language].MESSAGE_LOGIN;
	for(var i = 0; i<services.length; ++i){
		speech += "\n"
		speech += services[i]
		speech += "\n"							
		speech += config.url + "/login/"+services[i]+"/" + userID + "/" + sessionId
	}
	return speech;
}

exports.getMessage = function(messageType){
	
}