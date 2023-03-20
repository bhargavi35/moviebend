const movieRouter = require("express").Router();
const { Movie, movieModel } = require("../models/Movie");
const movies = require("../config/movie.json");

movieRouter.get("/movies", async (req, res) => {
    try {
        const page = parseInt(req.query.page) - 1 || 0;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || "";
        let sort = req.query.sort || "rating";
        let genre = req.query.genre || "All";

        const genreOptions = [
            "Action",
            "Romance",
            "Fantasy",
            "Drama",
            "Crime",
            "Adventure",
            "Thriller",
            "Sci-fi",
            "Music",
            "Family",
        ];

        genre === "All"
            ? (genre = [...genreOptions])
            : (genre = req.query.genre.split(","));
        req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

        let sortBy = {};
        if (sort[1]) {
            sortBy[sort[0]] = sort[1];
        } else {
            sortBy[sort[0]] = "asc";
        }

        const movies = await Movie.find({ name: { $regex: search, $options: "i" } })
            .where("genre")
            .in([...genre])
            .sort(sortBy)
            .skip(page * limit)
            .limit(limit);

        const total = await Movie.countDocuments({
            genre: { $in: [...genre] },
            name: { $regex: search, $options: "i" },
        });

        const response = {
            error: false,
            total,
            page: page + 1,
            limit,
            genres: genreOptions,
            movies,
        };

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});



movieRouter.post("/create", async (req, res) => {
    const payload = req.body
    //get token from header
    //verify token using jwt
    try {
        const new_movie = new Movie.movieModel(payload)
        await new_movie.save()
        res.send({ "msg": "movie created successfully" })
    }
    catch (err) {
        console.log(err)
        res.send({ "err": "Something went wrong" })
    }
})

movieRouter.patch("/update/:movieID", async (req, res) => {
    const movieID = req.params.movieID
    const userID = req.body.userID
    const movie = await movieModel.findOne({ _id: movieID })
    if (userID !== movie.userID) {
        res.send("Not authorised")
    }
    else {
        await movieModel.findByIdAndUpdate({ _id: movieID }, payload)
        res.send({ "msg": "movie updated successfully" })
    }
})

movieRouter.delete("/delete/:movieID", async (req, res) => {
    const movieID = req.params.movieID
    const userID = req.body.userID
    const movie = await movieModel.findOne({ _id: movieID })
    if (userID !== movie.userID) {
        res.send("Not authorised")
    }
    else {
        await movieModel.findByIdAndDelete({ _id: movieID })
        res.send({ "msg": "movie deleted successfully" })
    }
})
// const insertMovies = async () => {
//     try {
//         const docs = await Movie.insertMany(movies);
//         return Promise.resolve(docs);
//     } catch (err) {
//         return Promise.reject(err)
//     }
// };

// insertMovies()
//     .then((docs) => console.log(docs))
//     .catch((err) => console.log(err))

module.exports = { movieRouter };
