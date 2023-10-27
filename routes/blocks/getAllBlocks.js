import express from "express";
var router = express.Router();

//import middleware
import verifyToken from "../../helpers/verifyToken.js";

//import models
import Block from "../../models/blockModel.js";
import User from "../../models/userModel.js";
import { commonGetRequestValidationSchema } from "../../validationSchema/commonSchema.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import { getAllBlockValidationSchema } from "../../validationSchema/blocks/getAllBlockValidationSchema.js";
async function getAllBlocks(req, res) {
  try {
    const requestData = matchedData(req);
    var skip = 0;
    var limit = null;
    let filterObj = {
      status: true,
    };
    if (requestData.status) {
      filterObj.status = requestData.status;
    }
    if (requestData.q) {
      filterObj.name = { $regex: requestData.q, $options: "i" };
    }
    if (requestData.page && requestData.limit) {
      skip = (requestData.page - 1) * requestData.limit;
      limit = requestData.limit;
    }
    const uid = req.user_info.main_uid;
    const role = req.user_info.role;
    const location = req.params.location;
    if (location) {
      filterObj.location = location;
    }

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
    let query = Block.find(filterObj)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("location")
      .populate("property");

    //execute query
    const queryResult = await query.exec();

    const blockCount = await Block.countDocuments(filterObj).exec();

    //return result
    res.status(200).json({
      status: true,
      data: {
        blocks: queryResult,
        page: Number(requestData.page),
        limit: limit,
        totalPageCount: Math.ceil(blockCount / limit),
        totalCount: blockCount,
      },
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
}

//get all blocks

router.get(
  "/:location",
  verifyToken,
  getAllBlockValidationSchema,
  commonGetRequestValidationSchema,
  validateRequest,
  getAllBlocks
);

export default router;
