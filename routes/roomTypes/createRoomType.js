import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();
//import models
import { matchedData } from "express-validator";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import Location from "../../models/locationModel.js";
import Property from "../../models/propertyModel.js";
import RoomType from "../../models/roomTypeModel.js";
import User from "../../models/userModel.js";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import { createRoomTypeValidationSchema } from "../../validationSchema/roomTypes/createRoomTypeValidationSchema.js";
import notify from "../../helpers/notifications/notify.js";
import { calculateFinalPrice } from "../../helpers/calcuateFinalPrice.js";
async function createRoomType(req, res) {
  try {
    //request payload
    const uid = req.user_info.main_uid;
    const role = req.user_info.role;
    const requestData = matchedData(req);
    const locationId = requestData.location;

    //validate role
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }

    //validate user
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res.status(400).json({ status: false, error: "Invalid userId" });
      return;
    }

    //validate property
    const property = await Property.findOne({
      _id: user.property,
      status: true,
    });

    if (!property) {
      res
        .status(400)
        .json({ status: false, error: [{ msg: "Property not valid" }] });
      return;
    }

    //validate location
    const location = await Location.findOne({
      _id: locationId,
    });
    if (!location) {
      res
        .status(400)
        .json({ status: false, error: [{ msg: "Location not valid" }] });
      return;
    }

    //add room type
    const finalPrice = await calculateFinalPrice(requestData);
    if (finalPrice < 0) {
      res.status(400).json({
        status: false,
        error: [{ msg: "finalPrice is less than 0" }],
      });
    }
    const roomType = new RoomType({
      ...requestData,
      property: user.property,
      createdBy: user._id,
      updatedBy: user._id,
      status: true,
      active: true,
      images: req.fileUrls,
      finalPrice,
    });

    //save room type
    const writeResult = await roomType.save();

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [writeResult.location],
        role: ["locationAdmin"],
        notificationText:
          user.fullName + " has created a new Room named " + writeResult.name,
        authToken: req.headers["eazyrooms-token"],
      });
    } catch (error) {
      console.log(error);
    }

    //send response to client
    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
//create chatbot
router.post(
  "/",
  verifyToken,
  uploadMulitpleImageToS3,
  createRoomTypeValidationSchema,
  validateRequest,
  createRoomType
);

export default router;
