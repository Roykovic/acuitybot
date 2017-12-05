'use strict'

var mysql = require('mysql');
var config = require('./config/config')
var exports = module.exports = {};
var pool = mysql.createPool(config.connection);

exports.query = function(query, params, callback) {
	pool.query(query, params, function(err, results) {
		if(err){
			console.log("An error occured:")
			console.log(err)
		}
		return callback(results, true);    
        });
}

exports.checkColumn = function(column, callback) {
    exports.query("*", "false", function(columns) {
        if (columns) {
            for (var i = 0, len = columns.fields.length; i < len; i++) {
                var columnFromDB = columns.fields[i].name;
                var lowerCaseColumn = columnFromDB.toLowerCase();
                if (lowerCaseColumn == column.toLowerCase()) {
                    callback(column);
                    return
                }
            }
        }
    })
    return callback(null);

}

exports.log = function(reqIn, resIn, score, intent) {
	exports.query('INSERT INTO logs (request, result, score, intent) VALUES (?,?,?,?)', [reqIn, resIn, score, intent], function(){});
}