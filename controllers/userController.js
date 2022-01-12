const bcrypt = require('bcryptjs');

const generateToken = require('../utils/generateToken');
const User = require('../models/user');

const registerUser = async (req, res) => {
     const { name, email, confirmPassword, password, } = req.body;

     try {
          if (!(email && password && confirmPassword && name)) {
			res.status(400).send("Missing fields");
          }
          
          const existingUser = await User.findOne({ email });
		if (existingUser)
			return res.status(400).json({ message: "User already exists" });
          
          if(password !== confirmPassword)
               return res.status(400).json({ message: "Passwords do not match" });
          
          const salt=await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          const user = new User({
               name,
               email,
               password: hashedPassword,
          });
          await user.save();
          const token = generateToken(user._id);
          res.status(200).json({ user, token });
          
     } catch (err) {
           res.status(500).json({ message: "Something went wrong" });
     }
}


const loginUser = async (req, res) => { 
     const { email, password } = req.body;

     try {
          if (!(email && password)) {
			res.status(400).send("Missing fields");
          }
          
          const existingUser = await User.findOne({ email });
          if (!existingUser)
               return res.status(404).json({ message: "User doesn't exist" });
          
          const isPasswordValid = await bcrypt.compare(password, existingUser.password);
          if (!isPasswordValid)
               return res.status(401).json({ message: "Invalid password" });
          
          res.status(200).json({
               user: existingUser,
               token:generateToken(existingUser._id),
          });
     } catch (err) { 
          res.status(500).json({ message: 'Something went wrong' });
     }
}

module.exports = {registerUser, loginUser}