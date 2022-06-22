var express = require("express");
const AuthController = require("../controllers/AuthController");

var router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/organizations", AuthController.organizationList);
router.delete("/delete", AuthController.organizationDelete);
router.get("/get-user-data", AuthController.getUserData);
router.post("/change-org-status", AuthController.changeOrgStatus);
router.post("/update-organization", AuthController.organizationUpdate);


module.exports = router;