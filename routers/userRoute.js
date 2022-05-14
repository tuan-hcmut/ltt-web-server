const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

const router = express.Router();

router.patch(
  "/information/update",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

// router.get("/information/:id", userController.getUser);

router.patch("/information/updatepassword", authController.updatePassword);

router.get("/restrict/manager", userController.getAllUsers);

router.delete("/restrict/manager/remove/:id", userController.removeUser);

module.exports = router;
