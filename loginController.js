'use strict'

var self = this;
var exports = module.exports = {};
var db = require('./db');

exports.loginSucces = function (username, password){
	console.log("Account table:")
db.query("* FROM salesforce.account --", "idc", function(result){
	console.log(result.rows[0])
})
			if(username == "Roy" && password == "1234" ){
				return true
			}
	return false
}
