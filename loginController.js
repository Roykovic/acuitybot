'use strict'

var self = this;
var exports = module.exports = {};
var db = require('./db');

exports.login = function (username, password, callback){
/* 	if(username == "Roy" && password == "1234"){
		return true;
	} */
	
	db.getUser(username, function(result){
		if(result){
			if(result.rows[0].pass__c == password){
				console.log("HANS")
				return;
			}
		}
	})
	console.log("RESULT")
	console.log(result)
	callback(false)
	return;
}
