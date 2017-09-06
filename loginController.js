'use strict'

var self = this;
var exports = module.exports = {};

exports.loginSucces = function (username, password){
	console.log("username and password: ")
	console.log(username +" "+ password)
			if(username == "Roy" && password == "1234" ){
				console.log(true)
				return true
			}
	console.log(false)
	return false
}
