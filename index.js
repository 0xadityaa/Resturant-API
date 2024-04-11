require("dotenv").config();
const express = require("express");
const appConfig = require("./package.json");
const mongoose = require("mongoose");
const { query, body } = require("express-validator");

const app = express();
const bodyParser = require("body-parser"); // pull information from HTML POST (express4)
const db = require("./config/database");
const port = process.env.PORT || 8000;
const database = process.env.DB_CONNECTION_STRING;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to add new restaurant to db
app.post(
  "/api/restaurants",
  body(
    "address",
    "borough",
    "cuisine",
    "grades",
    "name",
    "restaurant_id"
  ).notEmpty(),
  (req, res) => {
    const validationResult = validationResult(req);
    if (validationResult.isEmpty()) {
      db.addNewRestaurant(req.body)
        .then((response) => {
          res
            .status(200)
            .json({ info: "Restaurant Data Inserted", res: response });
        })
        .catch((error) => {
          res.status(500).json(error);
        });
    } else {
      res.status(400).json({ info: "Bad Request, invalid body params" });
    }
  }
);

// Route to get all restaurants from db
app.get(
  "/api/restaurants",
  query("page", "perPage", "borough").notEmpty(),
  (req, res) => {
    const validationResult = validationResult(req);
    if (validationResult.isEmpty()) {
      db.getAllRestaurants(
        parseInt(req.query.page),
        parseInt(req.query.perPage),
        req.query.borough
      )
        .then((response) => {
          res.status(200).json({
            info: "Fetched all the requested restaurants",
            res: response,
          });
        })
        .catch((error) => {
          res.status(500).json(error);
        });
    } else {
      res.status(400).json({ info: "Bad Request, invalid query params" });
    }
  }
);

// Route to get specific restaurant from db
app.get("/api/restaurants/:id", (req, res) => {
  db.getRestaurantById(req.params.id)
    .then((response) => {
      res
        .status(200)
        .json({ info: "Fetched specific requested restaurant", res: response });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

// Route to Update Restaurant By Id
app.put(
  "/api/restaurants/:id",
  body(
    "address",
    "borough",
    "cuisine",
    "grades",
    "name",
    "restaurant_id"
  ).notEmpty(),
  (req, res) => {
    const validationResult = validationResult(req);
    if (validationResult.isEmpty()) {
      db.updateRestaurantById(req.params.id, req.body)
        .then((response) => {
          res
            .status(200)
            .json({ info: "Restaurant data Updated", res: response });
        })
        .catch((error) => {
          res.status(500).json(error);
        });
    } else {
      res.status(400).json({ info: "Bad Request, invalid body params" });
    }
  }
);

//  Checking for db connection
mongoose
  .connect(database)
  .then(() => {
    console.log("DB Connection SUCCESS");
    app.listen(port, () => {
      console.log(`${appConfig.name} listening on port: ${port}`);
    });
  })
  .catch((error) => {
    console.log("DB Connection FAILED!", error);
  });
