'use strict'

var self = this;
var connectionString = require('./config/config.js');
var pg = require('pg');


module.exports = {
	  query: function query(column, variable, callBack){
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
			})
		}
		callBack(null)
	}, 
	checkColumn: function checkColumn(column, callBack){
	query("*", "false", function(columns){
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

}