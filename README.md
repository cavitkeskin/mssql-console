



to exec any query

	mssql -h host -d database -u username -p password -c sql_statement

to exec query from file

	mssql -h host -d database -u username -p password filename.sql [file ...]

to run a query on multible database

	mssql -h host -d database [-d database -d database ...] -u username -p password filename.sql [file ...]

to run on all databases

	mssql -h host -u username -p password filename.sql [file ...]

mssql-console Desktop$ bin/mssql -d VACS ~/projects/SIS/SQL/REPORTS/IDCARD_VACS.sql