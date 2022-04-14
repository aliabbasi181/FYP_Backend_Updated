var express = require("express");
const EmployeeController = require("../controllers/EmployeeController");
const EmployeeLocationController = require("../controllers/EmployeeLocationController");

var router = express.Router();

router.get("/get-employees-last-location", EmployeeLocationController.getAllEmployeesLastLocation);
router.post("/register", EmployeeController.register);
router.get("/employeeDetail", EmployeeController.employeeDetail);
router.get("/", EmployeeController.employeeList);
router.post("/addLocation", EmployeeLocationController.addUserLocation);
router.post("/get-employee-location-on-date", EmployeeLocationController.getEmployeeLocationOnDate);
router.post("/get-last-location-employee", EmployeeLocationController.getEmployeeLastLocation);
// router.put("/:id", BookController.bookUpdate);
// router.delete("/:id", BookController.bookDelete);
// router.get("/status", GeoController.checkUserFenseStatus);

module.exports = router;