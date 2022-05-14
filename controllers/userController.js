const catchAsyn = require("./../utils/catchAsyn");
const multer = require("multer");
const sharp = require("sharp");
const error = require("./../utils/error");
const User = require("./../models/usersModel");
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new error("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.resizeUserPhoto = catchAsyn(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.body.id}.jpeg`; /// photo user upload

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`); //save photo user upload following the url

  next();
});

const filterObj = (obj, fields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.uploadUserPhoto = upload.single("photo");

exports.updateMe = catchAsyn(async (req, res, next) => {
  const filteredObj = filterObj(req.body, ["name"]);
  if (req.file) filteredObj.photo = req.file.filename;

  const updateUser = await User.findByIdAndUpdate(req.body.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

exports.getAllUsers = catchAsyn(async (req, res, next) => {
  const users = await User.find();
  return res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

exports.removeUser = catchAsyn(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user)
    return res.status(200).json({
      status: "fail",
      data: "",
    });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
