'use strict'

var self = this;
var exports = module.exports = {};
var db = require('./db');

exports.login = function (username, password, callback){
	console.log("LoginController call")
/* 	if(username == "Roy" && password == "1234"){
		return true;
	} */
	
	db.getUser(username, function(result){
		console.log("LoginController")
		if(result){
			if(result.rows[0].pass__c == password){
				callback(true)
				return;
			}
		}
	})
	callback(false)
	return;
}
