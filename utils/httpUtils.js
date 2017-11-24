'use strict'

var exports = module.exports = {};

exports.parseFormData = function(formData){
	var splitString = formData.split("&")
	var returnBody = {};
	
	for(var i = 0; i<splitString.length; ++i){
		var element = splitString[i].split("=")
		returnBody[element[0]] = element[1]
	}
	console.log(returnBody)
	return returnBody;
}