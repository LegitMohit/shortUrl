require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require("./connect");
const {checkForAuthentication, restrictTo} = require('./middleware/auth');
const URL = require("./models/url");
const app = express();
const port = process.env.PORT
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");

connectToMongoDB(process.env.MONGO_URL).then(() => {
    console.log("Connected to MongoDB");
});

app.set("view engine", "ejs");

app.set("views", path.resolve("./views"));

app.use(express.static(path.resolve("./public")));

app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(checkForAuthentication);

app.use("/url", restrictTo(['NORMAL']), urlRoute);
app.use("/user", userRoute);
app.use("/", staticRoute);


app.get("/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({ 
        shortId
    },
    {
        $push: { 
            visithistory: {
                timestamp: Date.now(),
            },
        },
    });
    if (!entry) return res.status(404).json({ error: "url not found" });
    res.redirect(entry.redirectURL);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


