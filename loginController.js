'use strict'

var self = this;
var exports = module.exports = {};
var db = require('./db');

exports.loginSucces = function (username, password){
	db.getUser(username, function(result){
		if(result){
			console.log("result is set")
			if(result.rows[0].pass__c == password){
				console.log("true")
				return true
			}
		}
	})
				return false
}