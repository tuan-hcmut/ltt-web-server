const express = require("express");
const app = express();
const morgan = require("morgan");

app.use(morgan("dev"));

const router = express.Router();
router.get("/", (req, res, next) => {
  return res.status(200).json({ name: "tuanne" });
});

app.use(router);

module.exports = app;
