const mongoose = require("mongoose");

const Restaurant = require("../models/restaurants");

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
      .lean()
      .sort({ restaurant_id: "asc" })
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
};
