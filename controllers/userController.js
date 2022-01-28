const bcrypt = require("bcryptjs");

const generateToken = require("../utils/generateToken");
const User = require("../models/user");
const { generateUsername } = require("../utils/helpers");

const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;
  console.log(name, email, password, phone);
  try {
    if (!(email && password && phone && name)) {
      return res.status(400).send({
        success: false,
        message: "Please enter all fields",
      });
    }
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      console.log(existingUser);
      let message = "E-mail already in use";
      if (existingUser.phone === phone)
        message = "Phone already in use";
      if (existingUser.phone === phone && existingUser.email === email)
        message = "Phone & Email already in use";
      return res.status(400).json({ message });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(name, email, phone, hashedPassword);
    const userSummary = {
      name,
      email,
      phone,
      password: hashedPassword,
      profileAvatar: 1,
      userName: generateUsername(name, phone),
    };
    const user = new User(userSummary);
    await user.save();
    const token = generateToken(user._id);
    return res.status(200).json({ token, user: userSummary });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong", err });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!(email && password)) {
      res.status(400).send("Missing fields");
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid password" });

    res.status(200).json({
      user: existingUser,
      token: generateToken(existingUser._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.params.userId;

  try {
    if (!(oldPassword && newPassword)) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser)
      return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      existingUser.password
    );
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid password" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    existingUser.password = hashedPassword;
    await existingUser.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const updateAvatar = async (req, res) => {
  const { oldAvatar, newAvatar } = req.body;
  const userId = req.params.userId;

  try {
    if (!(oldAvatar && newAvatar)) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser)
      return res.status(404).json({ message: "User doesn't exist" });

    existingUser.profileAvatar = newAvatar;
    await existingUser.save();

    return res.status(200).json({ message: "Avatar updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { registerUser, loginUser, updatePassword, updateAvatar };
