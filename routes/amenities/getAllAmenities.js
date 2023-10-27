import express from "express";
var router = express.Router();

//import middleware
import verifyToken from "../../helpers/verifyToken.js";

//import models
import { matchedData } from "express-validator";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import Amenity from "../../models/amenityModel.js";
import { commonGetRequestValidationSchema } from "../../validationSchema/commonSchema.js";
async function getAllAmenities(req, res) {
  try {
    const locationId = req.params.locationId;
    const role = req.user_info.role;
    const requestData = matchedData(req);
    var skip = 0;
    var limit = null;
    let filterObj = {
      status: true,
    };
    if (requestData.status) {
      filterObj.status = requestData.status;
    }
    if (requestData.page && requestData.limit) {
      skip = (requestData.page - 1) * requestData.limit;
      limit = requestData.limit;
    }
    if (locationId) {
      filterObj.location = locationId;
    }
    if (requestData.q) {
      filterObj.name = { $regex: requestData.q, $options: "i" };
    }
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    //query
    let query = Amenity.find(filterObj)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("location")
      .populate("property");
    const queryResult = await query.exec();
    const amenityCount = await Amenity.countDocuments(filterObj).exec();
    res.status(200).json({
      status: true,
      data: {
        amenities: queryResult,
        page: Number(requestData.page),
        limit: limit,
        totalPageCount: Math.ceil(amenityCount / limit),
        totalCount: amenityCount,
      },
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
}
//get all amenities
router.get(
  "/:locationId",
  verifyToken,
  commonGetRequestValidationSchema,
  validateRequest,
  getAllAmenities
);

export default router;
