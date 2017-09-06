'use strict'

var self = this;
var exports = module.exports = {};
var db = require('./db');

exports.login = function (username, password){
	db.getUser(username, function(result){
		if(result){
			if(result.rows[0].pass__c == password){
				callback(true)
			}
		}
	})
				callback(false)
}
