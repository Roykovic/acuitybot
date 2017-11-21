'use strict'

var mysql = require('mysql');
var config = require('./config/config')
var exports = module.exports = {};
var pool  = mysql.createPool(config.connection);

exports.query = function (query, params, callBack){
   pool.getConnection(function(err,connection){
        if (err) {
          callBack(err, false);
          return;
        }
        connection.query(query, params,function(err,results){
            if(!err) {
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

//exports.updateQuery = function(column, variables, callBack){
//	if(column && variables){
//			pg.defaults.ssl = true;
//			pool.connect(function(err, client) {
//			  if (err) throw err;
//			  console.log('Connected to postgres! Getting schemas for update...');
//			  client
//				.query('UPDATE salesforce.contact SET '+column+'=$1 WHERE name =$2', variables)
//				.then(client.release())
//				.then(res => callBack(res))
//				.catch(e => console.error("Error while executing query\n" +e.stack));
//				return;
//			})
//		}
//}
//
//exports.getUser = function(username, callBack){
//		if(username){
//			pg.defaults.ssl = true;
//			pool.connect(function(err, client) {
//			  if (err) throw err;
//			  console.log('Connected to postgres! Getting schemas...');
//			  client
//				.query('SELECT * FROM salesforce.contact WHERE name LIKE $1', [username])
//				.then(client.release())				
//				.then(res => callBack(res))
//				.catch(e => console.error("Error while executing query\n" +e.stack));
//
//
//			})
//			return;
//		}
//}

exports.checkColumn = function (column, callBack){
	exports.query("*", "false", function(columns){
		if(columns){
			for (var i = 0, len = columns.fields.length; i < len; i++) {
				var columnFromDB = columns.fields[i].name;
				var lowerCaseColumn = columnFromDB.toLowerCase();
				if(lowerCaseColumn == column.toLowerCase()){
					callBack(column);
					return
				}
			}
		}
	})
	return callBack(null);

}

exports.log = function(reqIn, resIn, score, intent,callBack){
   pool.getConnection(function(err,connection){
        if (err) {
		console.log(err)
          callBack();
          return;
        }
        connection.query('INSERT INTO logs (request, result, score, intent) VALUES (?,?,?,?)', [reqIn, resIn, score, intent],function(err,results){
            connection.release();
            if(!err) {
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

 
