const mongoose = require("mongoose");

const database = process.env.DB_CONNECTION_STRING;

const initialize = () => {
  mongoose
    .connect(database)
    .then(() => {
      console.log("DB Connection SUCCESS");
      return true;
    })
    .catch((err) => {
      console.log("DB Connection FAILED!", err);
      return false;
    });
};

module.exports = {
  initialize,
};
