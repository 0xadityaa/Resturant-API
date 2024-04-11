const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  building: {
    type: String,
    required: true,
  },
  coord: {
    type: [Number],
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  zipcode: {
    type: String,
    required: true,
  },
});

const gradeSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
});

const restaurantSchema = new mongoose.Schema({
  address: addressSchema,
  borough: {
    type: String,
    required: true,
  },
  cuisine: {
    type: String,
    required: true,
  },
  grades: [gradeSchema],
  name: {
    type: String,
    required: true,
  },
  restaurant_id: {
    type: String,
    required: true,
  },
});

// Create and export the model
const Restaurant = mongoose.model("restaurant", restaurantSchema);
module.exports = Restaurant;
