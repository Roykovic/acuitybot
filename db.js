'use strict'

var mysql = require('mysql');
var config = require('./config/config')
var exports = module.exports = {};
var pool = mysql.createPool(config.connection);

exports.query = function(query, params, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
            callback(err, false);
            return;
        }
        connection.query(query, params, function(err, results) {
            if (!err) {
                connection.release();
                callback(results, true);
                return
            }
        });
        connection.on('error', function(err) {
            console.log("Error thrown: " + err)
            //callback(err, false);
            return;
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
        if (err) {
            console.log(err)
            callback();
            return;
        }
        connection.query('INSERT INTO logs (request, result, score, intent) VALUES (?,?,?,?)', [reqIn, resIn, score, intent], function(err, results) {
            connection.release();
            if (!err) {
                callback();
            }
        });
        connection.on('error', function(err) {
            connection.release();
            callback();
            return;
        });
    });

}