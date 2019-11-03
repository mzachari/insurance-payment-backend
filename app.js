const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const farmersRoutes = require('./routes/farmers');
const farmRoutes = require('./routes/farms');

const app = express();
mongoose.connect("mongodb://admin:Welcome1@localhost:27017/insurance",{useNewUrlParser: true})
        .then(() =>{
          console.log('Connected to database!');
        })
        .catch((error) =>{
          console.log(error);
          console.log('Connection failed!');
        })
app.use("/images", express.static(path.join("images")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use((req,res,next) =>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, PATCH, OPTIONS')
  next();
})

app.use("/api/farmers",farmersRoutes);
app.use('/api/farmers/:farmerId/farms',farmRoutes);

module.exports = app;
