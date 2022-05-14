const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsyn = require("./../utils/catchAsyn");
// const error = require("./../utils/error");
const User = require("./../models/usersModel");
const { findByIdAndUpdate } = require("./../models/usersModel");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};

const errResponse = (res, statusCode, message, data) => {
  return res.status(200).json({
    status: "fail",
    statusCode,
    message,
    data,
  });
};

exports.login = catchAsyn(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return errResponse(res, 400, "Please, Enter your email or password!!!", "");

  const user = await User.findOne({
    email,
  }).select("+password"); // password feild have been hided, we cannot include it in findOne()

  if (!user || !(await user.correctPassword(password, user.password)))
    return errResponse(res, 401, "Invalid email or password!!!", "");

  createSendToken(user, 200, res);
});

exports.signup = catchAsyn(async (req, res, next) => {
  const { userName, email, password, passwordConfirm } = req.body;

  const user = await User.findOne({ email });
  if (user) return errResponse(res, 401, "Email đã tồn tại!!!", "");

  const newUser = await User.create({
    name: userName,
    email,
    password,
    passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.isLoggedIn = async (req, res, next) => {
  //// no need to catch err just check user is logged or not
  let currentUser;
  if (req.body.token) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.body.token,
        process.env.JWT_SECRET
      );
      currentUser = await User.findById(decoded.id);
      if (!currentUser) return errResponse(res, 400, "No User Exist", "");
      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return errResponse(res, 400, "No User Exist", "");
      }
    } catch (e) {
      return errResponse(res, 400, e.message, "");
    }
  }
  return errResponse(res, 200, "User Exist", currentUser);
};

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
  });
};

exports.updatePassword = catchAsyn(async (req, res, next) => {
  const { currentPassword, passwordConfirm, newPassword, userId } = req.body;

  if (passwordConfirm !== newPassword)
    return errResponse(
      res,
      400,
      "New password and PasswordConfirm is not the same!!!",
      ""
    );

  const user = await User.findById(userId).select("+password");

  if (!(await user.correctPassword(currentPassword, user.password)))
    return errResponse(res, 400, "Incorrect Password!!!", "");

  user.password = newPassword;
  await user.save();

  createSendToken(user, 200, res);
});

// exports.restrict = (req, res, next) => {
//   console.log(req.body);
// };
