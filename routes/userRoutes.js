const router = require('express').Router()
const UserController = require("../controllers/userController");

router.post("/register", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.post("/:userId/updatePassword", UserController.updatePassword);
router.post("/:userId/updateAvatar", UserController.updateAvatar);

module.exports = router;