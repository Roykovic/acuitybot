'use strict'

var self = this;
var exports = module.exports = {};
var db = require('./db');

exports.loginSucces = function (username, password){
	db.getUser(username, function(result){
		if(result){
			console.log(result.rows[0].pass__c)
			console.log(password)
			if(result.rows[0].pass__c == password){
				console.log(true);
			}
		}
	})
	
	
/* 			if(username == "Roy" && password == "1234" ){
				return true
			} */
	return false
}
