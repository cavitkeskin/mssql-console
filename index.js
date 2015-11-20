var mssql = require('mssql'),
	async = require('async'),
	fs = require('fs');


//console.log(process.argv)

var args = process.argv;

var database = [],
	host = '',
	username = '',
	password = '',
	sqlfile = [],
	statement = [];

for(var i = 2; i < args.length; i++){
	switch(args[i]){
		case '-h':
			host = args[++i];
			break;
		case '-d':
			database.push(args[++i]);
			break;
		case '-u':
			username = args[++i];
			break;
		case '-p':
			password = args[++i];
			break;
		case '-c':
			statement.push(args[++i]);
			break;
		default:
			sqlfile.push(args[i]);
	}
}


/*
	- eger database set edilmemis ise tum databaselerde calismali
	- file execute yazilacak
		- file birden fazla sql icerebilir, GO ile ayrilmasi lazim
	- eger database verilmedi ise versiyon controlu yapilmali.
	
*/

//console.log({
//	host: host,
//	database: database,
//	username: username,
//	password: password,
//	sqlfile: sqlfile,
//	statement: statement
//})



function selectdb(dbname){
	return function(callback){
		console.log('\nDATABASE: '+dbname);
		db = new mssql.Request(conn);
		db.batch('USE '+dbname, callback);
	}
}

function query(sql){
	return function(callback){
		console.log('query '+sql);
		db.query(sql, function(err, result){
			if(!err) console.log(result);
			callback(err, null);
		});
	}
}

function execute(file){
	return function(callback){
		console.log('\tFILE: '+file);
		fs.readFile(file, 'utf8', function (err, sql) {
			if(err) callback(err, null); 
			else
			db.query(sql, function(err, result){
				if(!err) console.log(result);	
				callback(err, result);
			});
		});
	}
}

var conn, db;

var JOBS = [
	// connect to server
	function(callback){
		conn = new mssql.Connection({user: username, password: password, server: host}, callback);
		
	}
];


database.forEach(function(dbname){
	JOBS.push(selectdb(dbname));

	sqlfile.forEach(function(file){
		JOBS.push(execute(file));
	})
	
	statement.forEach(function(sql){
		JOBS.push(query(sql));
	})
	
})


async.series(JOBS, function(err, result){
	conn.close();
	if(err) throw err;
})

