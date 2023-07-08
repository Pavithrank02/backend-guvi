var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "user"
});
// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   con.query("CREATE DATABASE mydb", function (err, result) {
//     if (err) throw err;
//     console.log("Database created");
//   });
// });
// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   var sql = "CREATE TABLE user (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(20), email VARCHAR(100), password VARCHAR(100), confirmpassword VARCHAR(100), token_S VARCHAR(20))";
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     console.log("Table created");
//   });
// });

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "ALTER TABLE user ADD phone varchar(255)";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table altered");
  });
});


// ALTER TABLE table_name MODIFY column_name varchar(new_length)