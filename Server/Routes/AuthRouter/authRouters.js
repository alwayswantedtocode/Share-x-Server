const authRouters = require("express").Router();
const { register, login } = require("../../controllers/AuthController/authcontrollers");

authRouters.post("/register", register);
authRouters.post("/signin", login);

module.exports = authRouters;