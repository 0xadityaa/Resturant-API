require("dotenv").config();
const express = require("express");
const appConfig = require("./package.json");
const mongoose = require("mongoose");

const app = express();
const bodyParser = require("body-parser"); // pull information from HTML POST (express4)
const db = require("./config/database");
const port = process.env.PORT || 8000;
const database = process.env.DB_CONNECTION_STRING;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to add new restaurant to db
app.post("/api/restaurants", (req, res) => {
  db.addNewRestaurant(req.body)
    .then((response) => {
      res.status(200).json({ info: "Restaurant Data Inserted", res: response });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

// Route to get all restaurants from db
app.get("/api/restaurants", (req, res) => {
  db.getAllRestaurants(
    parseInt(req.query.page),
    parseInt(req.query.perPage),
    req.query.borough
  )
    .then((response) => {
      res
        .status(200)
        .json({ info: "Fetched requested restaurants", res: response });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

//  Checking for db connection
mongoose
  .connect(database)
  .then(() => {
    console.log("DB Connection SUCCESS");
    app.listen(port, () => {
      console.log(`${appConfig.name} listening on port: ${port}`);
    });
  })
  .catch((err) => {
    console.log("DB Connection FAILED!", err);
  });
