var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit 	: 10,
  host            	: 'classmysql.engr.oregonstate.edu',
  user 				: 'cs361_huynhant',
  password			: '361Group18Database',
  database			: 'cs361_huynhant' 
});

module.exports.pool = pool;
