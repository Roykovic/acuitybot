'use strict'

var self = this;
var exports = module.exports = {};
var db = require('./db');

exports.loginSucces = function (username, password){
	db.getUser(username, function(result){
		if(result){
			console.log("HOIHOIHOIHOIHOIHOIHOIHOIHOIHOI")
			if(result.rows[0].pass_c == password){
				console.log(true);
			}
		}
	})
	
	
/* 			if(username == "Roy" && password == "1234" ){
				return true
			} */
	return false
}
