import express from "express";
var router = express.Router();

//import middleware
import verifyToken from "../../helpers/verifyToken.js";

//import models
import { matchedData } from "express-validator";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import Floor from "../../models/floorModel.js";
import User from "../../models/userModel.js";
import { commonGetRequestValidationSchema } from "../../validationSchema/commonSchema.js";
import mongoose from "mongoose";
async function getAllFloors(req, res) {
  const uid = req.user_info.main_uid;
  const role = req.user_info.role;
  const requestData = matchedData(req);
  var skip = 0;
  var limit = null;

  let filterObj = {
    status: true,
  };
  const location = req.params.location;
  const blockId = req.query.blockId;
  if (blockId) {
    if (typeof blockId === "string") {
      filterObj.block = new mongoose.Types.ObjectId(blockId);
    } else {
      filterObj.block = {
        $in: blockId,
      };
    }
  }
  if (requestData.status) {
    filterObj.status = requestData.status;
  }
  if (location) {
    filterObj.location = location;
  }
  if (requestData.page && requestData.limit) {
    skip = (requestData.page - 1) * requestData.limit;
    limit = requestData.limit;
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
    const user = User.find({ uid: uid });

    if (!user) {
      res.status(400).json({ status: false, message: "User not found" });
    }

    //query
    let query = Floor.find(filterObj)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("block location");

    //execute query
    const queryResult = await query.exec();

    // const findDocumentsCount = await Floor.find({ status });
    const floorCount = await Floor.countDocuments(filterObj).exec();

    //return result
    res.status(200).json({
      status: true,
      data: {
        floors: queryResult,
        page: Number(requestData.page),
        limit: limit,
        totalPageCount: Math.ceil(floorCount / limit),
        totalCount: floorCount,
      },
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
}
//get all floors
router.get(
  "/:location",
  verifyToken,
  commonGetRequestValidationSchema,
  validateRequest,
  getAllFloors
);

export default router;
