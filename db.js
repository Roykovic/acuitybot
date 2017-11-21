'use strict'

var mysql = require('mysql');
var config = require('./config/config')
var exports = module.exports = {};
var pool = mysql.createPool(config.connection);

exports.query = function(query, params, callBack) {
    pool.getConnection(function(err, connection) {
        if (err) {
            callBack(err, false);
            return;
        }
        connection.query(query, params, function(err, results) {
            if (!err) {
                connection.release();
                callBack(results, true);
                return
            }
        });
        connection.on('error', function(err) {
            console.log(err)
            callBack(err, false);
            return;
        });
    });
}

exports.checkColumn = function(column, callBack) {
    exports.query("*", "false", function(columns) {
        if (columns) {
            for (var i = 0, len = columns.fields.length; i < len; i++) {
                var columnFromDB = columns.fields[i].name;
                var lowerCaseColumn = columnFromDB.toLowerCase();
                if (lowerCaseColumn == column.toLowerCase()) {
                    callBack(column);
                    return
                }
            }
        }
    })
    return callBack(null);

}

exports.log = function(reqIn, resIn, score, intent, callBack) {
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log(err)
            callBack();
            return;
        }
        connection.query('INSERT INTO logs (request, result, score, intent) VALUES (?,?,?,?)', [reqIn, resIn, score, intent], function(err, results) {
            connection.release();
            if (!err) {
                callBack();
            }
        });
        connection.on('error', function(err) {
            connection.release();
            callBack();
            return;
        });
    });

}