const express = require("express");
const app = express();
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
const genreralRoute = require("./routers/generalRoute");
const userRoute = require("./routers/userRoute");

const cors = require("cors");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use(cors());

app.use(morgan("dev"));

app.use("/", genreralRoute);
app.use("/user", userRoute);

module.exports = app;
