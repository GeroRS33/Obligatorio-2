const mongoose = require("mongoose")

const opinionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 3 },
    createdAt: { type: Date, default: Date.now }
})

const movieSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },

    synopsis: { type: String },
    genero: { type: String },
    director: { type: String },
    ano: { type: Number },

    posterUrl: { type: String },     
    cast: [String],                  

    rating: { type: Number, default: 0 },
    opiniones: [opinionSchema]
})

const Movie = mongoose.model("Movie", movieSchema)

module.exports = Movie