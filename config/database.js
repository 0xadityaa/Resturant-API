const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Restaurant = require("../models/restaurants");
const User = require("../models/users");

const addNewUser = async (data) => {
  try {
    const user = new User({ ...data });
    const res = await user.save();
  } catch (err) {
    console.log("Error: ", err);
  }
};

const isValidUser = async (data) => {
  try {
    const username = data.username;
    const password = data.password;

    const user = await User.findOne({ username: username }).lean();
    if (!user) {
      return false;
    }
    const isValid = await bcrypt.compare(password, user.password);

    return isValid;
  } catch (err) {
    console.log("Error: ", err);
    return false;
  }
};

const addNewRestaurant = async (data) => {
  try {
    const restaurant = new Restaurant({ ...data });
    const res = await restaurant.save();
    return res;
  } catch (err) {
    console.log("Error: ", err);
  }
};

const getAllRestaurants = async (page, perPage, borough) => {
  try {
    page = Math.max(0, page);
    perPage = perPage || 10;

    const restaurants = await Restaurant.find()
      .lean()
      .sort({ restaurant_id: "asc" })
      .where("borough")
      .regex(borough && borough !== "" ? RegExp(borough, "i") : RegExp("^"))
      .skip(page * perPage)
      .limit(perPage);
    return restaurants;
  } catch (error) {
    console.error(error);
  }
};

const getRestaurantById = async (id) => {
  try {
    const restaurant = await Restaurant.findById(id);
    return restaurant;
  } catch (error) {
    console.error(error);
  }
};

const updateRestaurantById = async (id, data) => {
  try {
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, {
      ...data,
    });
    return updatedRestaurant;
  } catch (error) {
    console.log(error);
  }
};

const deleteRestaurantById = async (id) => {
  try {
    const deleteRestaurant = await Restaurant.findByIdAndDelete(id);
    return deleteRestaurant;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addNewRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantById,
  deleteRestaurantById,
  addNewUser,
  isValidUser,
};
