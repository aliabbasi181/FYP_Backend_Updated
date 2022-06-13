const Polygon = require("../models/PolygonModel");
const AssignPolygon = require("../models/AssignRegionModel");
const EmployeeModel = require("../models/EmployeeModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
const AssignRegionModel = require("../models/AssignRegionModel");
mongoose.set("useFindAndModify", false);
const EmployeeLocation = require("../models/EmployeeLocationModel");
const PolygonModel = require("../models/PolygonModel");
//require("../models/LatLng");
// polygon Schema

class LatLng{
    constructor(x,y){
        this.lat = x;
        this.lng = y;
    }
}



function PolygonData(data) {
	this.id = data._id;
	this.name= data.name;
	this.points = data.points;
	this.createdAt = data.createdAt;
}

/**
 * Book List.
 * 
 * @returns {Object}
 */
exports.polygonList = [
	auth,
	function (req, res) {
		try {
			Polygon.find({user: req.user._id}).sort({'createdAt' : -1}).then((polygon)=>{
				if(polygon.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", polygon);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Book Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.polygonDetail = [
	function (req, res) {
		try {
			console.log(req.body.id);
			Polygon.findOne({_id: req.body.id}).then((polygon)=>{                
				if(polygon !== null){
					let polygonData = new PolygonData(polygon);
					return apiResponse.successResponseWithData(res, "Operation success", polygonData);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Book store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.polygonStore = [
	auth,
	(req, res) => {
		try {
			const errors = validationResult(req);
			var polygon = new Polygon(
				{ 	name: req.body.name,
					user: req.user,
					points: req.body.points
				});
				console.log(polygon);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save book.
				polygon.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let polygonData = new PolygonData(polygon);
					return apiResponse.successResponseWithData(res,"Fence add successfuly.", polygonData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

function sleep(ms) {
	return new Promise((resolve) => {
	  setTimeout(resolve, ms);
	});
  }

  

exports.polygonAssign = [
	auth,
	(req, res) => {
		try {
			const errors = validationResult(req);
			var assignRegion = new AssignRegionModel(
				{
					employee : req.body.employee_id,
					region : req.body.region_id,
					dateFrom: req.body.date_from,
					dateTo: req.body.date_to,
					startTime: req.body.start_time,
					endTime: req.body.end_time,
					user: req.user
				}
			);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				EmployeeModel.findOne({_id: assignRegion.employee}).then((user) => {
					if(user != null){
						EmployeeModel.findOne({user: req.user}).then((data) => {
							if(data != null){
								Polygon.findOne({_id: assignRegion.region}).then((polygon) => {
									if(polygon != null){
										AssignPolygon.findOne({
											$and:[
												{
													employee: assignRegion.employee,
												},
												{
													region: assignRegion.region,
												},
												{
													dateFrom: assignRegion.dateFrom,
												},
												{
													startTime: assignRegion.startTime,
												},
												{
													endTime: assignRegion.endTime,
												},
											]
										}).then((assignedFence) =>{
											if(assignedFence == null){
												AssignPolygon.find({employee: assignRegion.employee}).then(async (fences) => {
													console.log("###############################");
													//console.log(assignRegion.employee, assignRegion.dateFrom);
													console.log(fences);
													let allow = true;
													fences.forEach(fence => {
														// dates
														var dateFrom = fence.dateFrom+"";
														var dateTo = fence.dateTo+"";
														var dateCheckFrom = req.body.date_from+"";
														var dateCheckTo = req.body.date_to+"";
														var d1 = dateFrom.split("/");
														var d2 = dateTo.split("/");
														var cF = dateCheckFrom.split("/");
														var cT = dateCheckTo.split("/");
														var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]); // -1 because months are from 0 to 11
														var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
														var checkFrom = new Date(cF[2], parseInt(cF[1]) - 1, cF[0]);
														var checkTo = new Date(cT[2], parseInt(cT[1]) - 1, cT[0]);
														console.log(from, checkFrom, to, checkTo);
														// times
														var timeFrom = "01/01/2011 " + fence.startTime + ":00";
														var timeTo = "01/01/2011 " + fence.endTime + ":00";
														var timeCheckFrom = "01/01/2011 " + req.body.start_time + ":00";
														var timeCheckTo = "01/01/2011 " + req.body.end_time + ":00";
														console.log(timeFrom, timeCheckFrom, timeTo, timeCheckTo);
														// checks
														if(checkFrom.getDate() === from.getDate() && checkTo.getDate() === to.getDate()){
															console.log("equal dates");
															if((timeCheckFrom === timeFrom && timeCheckTo === timeTo) || (Date.parse(timeCheckFrom) > Date.parse(timeFrom) && Date.parse(timeCheckTo) < Date.parse(timeTo)) || (Date.parse(timeCheckFrom) >= Date.parse(timeFrom) && Date.parse(timeCheckFrom) <= Date.parse(timeTo)) || (Date.parse(timeCheckTo) >= Date.parse(timeFrom) && Date.parse(timeCheckTo) <= Date.parse(timeTo)) || (Date.parse(timeCheckFrom) <= Date.parse(timeFrom) && Date.parse(timeCheckTo) >= Date.parse(timeTo))){
																console.log("equal or in between dates and time");
																allow = false;
																return apiResponse.successResponseWithData(res, "This date and time slot is already assigned.");
															}
														}
														else if ((checkFrom.getDate() > from.getDate() && checkTo.getDate() < to.getDate())){
															console.log("Between dates");
															if((timeCheckFrom === timeFrom && timeCheckTo === timeTo) || (Date.parse(timeCheckFrom) > Date.parse(timeFrom) && Date.parse(timeCheckTo) < Date.parse(timeTo)) || (Date.parse(timeCheckFrom) >= Date.parse(timeFrom) && Date.parse(timeCheckFrom) <= Date.parse(timeTo)) || (Date.parse(timeCheckTo) >= Date.parse(timeFrom) && Date.parse(timeCheckTo) <= Date.parse(timeTo)) || (Date.parse(timeCheckFrom) <= Date.parse(timeFrom) && Date.parse(timeCheckTo) >= Date.parse(timeTo))){
																console.log("equal or in between dates and time > <");
																allow = false;
																return apiResponse.successResponseWithData(res, "This date and time slot is already assigned.");
															}
														}
														else if ((checkFrom.getDate() >= from.getDate() && checkFrom.getDate() <= to.getDate())){
															console.log("Check from Between dates");
															if((timeCheckFrom === timeFrom && timeCheckTo === timeTo) || (Date.parse(timeCheckFrom) > Date.parse(timeFrom) && Date.parse(timeCheckTo) < Date.parse(timeTo)) || (Date.parse(timeCheckFrom) >= Date.parse(timeFrom) && Date.parse(timeCheckFrom) <= Date.parse(timeTo)) || (Date.parse(timeCheckTo) >= Date.parse(timeFrom) && Date.parse(timeCheckTo) <= Date.parse(timeTo)) || (Date.parse(timeCheckFrom) <= Date.parse(timeFrom) && Date.parse(timeCheckTo) >= Date.parse(timeTo))){
																console.log("equal or in between dates and time From <= <=");
																allow = false;
																return apiResponse.successResponseWithData(res, "This date and time slot is already assigned.");
															}
														}
														else if ((checkTo.getDate() >= from.getDate() && checkTo.getDate() <= to.getDate())){
															console.log("Check to Between dates");
															if((timeCheckFrom === timeFrom && timeCheckTo === timeTo) || (Date.parse(timeCheckFrom) > Date.parse(timeFrom) && Date.parse(timeCheckTo) < Date.parse(timeTo)) || (Date.parse(timeCheckFrom) >= Date.parse(timeFrom) && Date.parse(timeCheckFrom) <= Date.parse(timeTo)) || (Date.parse(timeCheckTo) >= Date.parse(timeFrom) && Date.parse(timeCheckTo) <= Date.parse(timeTo)) || (Date.parse(timeCheckFrom) <= Date.parse(timeFrom) && Date.parse(timeCheckTo) >= Date.parse(timeTo))){
																console.log("equal or in between dates and time To >= <=");
																allow = false;
																return apiResponse.successResponseWithData(res, "This date and time slot is already assigned.");
															}
														}
														else if ((checkFrom.getDate() <= from.getDate() && checkTo.getDate() >= to.getDate())){
															console.log("Out of dates");
															if((timeCheckFrom === timeFrom && timeCheckTo === timeTo) || (Date.parse(timeCheckFrom) > Date.parse(timeFrom) && Date.parse(timeCheckTo) < Date.parse(timeTo)) || (Date.parse(timeCheckFrom) >= Date.parse(timeFrom) && Date.parse(timeCheckFrom) <= Date.parse(timeTo)) || (Date.parse(timeCheckTo) >= Date.parse(timeFrom) && Date.parse(timeCheckTo) <= Date.parse(timeTo)) || (Date.parse(timeCheckFrom) <= Date.parse(timeFrom) && Date.parse(timeCheckTo) >= Date.parse(timeTo))){
																console.log("equal or in between dates and time <= >=");
																allow = false;
																return apiResponse.successResponseWithData(res, "This date and time slot is already assigned.");
															}
														}
													});
													sleep(1000);
													if(allow){
														assignRegion.save(
															function(err){
																if (err) { return apiResponse.ErrorResponse(res, err); }
																let assignedRegionData = new AssignRegionModel(assignRegion);
																return apiResponse.successResponseWithData(res,"Fence assigned successfuly.", assignedRegionData);
															}
														);
													}
												});
											}
											else{
												return apiResponse.successResponseWithData(res, "Same date, startTime, endTime are alredy assigned to this employee");
											}
										});
									}
									else{
										return apiResponse.successResponseWithData(res, "Fence with this id not found");
									}
								});
							}
							else{
								console.log("error");
								return apiResponse.successResponseWithData(res, "This employee does not belongs to you.");
							}
						});
					}
					else{
						return apiResponse.successResponseWithData(res, "Employee with this id not found");
					}
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

// get assigned fences

exports.getAssignedFences = [
	auth, 
	(req, res) => {
		try{
			if(req.user.role == "organization"){
				AssignPolygon.find({user: req.user._id}).then((data) => {
					if(data != null){
						return apiResponse.successResponseWithData(res, "Success", data);
					}
					else{
						return apiResponse.successResponseWithData(res, "No data");
					}
				});
			}
			else{
				AssignPolygon.find({employee: req.user._id}).then((data) => {
					if(data != null){
						return apiResponse.successResponseWithData(res, "Success", data);
					}
					else{
						return apiResponse.successResponseWithData(res, "No data");
					}
				});
			}
		}catch(ex){
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

function sleep(ms) {
	return new Promise((resolve) => {
	  setTimeout(resolve, ms);
	});
  }

  const EmployeeAssignFence = class{
	  constructor(employee, assignFence){
		  this.employee = employee;
		  this.assignFence = assignFence;
	  }
  }



exports.getEmployeesAssignedFences = [
	auth, 
	(req, res) => {
		try{
			AssignPolygon.find({region: req.body.id, user: req.user._id}).then(async (data) => {
				if(data != null){
					var empList = [];
					data.forEach((item) => {
						EmployeeModel.findOne({_id: item.employee}).then((employee) => {
							if(employee){
								empList.push(new EmployeeAssignFence(employee, item));
							}
						});
					});
					await sleep(1500)
					return apiResponse.successResponseWithData(res, "Success", empList);
				}
				else{
					return apiResponse.successResponseWithData(res, "No data");
				}
			});
		}catch(ex){
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

const UserLocationData = class {
	constructor(lat, lng, fenceId, fenceName, inFence, employeeId, employeeName){
		this.lat = lat;
		this.lng = lng;
		this.employeeId = employeeId;
		this.fenceId = fenceId;
		this.fenceName = fenceName;
		this.inFence = inFence;
		this.employeeName = employeeName
	}
};

exports.currentLocations = [
	auth,
	function (req, res) {
		try {
			var data = [];
			EmployeeLocation.find({user: req.user._id}).then((locations) => {
				locations.forEach(element => {
					var location = element.locations[(element.locations.length - 1)];
					//console.log(location)
					EmployeeModel.findOne({_id: element.employee}).then((employee) => {
						//console.log(employee)
						PolygonModel.findOne({_id: element.fence}).then((fence) => {
							console.log(true)
							data.push(new UserLocationData(
								
							))
						})
					});
				});
				console.log(data);

				return apiResponse.successResponseWithData(res, "Current locations of employees", data);
			});
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];


/**
 * Book update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.polygonUpdate = [
	auth,
	(req, res) => {
		console.log(req.body);
		try {
			const errors = validationResult(req);
			var polygon = new Polygon(
				{ 	name: req.body.name,
					user: req.user,
					points: req.body.points
				});
				console.log(polygon.points);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.body.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Polygon.findById(req.body.id, function (err, foundPolygon) {
						if(foundBook === null){
							return apiResponse.notFoundResponse(res,"Book not exists with this id");
						}else{
							console.log(req.body.id);
							//Check authorized user
							if(foundPolygon.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else{
								//update book.
								Polygon.findByIdAndUpdate(req.body.id, polygon, {},function (err) {
									if (err) { 
										return apiResponse.ErrorResponse(res, err); 
									}else{
										let polygonData = new PolygonData(polygon);
										return apiResponse.successResponseWithData(res,"Book update Success.", polygonData);
									}
								});
							}
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Book Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.polygonDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.body.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		console.log(req.body.id);
		try {
			Polygon.findById(req.body.id, function (err, foundPolygon) {
				if(foundPolygon === null){
					return apiResponse.notFoundResponse(res,"Polygon not exists with this id");
				}else{
					//Check authorized user
					if(foundPolygon.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						//delete book.
						Polygon.findByIdAndRemove(req.body.id,function (err) {
							if (err) { 
								return apiResponse.ErrorResponse(res, err); 
							}else{
								return apiResponse.successResponse(res,"Polygon delete Success.");
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];