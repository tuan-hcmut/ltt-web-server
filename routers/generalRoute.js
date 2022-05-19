const express = require("express");

const authController = require("../controllers/authController");

const router = express.Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/isloggin", authController.isLoggedIn);
router.get("/logout", authController.logout);

router.get("/", (req, res, next) => {
  res.status(200).render("img");
});
module.exports = router;
