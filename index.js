require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const appConfig = require("./package.json");

const app = express();
const bodyParser = require("body-parser"); // pull information from HTML POST (express4)
const db = require("./config/database");
const port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

const Restaurants = require("./models/restaurants");

//  Checking for db connection
if (db.initialize()) {
  app.listen(port, () => {
    console.log(`${appConfig.name} listening on port: ${port}`);
  });
}
