import express from "express";
var router = express.Router();

//import middleware
import verifyToken from "../../helpers/verifyToken.js";

//import models
import RoomType from "../../models/roomTypeModel.js";
import User from "../../models/userModel.js";
import { commonGetRequestValidationSchema } from "../../validationSchema/commonSchema.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
async function getAllRoomTypes(req, res) {
  const uid = req.user_info.main_uid;
  const locationId = req.params.locationId;

  const role = req.user_info.role;
  const requestData = matchedData(req);
  var skip = 0;
  var limit = null;
  let status = true;

  if (requestData.status) {
    status = requestData.status;
  }
  if (requestData.page && requestData.limit) {
    skip = (requestData.page - 1) * requestData.limit;
    limit = requestData.limit;
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
    let query = RoomType.find({ location: locationId, status })
      .sort({ updatedAt: -1 })
      .populate("tax")
      .populate({
        path: "location",
        select: ["currency"],
      })
      .skip(skip)
      .limit(limit);

    //execute query
    const queryResult = await query.exec();
    // const findDocumentsCount = await RoomType.find({
    //   location: locationId,
    //   status,
    // });

    const roomTypeCount = await RoomType.countDocuments({
      location: locationId,
      status,
    }).exec();
    res.status(200).json({
      status: true,
      data: {
        roomTypes: queryResult,
        page: Number(requestData.page),
        limit: limit,
        totalPageCount: Math.ceil(roomTypeCount / limit),
        totalCount: roomTypeCount,
      },
    });
    //return result
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
}
//get all roomTypes
router.get(
  "/:locationId",
  verifyToken,
  commonGetRequestValidationSchema,
  validateRequest,
  getAllRoomTypes
);

export default router;
