const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
  building: String,
  coord: [Number],
  street: String,
  zipcode: String,
});

const GradeSchema = new Schema({
  date: Date,
  grade: String,
  score: Number,
});

const RestaurantsSchema = new Schema({
  address: AddressSchema,
  borough: String,
  cuisine: String,
  grade: [GradeSchema],
  name: String,
  restaurant_id: String,
});

module.exports = mongoose.model("Restaurant", RestaurantsSchema);
