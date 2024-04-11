const mongoose = require("mongoose");

const Restaurant = require("../models/restaurants");
const { query } = require("express");

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

    let query = {};
    if (borough) {
      query.borough = borough;
    }

    const restaurants = await Restaurant.find(query)
      .sort({ restaurant_id: "asc" })
      .skip(page * perPage)
      .limit(perPage);
    return restaurants;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  addNewRestaurant,
  getAllRestaurants,
};
