import express from "express";
var router = express.Router();

//import middleware
import verifyToken from "../../helpers/verifyToken.js";

//import models
import { matchedData } from "express-validator";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import Location from "../../models/locationModel.js";
import User from "../../models/userModel.js";
import { commonGetRequestValidationSchema } from "../../validationSchema/commonSchema.js";

//get all locations
router.get(
  "/",
  verifyToken,
  commonGetRequestValidationSchema,
  validateRequest,
  async function (req, res) {
    const uid = req.user_info.main_uid;
    const role = req.user_info.role;
    const requestData = matchedData(req);
    //pagination steps
    var skip = 0;
    var limit = null;
    let filterObj = { status: true };
    if (requestData.page && requestData.limit) {
      skip = (requestData.page - 1) * requestData.limit;
      limit = requestData.limit;
    }
    //check for status from req
    if (requestData.status) {
      filterObj.status = requestData.status;
    }
    if (requestData.q) {
      filterObj.name = { $regex: requestData.q, $options: "i" };
    }
    try {
      if (role !== "propertyAdmin" && role !== "locationAdmin") {
        res.status(403).json({ status: false, error: "Unauthorized" });
        return;
      }
      //get user by uid
      const user = await User.findOne({ uid: uid });
      filterObj.property = user.property;

      if (!user) {
        res.status(400).json({ error: [{ msg: "User not found" }] });
      }

      //query
      let query = Location.find(filterObj)
        .skip(skip)
        .limit(limit)
        .populate("property");
      const queryResult = await query.exec();
      const LocationCount = await Location.countDocuments(filterObj).exec();

      //execute query

      //return result
      res.status(200).json({
        status: true,
        data: {
          locations: queryResult,
          page: Number(requestData.page),
          limit: limit,
          totalPageCount: Math.ceil(LocationCount / limit),
          totalCount: LocationCount,
        },
      });
    } catch (err) {
      res.status(500).json({ status: false, error: err });
    }
  }
);

export default router;
