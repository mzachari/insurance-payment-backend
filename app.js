const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const farmersRoutes = require('./routes/farmers');
const farmRoutes = require('./routes/farms');
const cropRoutes = require('./routes/crops');
const insuranceRoutes = require('./routes/insurance');

var socket = require('socket.io-client')('http://localhost:8888',{ query: "points=[ [ 12.910869789073772, 77.59626583204385 ], [ 12.910671094624115, 77.59627119646188 ], [ 12.910739069058868, 77.59634898052332 ] ]"});

const app = express();
mongoose.connect("mongodb://admin:Welcome1@ds343718.mlab.com:43718/insurance-payment",{useNewUrlParser: true})
        .then(() =>{
          console.log('Connected to database!');
        })
        .catch((error) =>{
          console.log(error);
          console.log('Connection failed!');
        })
app.use("/insurance-plan-images", express.static(path.join("insurance-plan-images")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use((req,res,next) =>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, PATCH, OPTIONS')
  next();
})

app.use("/api/farmers",farmersRoutes);
app.use('/api/farms',farmRoutes);
app.use('/api/crops',cropRoutes);
app.use('/api/insurance', insuranceRoutes);

app.get('/',(req, res,next)=> {
  res.send("Welcome to insurance payment app");
})


socket.on('connect', function(){
  console.log("connected to the socket at 8888")
});

socket.on('temperature', function (value) {
  console.log(value);
})


module.exports = app;
