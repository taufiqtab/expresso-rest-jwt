const e = require('express')
const express = require('express')
var mysql = require('mysql')
const second = require('./second.js');
const app = express()
const port = 3000

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'expresso',
    multipleStatements : true
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

app.listen(port, () => {
  console.log(`Your Coffee ready at http://localhost:${port}`)
})