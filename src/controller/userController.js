const UserModel = require("../model/userModel");
const jwt = require("jsonwebtoken");

const isValid = function (value) {
  if (typeof value == "undefined" || typeof value == null) return false;
  if (typeof value == "string" && value.trim().length == 0) return false;
  return true;
};

  const validPhone = function (phone) {
  const number = /^[6-9]\d{9}$/;
  return number.test(phone);
};

const validEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const registerUser = async function (req, res) {
  try {
    const inputBody = req.body;
    const inputQuery = req.query;

    if (Object.keys(inputQuery).length !== 0) {
      return res.status(400).send({ status: false, msg: "Invalid Endpoint" });
    }

    if (Object.keys(inputBody).length === 0) {
      return res.status(400).send({
        status: false,
        msg: "Please provide user data in request body",
      });
    }

    const { title, name, phone, email, password } = inputBody;

    //validation for required properties
    if (!isValid(title)) {
      return res
        .status(400)
        .send({ status: false, msg: "User title is required" });
    }

    if (["Mr", "Mrs", "Miss"].includes(title) == false) {
      return res
        .status(400)
        .send({ status: false, msg: `Title must be Mr / Mrs / Miss` });
    }

    if (!isValid(name)) {
      return res
        .status(400)
        .send({ status: false, msg: "User name is required" });
    }

    if (!isValid(phone)) {
      return res
        .status(400)
        .send({ status: false, msg: "User phone is required" });
    }

    if (!validPhone(phone)) {
      return res.status(400).send({
        status: false,
        msg: "Phone number must be of 10 digits without any country code or 0",
      });
    }

    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, msg: "User email is required" });
    }

    if (!validEmail(email)) {
      return res.status(400).send({ status: false, msg: "Invalid email id" });
    }

    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, msg: "User password is required" });
    }

    if (password.length < 8 || password.length > 15) {
      return res.status(400).send({
        status: false,
        msg: "Password length must be between 8 to 15",
      });
    }


    const userByPhone = await UserModel.findOne({ phone });

    if (userByPhone) {
      return res
        .status(400)
        .send({ status: false, msg: "Phone number already exists" });
    }

    const emailInLowerCase = email.toLowerCase();
    const userByEmail = await UserModel.findOne({ email: emailInLowerCase });

    if (userByEmail) {
      return res
        .status(400)
        .send({ status: false, msg: "Email already exists" });
    }

    const registeredUser = await UserModel.create(inputBody);

    res.status(201).send({
      status: true,
      msg: "New user registered successfully",
      data: registeredUser,
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};







const userLogin = async function (req, res) {
  try {
    const inputBody = req.body;
    const inputQuery = req.query;

    if (Object.keys(inputQuery).length > 0) {
      return res.status(400).send({ status: false, msg: "Invalid Endpoint" });
    }

    if (Object.keys(inputBody).length === 0) {
      return res
        .status(400)
        .send({ Status: false, msg: "Please provide email id and password" });
    }

    const { email, password } = inputBody;

    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, msg: "Email id is required" });
    }

    if (!validEmail(email)) {
      return res
        .status(400)
        .send({ status: false, msg: "Email id is invalid" });
    }

    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, msg: "Password is required" });
    }

    if (password.length < 8 || password.length > 15) {
      return res.status(400).send({
        status: false,
        msg: "Password length must be between 8 to 15"
      });
    }

    const emailInLowerCase = email.toLowerCase();

    const loginUser = await UserModel.findOne({
      email: emailInLowerCase,
      password: password
    });

    if (!loginUser) {
      return res
        .status(404)
        .send({ status: false, msg: "Invalid login credentials" });
    }

    const payLoad = { userId: loginUser._id };
    const secretKey = "myprivatekeywhichcontains!@#123";
    const expiry = { expiresIn: "1h" };

    const token = jwt.sign(payLoad, secretKey, expiry);

    res.header("x-api-key", token);

    res
      .status(200)
      .send({ status: true, msg: "Login successful", data: token });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

module.exports.registerUser = registerUser;
module.exports.userLogin = userLogin;
