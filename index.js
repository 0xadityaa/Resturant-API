require("dotenv").config();
const express = require("express");
const appConfig = require("./package.json");
const mongoose = require("mongoose");
const { engine } = require("express-handlebars");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Joi = require("joi");

const app = express();
const bodyParser = require("body-parser"); // pull information from HTML POST (express4)
const db = require("./config/database");
const port = process.env.PORT || 8000;
const database = process.env.DB_CONNECTION_STRING;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// view engine setup
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    helpers: {},
  })
);
app.set("view engine", ".hbs");

app.set("views", "./views");

// allow forms
app.use(express.urlencoded({ extended: true }));

// Middleware to authenticate the access through header JWT Bearer token
function verifyToken(req, res, next) {
  const bearerHeadr = req.headers["authorization"];
  if (typeof bearerHeadr != "undefined") {
    const bearer = bearerHeadr.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    jwt.verify(req.token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        res.sendStatus(401);
        return;
      }
      console.log(decoded);
      next();
    });
  } else {
    res.sendStatus(401);
    return;
  }
}

// Schema definitions for object validations during api calls
const userSignUpSchema = Joi.object({
  firstName: Joi.string().max(20).required(),
  lastName: Joi.string().max(20).required(),
  username: Joi.string().alphanum().min(3).max(20).required(),
  password: Joi.string(),
});

const userLoginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(20).required(),
  password: Joi.string(),
});

const restaurantBodySchema = Joi.object({
  address: Joi.object({
    building: Joi.string().required(),
    coord: Joi.array().items(Joi.number()).min(2).max(2).required(),
    street: Joi.string().required(),
    zipcode: Joi.string().min(5).max(10).required(),
  }),
  borough: Joi.string().required(),
  cuisine: Joi.string().required(),
  grades: Joi.array()
    .items(
      Joi.object({
        date: Joi.date().iso().required(),
        grade: Joi.string().valid("A", "B", "C", "D", "E").required(),
        score: Joi.number().integer().min(0).max(100).required(),
      })
    )
    .optional(),
  name: Joi.string().required(),
  restaurant_id: Joi.string().required(),
});

const validateId = Joi.object({
  id: Joi.string().required(),
});

// Route for signup form
app.get("/signup", (req, res) => {
  res.status(200).render("signup");
});

// Route to handle signup auth
app.post("/signup", async (req, res) => {
  // Hashing pswd with salt size of 10
  const password = await bcrypt.hash(req.body.password, 10);

  const user = {
    firstName: req.body.fname,
    lastName: req.body.lname,
    username: req.body.username,
    password: password,
  };

  const parseRes = userSignUpSchema.validate(user);

  if (parseRes.error === undefined) {
    db.addNewUser(user)
      .then(() => {
        const accessToken = jwt.sign(user, process.env.JWT_KEY);
        res
          .status(200)
          .json({ info: "Signed Up Successfully", accessToken: accessToken });
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  } else {
    res.status(422).json({ info: "Invalid request body params!" });
  }
});

// Route for login form
app.get("/login", (req, res) => {
  res.status(200).render("login");
});

// Route to handle login auth
app.post("/login", (req, res) => {
  const user = { username: req.body.username, password: req.body.password };

  const parseRes = userLoginSchema.validate(user);

  if (parseRes.error === undefined) {
    db.isValidUser(user).then((response) => {
      if (response) {
        const accessToken = jwt.sign(user, process.env.JWT_KEY);
        res
          .status(200)
          .json({ info: "Login Successful", accessToken: accessToken });
      } else {
        res.status(404).json({ info: "User not found" });
      }
    });
  } else {
    res.status(422).json({ info: "Invalid request body params!" });
  }
});

// Route to display the form
app.get("/api/restaurants/form", (req, res) => {
  res.render("restaurantsForm");
});

// Route to add new restaurant to db
app.post("/api/restaurants", verifyToken, (req, res) => {
  const parseRes = restaurantBodySchema.validate({ ...req.body });
  console.log(parseRes);
  if (parseRes.error === undefined) {
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
    res.status(422).json({ info: "Invalid request body params!" });
  }
});

// Route to get all restaurants from db
app.get("/api/restaurants", (req, res) => {
  if (
    req.query.page === null ||
    req.query.perPage === null ||
    req.query.page === null ||
    req.query.perPage === null
  ) {
    res.status(400).json({ info: "Bad request, params not found!" });
  }
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
});

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
app.put("/api/restaurants/:id", verifyToken, (req, res) => {
  const parseRes = restaurantBodySchema.validate({ ...req.body });
  const parseId = Joi.string(req.params.id).required();

  if (parseRes.error === undefined && parseId.error === undefined) {
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
    res.status(422).json({ info: "Invalid request id or body params!" });
  }
});

// Route to Delete Restaurant By Id
app.delete("/api/restaurants/:id", verifyToken, (req, res) => {
  const parseId = validateId.validate({ id: req.params.id });
  if (parseId.error === undefined) {
    db.deleteRestaurantById(req.params.id)
      .then((response) => {
        res
          .status(200)
          .json({ info: "Restaurant Deleted from DB", res: response });
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  } else {
    res.status(422).json({ info: "Invalid request id or body params!" });
  }
});

// Route to handle form submission and display results
app.post("/api/restaurants/form", verifyToken, (req, res) => {
  try {
    const { page = 1, perPage = 10, borough } = req.body;
    db.getAllRestaurants(
      parseInt(req.query.page),
      parseInt(req.query.perPage),
      req.query.borough
    ).then((response) => {
      console.log(response);
      res.render("restaurantsList", {
        borough: borough,
        restaurants: response,
      });
    });
  } catch (error) {
    res.status(500).json(error);
  }
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
  .catch((error) => {
    console.log("DB Connection FAILED!", error);
  });

module.exports = app;
