const e = require('express')
const express = require('express')
var mysql = require('mysql')
const second = require('./second.js');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const app = express()
const port = 3000

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'expresso',
    multipleStatements : true
  })

  app.get('/jwt', (req, res) => {
    let privateKey = fs.readFileSync('./private.pem', 'utf8');
    let token = jwt.sign({ "body": "stuff" }, privateKey, { algorithm: 'HS256'});
    res.send(token);
})

app.get('/', (req, res) => {
  res.send('Assalamualaikum Bunda!')
  second(10);
})

app.get('/coffee', (req, res) => {
    let coffee;
    connection.query('SELECT * from coffee', function (err, result, fields) {
        if (err){
            console.log(err);//throw err  
        } else {
            coffee = result
        }
        res.json({data : coffee})
    })
  })

  app.get('/coffeecount', (req, res) => {
    let data;
    let total = 0;
    let totalQty = 0;
    
    connection.query('SELECT * from coffee; select count(*) as total from coffee;select SUM(qty) as totalQty from coffee',function(err, result){
        if(err){
            throw err;
        }else{
            data = result[0];
            total = result[1][0].total;
            totalQty = result[2][0].totalQty
            res.json({data, total, totalQty})
        }
    });
    
  })

  app.get('/secret', isAuthorized, (req, res) => {
    res.json({ "message" : "THIS IS SUPER SECRET, DO NOT SHARE!" })
})

function isAuthorized(req, res, next) {
  if (typeof req.headers.authorization !== "undefined") {
      // retrieve the authorization header and parse out the
      // JWT using the split function
      let token = req.headers.authorization.split(" ")[1];
      
      let privateKey = fs.readFileSync('./private.pem', 'utf8');
      // Here we validate that the JSON Web Token is valid and has been 
      // created using the same private pass phrase
      jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, user) => {
          
          // if there has been an error...
          if (err) {  
              // shut them out!
              res.status(500).json({ error: "Not Authorized" });
          }
          // if the JWT is valid, allow them to hit
          // the intended endpoint
          return next();
      });
  } else {
      // No authorization header exists on the incoming
      // request, return not authorized
      res.status(500).json({ error: "Not Authorized" });
  }
}


app.listen(port, () => {
  console.log(`Your Coffee ready at http://localhost:${port}`)
})