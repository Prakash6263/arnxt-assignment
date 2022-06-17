const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
const {
  isValidrequestBody,
  isValid,
  isValidObjectId,
} = require("../validate/validator");
const { uploadFile } = require("../validate/aws");
const bcrypt = require("bcrypt");
const saltRounds = 10;

//1-Api-registerNewUser~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const registerUser = async (req, res) => {
  try {
    //checking requestBody
    if (!isValidrequestBody(req.body))
      return res.status(400).json({
        status: false,
        msg: "Invalid request parameters, please provide user details",
      });

    //extracting property through destructuring from req.body object
    let { fname, lname, email, profileImage, phone, password } = req.body;

    //validations begins
    if (!isValid(fname))
      return res.status(400).json({ status: false, msg: "fname is required" });

    if (!isValid(lname))
      return res.status(400).json({ status: false, msg: "lname is required" });

    if (!isValid(email))
      return res.status(400).json({ status: false, msg: "email is required" });

    //inique email validation
    let isEmailUsed = await userModel.findOne({ email });

    if (isEmailUsed)
      return res
        .status(400)
        .json({ status: false, msg: `${email} already exists` });

    //regex pattern for valid email address
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
      return res
        .status(400)
        .json({ status: false, message: "Invalid Email id." });

    //validating req.files in body
    if (!isValidrequestBody(req.files))
      return res
        .status(400)
        .json({ status: false, msg: "profileImg is required" });

    // if (req.files && req.files.length > 0)
    profileImage = await uploadFile(req.files[0]);

    if (!isValid(phone))
      return res.status(400).json({ status: false, msg: "phone is required" });

    let isPhoneUsed = await userModel.findOne({ phone });

    if (isPhoneUsed)
      return res
        .status(400)
        .json({ status: false, msg: `${phone} already exists` });

    if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone))
      return res.status(400).json({
        status: false,
        message: "Phone number must be a valid Indian number.",
      });

    if (!isValid(password))
      return res
        .status(400)
        .json({ status: false, msg: "password is required" });

    if (password.length < 8 || password.length > 15)
      return res
        .status(400)
        .json({ status: false, msg: "password length be btw 8-15" });

    //hassing password using bycrpt
    let hasedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      fname,
      lname,
      email,
      phone,
      password: hasedPassword,
      profileImage,
    };

    let user = await userModel.create(newUser);
    res
      .status(201)
      .send({ status: true, message: "User created successfully", data: user });
  } catch (err) {
    res.status(500).json({ status: false, msg: err.message });
  }
};

//2-Api-logging-User~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`

const login = async (req, res) => {
  try {
    if (!isValidrequestBody(req.body))
      return res.status(400).json({
        status: false,
        message: "Invalid parameters ,please provide email and password",
      });
    //extractiong property values from reqBody
    let { email, password } = req.body;

    if (!isValid(email))
      return res.status(400).json({
        status: false,
        message: "email is required",
      });

    //validationg a valid email using regex
    if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))
      return res.status(400).json({
        status: false,
        message: `Email should be a valid email address`,
      });

    if (!isValid(password))
      return res
        .status(400)
        .json({ status: false, message: "password is required" });

    // Password length validation
    if (password.length < 8 || password.length > 15)
      return res
        .status(400)
        .json({ status: false, msg: "password length be btw 8-15" });

    if (email && password) {
      let User = await userModel.findOne({ email: email });
      if (!User)
        return res
          .status(400)
          .json({ status: false, msg: "email does not exist" });

      let decryppasss = await bcrypt.compare(password, User.password);

      if (decryppasss) {
        const Token = jwt.sign(
          {
            userId: User._id,
            exp: Math.floor(Date.now() / 1000) + 30 * 60,
            //exp date 30*60=30min
          },
          "Dp2022"
        );

        res.status(200).json({
          status: true,
          msg: "successfully loggedin",
          data: { userId: User._id, token: Token },
        });
      } else
        return res.status(400).json({ status: false, Msg: "Invalid password" });
    }
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

//03--update profile picture or password
const updateUser = async (req, res) => {
  try {
    let files = req.files;

    if (!isValidObjectId(req.params.userId))
      return res
        .status(400)
        .json({ status: false, message: `${userId} is invalid` });

    const userFound = await userModel.findOne({ _id: req.params.userId });

    if (!userFound)
      return res
        .status(404)
        .json({ status: false, message: `User do not exists` });

    //Authorisation
    if (req.params.userId.toString() !== req.user.userId)
      return res.status(401).json({
        status: false,
        message: `UnAuthorized access to user`,
      });

    if (!isValidrequestBody(req.body))
      return res
        .status(400)
        .json({ status: false, message: "Please provide details to update" });

    // destructuring the body
    let { password } = req.body;

    let updateUserData = {};

    if (password) {
      if (isValid(password)) {
        const encryptPass = await bcrypt.hash(password, 10);
        updateUserData["password"] = encryptPass;
      }
    }

    // let files = req.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        let uploadedFileURL = await uploadFile(files[i]);
        if (uploadedFileURL) updateUserData["profileImage"] = uploadedFileURL;
      }
    }
    const updatedUserData = await userModel.findOneAndUpdate(
      { _id: req.params.userId },
      updateUserData,
      { new: true }
    );
    return res.status(201).json({ status: true, data: updatedUserData });
  } catch (error) {
    return res.status(500).json({ status: false, msg: error.message });
  }
};

module.exports = { registerUser, login, updateUser };
