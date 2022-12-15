const express = require("express");
const mongoose = require("mongoose");
const category = require("./routes/categoryRoutes");
const unit = require("./routes/unitRoutes");
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
var url = "mongodb+srv://nambakadai8870:SMFQN5OIp8LA73cH@cluster0.voenvmf.mongodb.net/nambakadai";
 //var url = "mongodb+srv://codebusters:omSpIMdrjhxqhMZ5@cluster0.sp3ku.mongodb.net/<dbname>?retryWrites=true&w=majority";
const connect = mongoose.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }
);
connect.then(
  (db) => {
    console.log("Connected correctly to server");
  },
  (err) => {
    console.log(err);
  }
);
var app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.json("Welcome To Hope Up");
});

app.use("/api/category", category);
app.use("/api/unit", unit);

module.exports = app;
