const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const cors = require("cors")

require("dotenv").config()
const { dbConnect } = require("./db")
const { UserModel } = require("./models/User.model")
const { movieRouter } = require("./routes/movie")
const { authenticate } = require("./middlewares/authentication")
const app = express()

dbConnect()
app.use(express.json())
app.use(cors({
    origin: "*"
}))

app.get("/", (req, res) => {
    res.send("Welcome")
})

app.post("/signup", async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    const userPresent = await UserModel.findOne({ email })
    //TODO
    if (userPresent?.email) {
        res.send("Try loggin in, already exist")
    }
    else {
        try {
            bcrypt.hash(password, 4, async function (err, hash) {
                const user = new UserModel({ email, password: hash })
                await user.save()
                res.send("Sign up successfull")
            });

        }
        catch (err) {
            console.log(err)
            res.send("Something went wrong, pls try again later")
        }
    }

})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.find({ email })

        if (user.length > 0) {
            const hashed_password = user[0].password;
            bcrypt.compare(password, hashed_password, function (err, result) {
                if (result) {
                    const token = jwt.sign({ "userID": user[0]._id }, 'hush');
                    res.send({ "msg": "Login successfull", "token": token })
                }
                else {
                    res.send("Login failed")
                    console.log(err)
                }
            })
        }
        else {
            res.send("Login failed")
        }
    }
    catch {
        res.send("Something went wrong, please try again later")
    }
})


app.get("/about", (req, res) => {
    res.send("Welcome Home")
})

app.use(authenticate)
app.use("/api", movieRouter)


const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port:${port}... `))
