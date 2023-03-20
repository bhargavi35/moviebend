const mongoose = require("mongoose")

const movieSchema = new mongoose.Schema({
    name: { type: String, required: true },
    img: { type: String, required: true },
    year: { type: String, required: true },
    genre: { type: [String], required: true },
    rating: { type: Number, required: true },
    userID: String
})

const movieModel = mongoose.model("movie", movieSchema)

module.exports = { movieModel }