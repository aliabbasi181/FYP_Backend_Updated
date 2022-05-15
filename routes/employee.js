var express = require("express");
const EmployeeController = require("../controllers/EmployeeController");
const EmployeeLocationController = require("../controllers/EmployeeLocationController");

var router = express.Router();

router.post("/get-employees-last-location", EmployeeLocationController.getAllEmployeesLastLocation);
router.post("/register", EmployeeController.register);
router.get("/employeeDetail", EmployeeController.employeeDetail);
router.get("/", EmployeeController.employeeList);
router.post("/change-active-status", EmployeeController.changeActiveStatus);
router.post("/addLocation", EmployeeLocationController.addUserLocation);
router.post("/get-employee-by-id", EmployeeLocationController.getEmployeeById);
router.post("/get-employee-location-on-date", EmployeeLocationController.getEmployeeLocationOnDate);
router.post("/get-employee-location-on-two-dates", EmployeeLocationController.getEmployeeLocationOnTwoDate);
router.post("/get-employee-location-on-time-range", EmployeeLocationController.getEmployeeLocationOnTimeRange);
router.post("/get-employee-location-on-date-and-time-range", EmployeeLocationController.getEmployeeLocationOnDateAndTimeRange);
router.post("/get-last-location-employee", EmployeeLocationController.getEmployeeLastLocation);
router.post("/get-employees-locations-on-fence-id", EmployeeLocationController.getEmployeeLocationOnFenceId);
router.post("/get-employee-all-locations", EmployeeLocationController.getEmployeeAllLocations);
// router.put("/:id", BookController.bookUpdate);
// router.delete("/:id", BookController.bookDelete);
// router.get("/status", GeoController.checkUserFenseStatus);

module.exports = router;