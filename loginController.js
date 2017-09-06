'use strict'

var self = this;
var exports = module.exports = {};
var db = require('./db');

exports.loginSucces = function (username, password){
	db.getUser(username, password, function(result){
		console.log("accounts")
		console.log(result)
	})
	
	
/* 			if(username == "Roy" && password == "1234" ){
				return true
			} */
	return false
}
