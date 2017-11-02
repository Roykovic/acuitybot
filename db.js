'use strict'

var self = this;
var connectionString = require('./config/config.js');
var pg = require('pg');
var mysql = require('mysql');
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

exports.updateQuery = function(column, variables, callBack){
	if(column && variables){
			pg.defaults.ssl = true;
			var pool = new pg.Pool({
			  connectionString: connectionString,
			})
			pool.connect(function(err, client) {
			  if (err) throw err;
			  console.log('Connected to postgres! Getting schemas for update...');
			  client
				.query('UPDATE salesforce.contact SET '+column+'=$1 WHERE name =$2', variables)
				.then(callBack())
				.catch(e => console.error("Error while executing query\n" +e.stack));
				return;
			})
		}
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
				.query('SELECT * FROM salesforce.contact WHERE name LIKE $1', [username])
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
	return callBack(null);

}

exports.log = function(reqIn, resIn, score, intent,callback){
	console.log(score)
	//var sql = 'INSERT INTO logs (request, result, score, intent) VALUES ("'+reqIn+'", "' + resIn+'", ' + score+', "' + intent+'");'
	//console.log(sql)
	var con = mysql.createConnection({
  database: "ibmx_a6f1d89267096f1",
	  host: "us-cdbr-sl-dfw-01.cleardb.net",
	  user: "b332003fffc8cc",
	  password: "d446664b"
	});	
	con.connect(function(err) {
	  if (err) throw err;
	  console.log("Connected!");
	  con.query('INSERT INTO logs (request, result, score, intent) VALUES (?,?,?,?)', [reqIn, resIn, score, intent],  function (err, result) {
		if (err) throw err;
	  });
	});	
con.end()
	callback()
}
