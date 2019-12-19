const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const farmersRoutes = require('./routes/farmers');
const farmRoutes = require('./routes/farms');
const cropRoutes = require('./routes/crops');
const insuranceRoutes = require('./routes/insurance');


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




module.exports = app;
