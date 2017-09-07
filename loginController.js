'use strict'

var self = this;
var exports = module.exports = {};
var db = require('./db');

exports.login = function (username, password, callback){
	db.getUser(username, function(result){
		if(result){
			console.log("result")
			console.log(result.rows[0].pass__c)
			console.log(password)
			console.log(result.rows[0].pass__c == password)
			if(result.rows[0].pass__c == password){
				callback(true)
				return;
			}
		}
			callback(false)
			return;
	})
}
