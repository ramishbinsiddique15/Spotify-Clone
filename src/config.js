
const mongoose = require('mongoose');
const connection = mongoose.connect("mongodb://localhost:27017/Login");

connection.then(()=>{
    console.log("Connected to the database");
})
.catch(()=>{
    console.log("Cannot connect to database");
})

const loginSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const collection = mongoose.model('users', loginSchema);

module.exports = collection;