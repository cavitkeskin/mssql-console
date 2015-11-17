var mssql = require('mssql');


console.log(process.argv)

var args = process.argv;

var database = [],
	host = '',
	username = '',
	password = '',
	sqlfile = [],
	statement = [];

for(var i = 0; i < args.length; i++){
	switch(args[i]){
		case '-d':
			database.push(args[++i]);
			break;
			
	}
}