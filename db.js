'use strict'

var mysql = require('mysql');
var config = require('./config/config')
var exports = module.exports = {};
var pool = mysql.createPool(config.connection);

exports.query = function(query, params, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
            return callback(err, false);          
        }
        connection.query(query, params, function(err, results) {
            if (!err) {
                connection.release();
                return callback(results, true);    
            }
        });
        connection.on('error', function(err) {
            console.log("Error thrown: " + err)
            return callback(err, false);
        });
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

exports.log = function(reqIn, resIn, score, intent, callback) {
    pool.getConnection(function(err, connection) {
			console.log("********************************HIT**********************************************")
        if (err) {
            console.log("Return 1")
            return callback();
        }
        connection.query('INSERT INTO logs (request, result, score, intent) VALUES (?,?,?,?)', [reqIn, resIn, score, intent], function(err, results) {
            connection.release();
            if (!err) {
            console.log("Return 2")
            return callback();
            }
        });
        connection.on('error', function(err) {
            console.log("Return 3")
			console.log(err)
            return callback();
        });
    });

}