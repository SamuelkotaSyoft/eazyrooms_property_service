import express from "express";
import { matchedData } from "express-validator";
import verifyToken from "../../helpers/verifyToken.js";
import User from "../../models/userModel.js";
var router = express.Router();

//import models
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import Amenity from "../../models/amenityModel.js";
import { updateAmenityValidationSchema } from "../../validationSchema/amenities/updateAmenityValidationSchema.js";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import findRecivers from "../../helpers/notifications/findRecivers.js";
import notify from "../../helpers/notifications/notify.js";
import mongoose from "mongoose";

async function updateAmenity(req, res) {
  //request payload
  const uid = req.user_info.main_uid;
  const requestData = matchedData(req);
  const amenityId = requestData.amenityId;
  const role = req.user_info.role;

  try {
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    //check if user exists
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res.status(400).json({ status: false, error: "Invalid userId" });
      return;
    }
    const notificationObj = {
      location: [],
    };
    if (requestData.location) {
      const amenity = await Amenity.findOne({ _id: amenityId });
      console.log(amenity.location);
      notificationObj.location.push(amenity.location);
    }
    //update user
    const writeResult = await Amenity.findByIdAndUpdate(
      { _id: amenityId },
      {
        ...requestData,
        updatedBy: user._id,
        ...(req.fileUrls?.length > 0 && { images: req.fileUrls }),
      },
      { new: true }
    );
    notificationObj.location = [
      ...notificationObj.location,
      writeResult.location,
    ];
    const propertyId = writeResult.property;

    try {
      await notify({
        userId: user._id,
        propertyId: propertyId,
        //notification obj.location is an array
        location: notificationObj.location,
        role: ["locationAdmin"],
        notificationText:
          user.fullName +
          " has updated a new amenity named " +
          writeResult.name,
        authToken: req.headers["eazyrooms-token"],
      });
    } catch (error) {
      console.log(error);
    }

    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
//new buyer
router.patch(
  "/",
  verifyToken,
  uploadMulitpleImageToS3,
  updateAmenityValidationSchema,
  validateRequest,
  updateAmenity
);

export default router;
