const express = require("express");
const app = express();
const server = require("http").createServer(app);
const bodyParser = require("body-parser");
const cors = require("cors");
const APP = require("./app");

var FCM = require('fcm-node');
var serverKey = 'AAAAtxlC9M8:APA91bGM95tGlF_DsTh-RYG93yHngZkkxfB0JFw7z-VVAc8IFonq5GzKljR3Gp66YXiRyR_WM02O2ujKp4iDgPSzT2aFT5Lz715f8kVYfTZdYwuYTqhlD5IEDYAVWgxBJidB4KjNZQUR'; //put your server key here
var fcm = new FCM(serverKey);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json({
  limit: '50mb'
}));

app.use(bodyParser.urlencoded({
  limit: '50mb',
  parameterLimit: 100000,
  extended: true
}));
app.use(cors());
app.use(express.json());
app.use(APP)

server.listen(process.env.PORT || 8081, () => {
  console.log(`Server running `, process.env.PORT || 8081);
});
