'use strict'

var self = this;
var exports = module.exports = {};
var db = require('./db');
var passwordHash = require('password-hash');

exports.login = function (username, password, callBack){
	db.getUser(username, function(result){
		var dbPass = "";
		if(result){
			dbPass = result.rows[0].pass__c; 
		}
		var succes = passwordHash.verify(password, dbPass)
		callBack(succes);
	})
}
