import express, { request } from "express";
var router = express.Router();

//import middleware
import verifyToken from "../../helpers/verifyToken.js";

//import models
import Room from "../../models/roomModel.js";
import User from "../../models/userModel.js";
import { matchedData } from "express-validator";
import { commonGetRequestValidationSchema } from "../../validationSchema/commonSchema.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { getAllRoomValidationSchema } from "../../validationSchema/rooms/getAllRoomsValidationSchema.js";
import mongoose from "mongoose";

//get all rooms
router.get(
  "/:locationId",
  verifyToken,
  commonGetRequestValidationSchema,
  getAllRoomValidationSchema,
  validateRequest,
  async function (req, res) {
    try {
      const uid = req.user_info.main_uid;
      const locationId = req.params.locationId;
      const role = req.user_info.role;
      const requestData = matchedData(req);

      if (role !== "propertyAdmin" && role !== "locationAdmin") {
        res.status(403).json({ status: false, error: "Unauthorized" });
        return;
      }
      let filterObj = {
        status: true,
      };
      if (requestData.status) {
        filterObj.status = requestData.status;
      }
      if (locationId) {
        filterObj.location = locationId;
      }
      if (requestData.q) {
        filterObj.name = { $regex: requestData.q, $options: "i" };
      }
      if (
        requestData.roomType !== null &&
        requestData.roomType !== undefined &&
        requestData.roomType !== ""
      ) {
        filterObj.roomType = new mongoose.Types.ObjectId(requestData.roomType);
      }
      if (req.query.floorId) {
        if (typeof req.query.floorId === "string") {
          filterObj.floor = new mongoose.Types.ObjectId(req.query.floorId);
        } else {
          filterObj.floor = {
            $in: req.query.floorId,
          };
        }
      }
      // console.log({ filterObj });
      var skip = 0;
      var limit = null;
      if (requestData.page && requestData.limit) {
        skip = (requestData.page - 1) * requestData.limit;
        limit = requestData.limit;
      }

      //get user by uid
      const user = User.find({ uid: uid });

      if (!user) {
        res.status(400).json({ status: false, message: "User not found" });
      }
      console.log({ filterObj });
      //query
      let query = Room.find(filterObj)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("location block floor roomType");

      //execute query
      const queryResult = await query.exec();

      const storeRoomsCount = await Room.countDocuments(filterObj).exec();
      //return result

      res.status(200).json({
        status: true,
        data: {
          rooms: queryResult,
          page: Number(requestData.page),
          limit: limit,
          totalPageCount: Math.ceil(storeRoomsCount / limit),
          totalCount: storeRoomsCount,
        },
      });
    } catch (err) {
      res.status(500).json({ status: false, error: err });
    }
  }
);

export default router;
