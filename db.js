'use strict'

var self = this;
var connectionString = require('./config/config.js');
var pg = require('pg');
var exports = module.exports = {};

exports.query = function (column, variable, callBack){
		if(column && variable){
			pg.defaults.ssl = true;
			var pool = new pg.Pool({
			  connectionString: connectionString,
			})
			pool.connect(function(err, client) {
			  if (err) throw err;
			  console.log('Connected to postgres! Getting schemas...');
			  client
				.query('SELECT '+ column +' FROM salesforce.contact WHERE name=$1', [variable])
				.then(res => callBack(res))
				.catch(e => console.error("Error while executing query\n" +e.stack));
				return;
			})
		}
		callBack(null)
}

exports.getUser = function(username, callBack){
		if(username){
			pg.defaults.ssl = true;
			var pool = new pg.Pool({
			  connectionString: connectionString,
			})
			pool.connect(function(err, client) {
			  if (err) throw err;
			  console.log('Connected to postgres! Getting schemas...');
			  client
				.query('SELECT * FROM salesforce.auth__c WHERE name=$1', [username])
				.then(res => callBack(res))
				.catch(e => console.error("Error while executing query\n" +e.stack));


			})
			return;
		}
}

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
	callBack(null);
	return;
}
