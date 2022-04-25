var express = require("express");
const PolygonController = require("../controllers/PolygonController");

var router = express.Router();

router.get("/", PolygonController.polygonList);
router.get("/currentLocations", PolygonController.currentLocations);
router.post("/polygonDetail", PolygonController.polygonDetail);
router.post("/", PolygonController.polygonStore);
router.post("/assign-fence", PolygonController.polygonAssign);
router.post("/update", PolygonController.polygonUpdate);
router.delete("/", PolygonController.polygonDelete);
router.get("/get-assigned-fences", PolygonController.getAssignedFences);
router.post("/get-employees-assigned-fence", PolygonController.getEmployeesAssignedFences);
// router.get("/status", GeoController.checkUserFenseStatus);

module.exports = router;