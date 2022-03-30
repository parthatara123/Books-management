const mongoose = require("mongoose");

const validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const validateMobile = function (phone) {
  let number = /^[6-9]\d{9}$/;
  return number.test(phone);
};

const userSchema = mongoose.Schema(
  {
    title: {
      type      : String,
      required  : "Title is required",
      enum      : ["Mr", "Mrs", "Miss"]
    },
    name: {
      type      : String,
      trim      : true,
      required  : "User name is required"
    },
    phone: {
      type      : String,
      trim      : true,
      validate  : [validateMobile, "Please fill a valid phone number"],
      required  : "Mobile number is required",
      unique    : true
    },
    email: {
      type      : String,
      required  : "Email is required",
      lowercase : true,
      trim      : true,
      unique    : true,
      validate: [validateEmail, "Please fill a valid email address"]
    },
    password: {
      type       : String,
      required   : "Password is required",
      minlength  : 8,
      maxlength  : 15
    },
    address: {
      street     : { type: String, trim: true },
      city       : { type: String, trim: true },
      pincode    : { type: String, trim: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
