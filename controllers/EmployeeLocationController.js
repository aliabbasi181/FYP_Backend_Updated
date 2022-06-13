const EmployeeLocation = require("../models/EmployeeLocationModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const AssignPolygon = require("../models/AssignRegionModel");
const FenceModel = require("../models/PolygonModel");
const Polygon = require("../models/PolygonModel");
const EmployeeModel = require("../models/EmployeeModel");

const LatLng = class {
	constructor(lat, lng, time, inFence){
		this.lat = lat;
		this.lng = lng;
    this.time = time;
		this.inFence = inFence;
	}
};

const UserLocationData = class {
	constructor(lat, lng, fenceId, inFence, date, employeeId){
		this.lat = lat;
		this.lng = lng;
    this.fenceId = fenceId;
    this.inFence = inFence;
    this.date = date;
		this.employeeId = employeeId;
	}
};

class FenceHistory{
  constructor(location, employee){
    this.locations = location;
    this.employee = employee;
  }
}


// fence history

exports.getFenceHistory = [
  (req, res) => {
    try{
      var data = [];
      EmployeeLocation.find({fence: req.body.id}).then((locations) => {
        if(locations.length !== 0){
          return apiResponse.successResponseWithData(res,"locations get Success.", locations);
        }
        else{
          return apiResponse.successResponseWithData(res,"no locations found", data);
        }
      });
    }catch(err){
    }
  }
];

exports.getAllEmployeesLastLocation = [
  auth,
  (req, res) => {
    try{
      var data = [];
      console.log(req.body.date);
      EmployeeLocation.find({user: req.user._id, date: req.body.date}).then((locations) => {
        if(locations.length !== 0){
          locations.forEach(element => {
            data.push(
              new UserLocationData(element.locations[element.locations.length-1].lat, element.locations[element.locations.length-1].lng, element.fence, element.locations[element.locations.length-1].inFence, element.date, element.employee)
            );
          });
          console.log(data);
          return apiResponse.successResponseWithData(res,"locations get Success.", data);
        }
        else{
          return apiResponse.successResponseWithData(res,"no locations found", data);
        }
      });
    }catch(err){
    }
  }
];

exports.getEmployeeLocationOnDate = [
  (req, res) => {
    try{
      EmployeeLocation.find({employee: req.body.employee, date: req.body.date}).then((locations) => {
        if(locations.length !== 0){
          return apiResponse.successResponseWithData(res,"locations get Success.", locations);
        }
        else{
          return apiResponse.successResponseWithData(res,"No locations found", locations);
        }
      
    });
    }catch(err){
    }
  }
];

class LocationHistoryData{
  constructor(location, fence){
    this.location = location;
    this.fence = fence;
  }
}


exports.getEmployeeLocationOnTwoDate = [
  (req, res) => {
    try{
      console.log(req.body.employee);
      EmployeeLocation.find({employee: req.body.employee}).then(async (locations) => {
        var selectedLocations = [];
        if(locations.length !== 0){
          locations.forEach(async (location) => {
            var d1 = req.body.from_date.split("/");
            var d2 = req.body.to_date.split("/");
            var c = location.date.split("/");
            var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]); // -1 because months are from 0 to 11
            //console.log(from);
            var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
            var check = new Date(c[2], parseInt(c[1]) - 1, c[0]);
            console.log(from.getDate(), to.getDate(), check.getDate());
            if (check > from && check < to) {
              console.log("Between");
              var polygonData;
              Polygon.findOne({_id: location.fence}).then((polygon)=>{                
                if(polygon !== null){
                  polygonData = polygon;
                }else{
                }
              });
              await sleep(100);
              let data = new LocationHistoryData(location, polygonData);
              //console.log(data);
              selectedLocations.push(data);
              
            } else if (
              from.getDate() === check.getDate() ||
              to.getDate() === check.getDate()
            ) {
              console.log("Equals");
              var polygonData;
              Polygon.findOne({_id: location.fence}).then((polygon)=>{                
                if(polygon !== null){
                  polygonData = polygon;
                }else{
                }
              });
              await sleep(100);
              let data = new LocationHistoryData(location, polygonData);
              //console.log(data);
              selectedLocations.push(data);
            } else {
              console.log("Out of range");
            }
            console.log("###################################################");
          });
          await sleep(1000);
          console.log(selectedLocations);
          return apiResponse.successResponseWithData(res,"locations get Success.", selectedLocations);
        }
        else{
          return apiResponse.successResponseWithData(res,"No locations found", locations);
        }
      
    });
    }catch(err){
    }
  }
];

exports.getEmployeeLocationOnTimeRange = [
  (req, res) => {
    try{
      EmployeeLocation.findOne({employee: req.body.employee, date: req.body.date}).then(async (location) => {
        var selectedLocations = [];
        if(location){
            var timeFrom = "01/01/2011 " + req.body.time_from + ":00";
            var timeTo = "01/01/2011 " + req.body.time_to + ":00";
            location.locations.forEach((loc) => {
              var check = "01/01/2011 " + loc.time + ":00";
              if (
                Date.parse(check) > Date.parse(timeFrom) &&
                Date.parse(check) < Date.parse(timeTo)
              ) {
                selectedLocations.push(loc);
              } else if (
                Date.parse(check) === Date.parse(timeFrom) ||
                Date.parse(check) === Date.parse(timeTo)
              ) {
                selectedLocations.push(loc);
              } else {
              }
              //console.log(Date.parse(timeFrom), Date.parse(timeTo), Date.parse(check));
            });
          location.locations = selectedLocations;
          var polygonData;
          Polygon.findOne({_id: location.fence}).then((polygon)=>{                
            if(polygon !== null){
              polygonData = polygon;
            }else{
            }
          });
          await sleep(100);
          let data = new LocationHistoryData(location, polygonData);
          return apiResponse.successResponseWithData(res,"locations get Success.", data);
        }
        else{
          return apiResponse.successResponseWithData(res,"No locations found", locations);
        }
      
    });
    }catch(err){
    }
  }
];

exports.getEmployeeLocationOnFenceId = [
  (req, res) => {
    try{
      EmployeeLocation.find({fence: req.body.id, date: req.body.date}).then(async (locations) => {
        return apiResponse.successResponseWithData(res,"locations get Success.", locations);
      
    });
    }catch(err){
    }
  }
];
exports.getEmployeeAllLocations = [
  (req, res) => {
    try{
      EmployeeLocation.find({employee: req.body.id}).then(async (locations) => {
        return apiResponse.successResponseWithData(res,"locations get Success.", locations);
    });
    }catch(err){
    }
  }
];

exports.getEmployeeLocationOnDateAndTimeRange = [
  (req, res) => {
    try{
      EmployeeLocation.find({employee: req.body.employee}).then((locations) => {
        var selectedLocations = [];
        if(locations.length !== 0){
          var dateValid = false;
          locations.forEach((location) => {
            var d1 = req.body.from_date.split("/");
            var d2 = req.body.to_date.split("/");
            var c = location.date.split("/");
            var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]);
            var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
            var check = new Date(c[2], parseInt(c[1]) - 1, c[0]);
            
            if (check > from && check < to) {
              dateValid = true;
            } else if (
              from.getDate() === check.getDate() ||
              to.getDate() === check.getDate()
            ) {
              dateValid = true;
            } else {
              dateValid = false;
            }
            console.log(dateValid);
            if(dateValid){
              var tempLocation = [];
              var timeFrom = "01/01/2011 " + req.body.time_from + ":00";
              var timeTo = "01/01/2011 " + req.body.time_to + ":00";
              location.locations.forEach((loc) => {
              var check = "01/01/2011 " + loc.time + ":00";
              if (
                Date.parse(check) > Date.parse(timeFrom) &&
                Date.parse(check) < Date.parse(timeTo)
              ) {
                tempLocation.push(loc);
              } else if (
                Date.parse(check) === Date.parse(timeFrom) ||
                Date.parse(check) === Date.parse(timeTo)
              ) {
                tempLocation.push(loc);
              } else {
              }
            });
            location.locations = tempLocation;
            selectedLocations.push(location);
            }
          });
          return apiResponse.successResponseWithData(res,"locations get Success.", selectedLocations);
        }
        else{
          return apiResponse.successResponseWithData(res,"No locations found", locations);
        }
      
    });
    }catch(err){
    }
  }
];

exports.getEmployeeLastLocation = [
  (req, res) => {
    try{
      let date_ob = new Date();
      var dateInString = date_ob.getDate()+"/"+(date_ob.getMonth()+1)+"/"+date_ob.getFullYear();
      EmployeeLocation.find({employee: req.body.employee, date: dateInString}).then((locations) => {
        if(locations.length !== 0){
          
          return apiResponse.successResponseWithData(res,"locations get Success.", locations);
        }
        else{
          return apiResponse.successResponseWithData(res,"no locations found", locations);
        }
      
    });
    }catch(err){
    }
  }
];

function sleep(ms) {
	return new Promise((resolve) => {
	  setTimeout(resolve, ms);
	});
  }

exports.getEmployeeById = [
  (req, res) => {
    try{
      EmployeeModel.findById({_id: req.body.id}).then((employee) => {
        if(employee){
          return apiResponse.successResponseWithData(res,"employee get Success.", employee);
        }
      });
    }catch(err){}
  }
];

exports.addUserLocation = [
  auth,
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        var datesMatched = false;
        var timeMatched = false;
        AssignPolygon.find({ employee: req.user._id }, "").then(
         (assignFences) => {
			  //console.log(assignFences)
            if (assignFences.length > 0) {
              assignFences.forEach((assignFence) => {
                var dateFrom = assignFence.dateFrom;
                var dateTo = assignFence.dateTo;
                var dateCheck = req.body.date;
                var d1 = dateFrom.split("/");
                var d2 = dateTo.split("/");
                var c = dateCheck.split("/");
                var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]); // -1 because months are from 0 to 11
                var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
                var check = new Date(c[2], parseInt(c[1]) - 1, c[0]);
                if (check > from && check < to) {
                  datesMatched = true;
                } else if (
                  from.getDate() === check.getDate() ||
                  to.getDate() === check.getDate()
                ) {
                  datesMatched = true;
                } else {
                  datesMatched = false;
                }
                if (datesMatched) {
                  var timeFrom = "01/01/2011 " + assignFence.startTime + ":00";
                  var timeTo = "01/01/2011 " + assignFence.endTime + ":00";
                  var timeCheck = "01/01/2011 " + req.body.time + ":00";
                  if (
                    Date.parse(timeCheck) > Date.parse(timeFrom) &&
                    Date.parse(timeCheck) < Date.parse(timeTo)
                  ) {
                    timeMatched = true;
                  } else if (
                    Date.parse(timeCheck) === Date.parse(timeFrom) ||
                    Date.parse(timeCheck) === Date.parse(timeTo)
                  ) {
                    timeMatched = true;
                  } else {
                    timeMatched = false;
                  }
                  if (timeMatched) {
					  var polygon = [];
					FenceModel.findById(assignFence.region, function (err, fence) {
						if(fence){
							fence.points.forEach((point)=> {
								polygon.push(new Point(parseFloat(point.lat),parseFloat(point.lng)));
							});
             //console.log(polygon);
						}
					});
          
                    EmployeeLocation.find({
                      date: req.body.date,
					  assignFenceId: assignFence._id
                    }).then(async (locations) => {
                      if (locations.length > 0) {
						var oldLocations = [];
						locations[0]['locations'].forEach((loc) => {
							oldLocations.push(new LatLng(loc['lat'], loc['lng'], loc['time'], loc['inFence']))
						});
            await sleep(500);
            console.log("Fetched Polygon: ",polygon);
          var isInFence = isUserInFence(req.body.lat, req.body.lng, polygon);
						oldLocations.push(new LatLng(req.body.lat, req.body.lng, req.body.time, isInFence));
						var employeeLocation = new EmployeeLocation({
							employee: req.user._id,
							fence: assignFence.region,
							assignFenceId: assignFence._id,
							date: req.body.date,
							locations: oldLocations,
						  });
                        EmployeeLocation.findByIdAndUpdate(locations[0]['_id'], {'locations': oldLocations}, {},function (err) {
							if (err) { 
								return apiResponse.ErrorResponse(res, err); 
							}else{
								return apiResponse.successResponseWithData(res,"location added Success.", employeeLocation);
							}
						});
                      } else {
						var userLocation = [];
            console.log("Fetched Polygon: ",polygon);
          var isInFence = isUserInFence(req.body.lat, req.body.lng, polygon);
						userLocation.push(new LatLng(req.body.lat, req.body.lng, req.body.time, isInFence));
                        var employeeLocation = new EmployeeLocation({
                          employee: req.user._id,
                          fence: assignFence.region,
						              assignFenceId: assignFence._id,
                          date: req.body.date,
                          user: assignFence.user,
                          locations: userLocation,
                        });
                        console.log(employeeLocation);
                        employeeLocation.save(function (err) {
							if (err) { return apiResponse.ErrorResponse(res, err); }
							return apiResponse.successResponseWithData(res,"location added Success.", employeeLocation);
						});
                      }
                    });
                  }
				  else{
					return apiResponse.successResponseWithData(res, "you are not allowed to save location at this time in this fence");
				  }
                }
              });
				//return apiResponse.ErrorResponse(res, "No assigned fence to you at this date and time");
			  
            } else {
				return apiResponse.successResponseWithData(res, "No assigned fence to you");
            }
          }
        );
        // polygon.save(function (err) {
        // 	if (err) { return apiResponse.ErrorResponse(res, err); }
        // 	let polygonData = new PolygonData(polygon);
        // 	return apiResponse.successResponseWithData(res,"Fence add successfuly.", polygonData);
        // });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];



function isUserInFence(x, y, fence){
	x = parseFloat(x);
	y = parseFloat(y);
	let n = fence.length;
    let p = new Point(x, y);
	if(isInside(fence, n, p)){
		return true;
	}
	else{
		return false;
	}
	
}


class Point
{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
    }
}


  
// Given three collinear points p, q, r,
    // the function checks if point q lies
    // on line segment 'pr'
function onSegment(p,q,r)
{
     if (q.x <= Math.max(p.x, r.x) &&
            q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) &&
            q.y >= Math.min(p.y, r.y))
        {
            return true;
        }
        return false;
}
  
// To find orientation of ordered triplet (p, q, r).
    // The function returns following values
    // 0 --> p, q and r are collinear
    // 1 --> Clockwise
    // 2 --> Counterclockwise
function orientation(p,q,r)
{
    let val = (q.y - p.y) * (r.x - q.x)
                - (q.x - p.x) * (r.y - q.y);
   
        if (val == 0)
        {
            return 0; // collinear
        }
        return (val > 0) ? 1 : 2; // clock or counterclock wise
}
  
// The function that returns true if
    // line segment 'p1q1' and 'p2q2' intersect.
function  doIntersect(p1,q1,p2,q2)
{
    // Find the four orientations needed for
        // general and special cases
        let o1 = orientation(p1, q1, p2);
        let o2 = orientation(p1, q1, q2);
        let o3 = orientation(p2, q2, p1);
        let o4 = orientation(p2, q2, q1);
   
        // General case
        if (o1 != o2 && o3 != o4)
        {
            return true;
        }
   
        // Special Cases
        // p1, q1 and p2 are collinear and
        // p2 lies on segment p1q1
        if (o1 == 0 && onSegment(p1, p2, q1))
        {
            return true;
        }
   
        // p1, q1 and p2 are collinear and
        // q2 lies on segment p1q1
        if (o2 == 0 && onSegment(p1, q2, q1))
        {
            return true;
        }
   
        // p2, q2 and p1 are collinear and
        // p1 lies on segment p2q2
        if (o3 == 0 && onSegment(p2, p1, q2))
        {
            return true;
        }
   
        // p2, q2 and q1 are collinear and
        // q1 lies on segment p2q2
        if (o4 == 0 && onSegment(p2, q1, q2))
        {
            return true;
        }
   
        // Doesn't fall in any of the above cases
        return false;
}
  
// Returns true if the point p lies
    // inside the polygon[] with n vertices
function  isInside(polygon,n,p)
{
    // There must be at least 3 vertices in polygon[]
        if (n < 3)
        {
            return false;
        }
        // Create a point for line segment from p to infinite
        let extreme = new Point(10000, p.y);
        // Count intersections of the above line
        // with sides of polygon
        let count = 0, i = 0;
        do
        {
            let next = (i + 1) % n;
            // Check if the line segment from 'p' to
            // 'extreme' intersects with the line
            // segment from 'polygon[i]' to 'polygon[next]'
            if (doIntersect(polygon[i], polygon[next], p, extreme))
            {
                // If the point 'p' is colinear with line
                // segment 'i-next', then check if it lies
                // on segment. If it lies, return true, otherwise false
                if (orientation(polygon[i], p, polygon[next]) == 0)
                {
                    return onSegment(polygon[i], p,
                                    polygon[next]);
                }
   
                count++;
            }
            i = next;
        } while (i != 0);
   
        // Return true if count is odd, false otherwise
        return (count % 2 == 1); // Same as (count%2 == 1)
}
let polygon = [new Point(51.4926437585727,-0.09932693656067305),
	new Point(51.48986482072766,-0.0993841561465425),
	new Point(51.48583862258527,-0.09640869315246993),
	new Point(51.47593195168967,-0.0962370317755168),
	new Point(51.482025878759956,-0.1105993652343651),
    new Point(51.492715011705485,-0.0996702593145793),
];