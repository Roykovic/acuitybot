'use strict'

var self = this;
var oauth = require('./oauth')
var httpRequest = require('request');
var exports = module.exports = {};

exports.query = function (column, variable, callBack){
		// if(column && variable){
			// exports.getContacts(function(){
				// var options = {
					// url: url,
					// method: "GET"
				// }
				// httpRequest(options, function(error, response, body) {
					// body = JSON.parse(body)
					// var acess_token = body.access_token
				// })				
						
						
						
						
						
						
						
						// pool.connect(function(err, client) {
						// if (err) throw err;
						// console.log('Connected to postgres! Getting schemas...');
						// client
							// .query('SELECT '+ column +' FROM salesforce.contact WHERE name=$1', [variable])
							// .then(res => callBack(res))
							// .catch(e => console.error("Error while executing query\n" +e.stack));
							// return;
						// })
					// }
					// callBack(null)				
			// });
}

exports.getContacts = function(access_token, callback){
		var headers = {
			"Authorization": "Bearer " +  access_token
		}

		var options = {
			url: 'https://eu11.salesforce.com/services/data/v20.0/query?q=SELECT+Name,MailingStreet,Phone,email,birthdate,department,HomePhone,Fax,MobilePhone,Title,Mailingcity+from+contact',
			method: "GET",
			headers: headers
		}
		
		console.log(options)
		httpRequest(options, function(error, response, body) {
			body = JSON.parse(body)
			callback(body.records)
		})		
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

exports.getUserInfo = function(userID, fullname, column, callBack){
	oauth.getAccesToken(userID, function(){
		exports.getContacts(, function(contacts){
			console.log(contacts)
		//	for (var i = 0, len = contacts.length; i < len; i++) {
		//		if(contacts[i].)
		//	}
		})
	})
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
	var pool  = mysql.createPool({
	  database: "ibmx_a6f1d89267096f1",
	  host: "us-cdbr-sl-dfw-01.cleardb.net",
	  user: "b332003fffc8cc",
	  password: "d446664b"
	});

   pool.getConnection(function(err,connection){
        if (err) {
          callback();
          return;
        }
        connection.query('INSERT INTO logs (request, result, score, intent) VALUES (?,?,?,?)', [reqIn, resIn, score, intent],function(err,results){
            connection.release();
            if(!err) {
                callback();
            }
            // check null for results here
        });
        connection.on('error', function(err) {
              callback();
              return;
        });
    });
}

 
