const mongoose = require("mongoose");
const connection = mongoose.connect("mongodb+srv://rbs24:15102004rbs@halalspotify.utv9f8k.mongodb.net/?retryWrites=true&w=majority&appName=halalspotify");

connection
  .then(() => {
    console.log("Connected to the database");
  })
  .catch(() => {
    console.log("Cannot connect to database");
  });

const loginSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const collection = mongoose.model("users", loginSchema);

module.exports = collection;
