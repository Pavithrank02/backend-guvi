
var express = require("express");
const path = require('path');
var app = express();
var bodyParser = require("body-parser");
var mysql = require("mysql");
app.use(express.json());
app.use(express.urlencoded());
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const http = require("http");
const fs = require("fs");
const url = require("url");
app.use('.', express.static('uploads'));
const multer = require('multer');
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// default route
app.get("/", function (req, res) {
  return res.send({ error: true, message: "hello" });
});

// connection configurations
var dbConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "user",
});
// connect to database
dbConn.connect();

//Register User
app.post("/register", (req, res, next) => {
  // console.log(req)
  dbConn.query(
    `SELECT * FROM user WHERE LOWER(email) = LOWER(${dbConn.escape(
      req.body.email
    )});`,
    (err, result) => {
      if (result.length) {
        console.log(result)
        return res.status(409).send({
          msg: "This user is already in use!",
        });
      } else {
        // username is available
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err,
            });
          } else {
            // has hashed pw => add to database
            dbConn.query(
              `INSERT INTO user (username, email, password, confirmpassword) VALUES ('${req.body.name
              }', ${dbConn.escape(req.body.email)}, ${dbConn.escape(
                req.body.password
              )}, ${dbConn.escape(req.body.confirmpassword)})`,
              (err, result) => {
                if (err) {
                  throw err;
                  return res.status(400).send({
                    msg: err,
                  });
                }
                return res.status(201).send({
                  msg: "The user has been registerd with us!",
                });
              }
            );
          }
        });
      }
    }
  );
});


//JWT Login
app.post("/login", (req, res, next) => {
  // console.log(req)
  dbConn.query(
    `SELECT * FROM user WHERE email = ${dbConn.escape(req.body.email)};`,
    (err, result) => {
      console.log(result);
      // user does not exists
      if (err) {
        throw err;
        return res.status(400).send({
          msg: err,
        });
      }
      // if (!result) {
      //   return res.status(401).send({
      //     msg: "Email or password is incorrect!",
      //   });
      // }
      // check password
      // console.log(req.body.password, result[0]["password"])
      if (req.body.password === result[0]["password"]) {
        const token = jwt.sign(
          { id: result[0].id },
          "the-super-strong-secrect",
          { expiresIn: "1h" }
        );
        result[0].token = token;
        dbConn.query(
          `UPDATE user SET token_S = now() WHERE id = '${result[0].id}'`
        );
        return res.status(200).send({
          msg: "Logged in!",
          token,
          user: result[0],
        });
      }
      return res.status(401).send({
        msg: "Username or password is incorrect!",
      }); `
          `
    }
  );
}
);

//delete room
app.delete("/user", (req, res, next) => {
  
  
  const user_id = req.params.id

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer") ||
    !req.headers.authorization.split(" ")[1]
  ) {
    return res.status(422).json({
      message: "Please provide the token",
    });
  }
  const theToken = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(theToken, "the-super-strong-secrect");
  console.log(decoded)
  if(theToken){
    console.log(theToken)
    dbConn.query(
      "DELETE FROM room WHERE id = ?",
      [user_id],
      function (error, results, fields) {
        if (error) throw error;
        return res.send({
          error: false,
          data: results,
          message: "User has been deleted successfully.",
        });
      }
    );
  }
});

//get user information
app.get("/user", (req, res, next) => {
  dbConn.query(
    "SELECT * FROM user",
    function (error, results, fields) {
      // console.log(decoded.name)
      if (error) throw error;
      return res.send({ data: results, message: "User information Fetched Successfully." });
    }
  );
  // }
});
app.get("/user/:id", (req, res, next) => {
  const user_id = req.params.id

    dbConn.query(
      "SELECT * FROM user WHERE id=?",
      user_id,
      function (error, results, fields) {
        // console.log(decoded.name)
        if (error) throw error;
        return res.send({ data: results, message: "Users Fetch Successfully." });
      }
    );
  });


//Update Room
app.put("/update", (req, res, next) => {
  // console.log(res)

  const user_id = req.params.id
  
    dbConn.query(
      `SELECT * FROM room WHERE id = ${dbConn.escape(req.body.id)}`,
      function (error, results, fields) {
        if(results[0].id){
          dbConn.query(
          `UPDATE room SET Description = ${dbConn.escape(req.body.description)} WHERE id = '${results[0].id}'`,
          function (error, results, fields) {

          }
        )}
        // console.log(decoded.name)
        if (error) throw error;
        return res.send({ data: results, message: "Users updated Successfully." });
      }
    );
  }
// }
);

    //Multer Storage 
  const storage = multer.diskStorage({
      destination: function(req, file, cb) {
          cb(null, './uploads');
      },
     
      filename: function(req, file, cb) {
        // console.log(req.headers)
          cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
      }
  });
     
  var upload = multer({ storage: storage })
     
  app.get('/file', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
  
  app.post('/profile-upload-single', upload.any('profile-file'), function (req, res, next) {
    console.log(req)
    // req.body will hold the text fields, if there were any
    console.log(JSON.stringify(req.files))
    var response = '<a href="/">Home</a><br>'
    response += "Files uploaded successfully.<br>"
    response += `<img src="${req.files[0].path}" /><br>`
    var imgsrc = req.files[0].path
    var insertData = "INSERT INTO users1(images1)VALUES(?)"
    dbConn.query(insertData, [imgsrc],  (err, result) => {
        if (err) throw err;
        console.log("file uploaded")
        res.send({ message: "image added Successfully into database." });
    })
    return res.send(response)
  })
     

// set port in
app.listen(3000, function () {
  console.log("Node app is running on port 3000");
});
module.exports = app;