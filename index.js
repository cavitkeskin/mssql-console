var mssql = require('mssql'),
	async = require('async'),
	fs = require('fs'),
    _ = require('underscore'),
    util = require('util');    


//console.log(process.argv)

var args = process.argv;

var database = [],
	host = '',
	username = '',
	password = '',
	sqlfile = [],
	statement = [],
    
    
    maxwidth = (process.stdout.columns-105);




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
		case '--max-width':
			maxwidth = args[++i];
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






// ***************************************************************



function printTable(data){
    
    var keys = _.object(_.keys(data[0]), []);
    
    _.each(data, function(item){
        _.each(item, function(v, k){
            var l = String(v).trim().length; if(l>maxwidth) l = maxwidth;
            if(typeof keys[k] === 'undefined') keys[k] = k.length+1;
            keys[k] = l > keys[k] ? l : keys[k];
        })
    });
    
    
    //console.log(keys);
    
    process.stdout.write("\n");
    process.stdout.write("\n");
    
    
    
    
    // header line
     _.each(keys, function(l){
        var s = '';
        while(s.length <= l) s += '═';
            process.stdout.write('══'+s);
    }); 
    process.stdout.write("═");
    
    process.stdout.write("\n");
    process.stdout.write("Max-width= "+maxwidth);
    process.stdout.write("\n");
    process.stdout.write("\n");
    process.stdout.write("\n");
    
      
    
    
    //line at top of box
    _.each(keys, function(l){
        var s = '';
        while(s.length <= l) s += '═';
            process.stdout.write('╤═'+s);
    }); 
    process.stdout.write("╗");
        process.stdout.write("\n");

    
    
    
    // category titles
    _.each(keys, function(l, k){
        var label = k;
        while(label.length <= l) label += ' ';
        process.stdout.write('│ '+'\x1b[1m'+label+'\x1b[0m');
        
    })
    
    process.stdout.write("║");
    process.stdout.write("\n");
    
    
    
    
    //line at bottom of category titles
    _.each(keys, function(l){
        var s = '';
        while(s.length <= l) s += '═';
            process.stdout.write('╪═'+s);
    }); 
    
    process.stdout.write("╣");
    process.stdout.write("\n");
    
    
    
    
    // content
    _.each(data, function(item){
        _.each(item, function(v, k){
            var s = String(v).trim().replace(/\n/g, ' ');
            if(maxwidth && s.length > maxwidth){
                s = s.substring(0, maxwidth-2)+"\x1b[1m"+'⋙  '+'\x1b[0m';
            }
            while(s.length <= keys[k]) s += ' ';
            process.stdout.write('│ '+s);    
        })
        process.stdout.write('║'+"\n");
    });
    
    
    
    
    // line at bottom of box
    _.each(keys, function(l){
        var s = '';
        while(s.length <= l) s += '═';
            process.stdout.write('╧═'+s);
    }); 
    
   
    process.stdout.write("╝");
    process.stdout.write("\n");
    
    
}





    //   TO VIEW DATA IN FULL LENGTH USE --MAX-WIDTH   







function selectdb(dbname){
	return function(callback){
            process.stdout.write("\n");
            process.stdout.write("\n");
		console.log('\nDATABASE: '+dbname);
		db = new mssql.Request(conn);
		db.batch('USE '+dbname, callback);
	}
}

function query(sql){
	return function(callback){
		console.log('Query: '+sql);
		db.query(sql, function(err, result){
			if(!err) printTable(result);
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


function setJobs(){
    database.forEach(function(dbname){
        JOBS.push(selectdb(dbname));

        sqlfile.forEach(function(file){
            JOBS.push(execute(file));
        })

        statement.forEach(function(sql){
            JOBS.push(query(sql));
        })

    })
}


setJobs();

async.series(JOBS, function(err, result){
    conn.close();
    if(err) throw err;
})
