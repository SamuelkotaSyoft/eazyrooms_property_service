import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import { matchedData } from "express-validator";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import Amenity from "../../models/amenityModel.js";
import User from "../../models/userModel.js";
import { createAmenityValidationSchema } from "../../validationSchema/amenities/createAmenityValidationSchema.js";
import findRecivers from "../../helpers/notifications/findRecivers.js";
import notify from "../../helpers/notifications/notify.js";
async function createAmenities(req, res) {
  try {
    //request payload
    const reqestData = matchedData(req);
    const uid = req.user_info.main_uid;
    const role = req.user_info.role;
    const locationId = reqestData.location;

    //validate role
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }

    //validate user
    const user = await User.findOne({ uid: uid });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, error: [{ msg: "User must be valid" }] });
    }
    const amenity = new Amenity({
      createdBy: user._id,
      updatedBy: user._id,
      ...reqestData,
      property: user.property,
      active: true,
      location: locationId,
      images: req.fileUrls,
      status: true,
    });

    await amenity.save();

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [locationId],
        role: ["locationAdmin"],
        notificationText:
          user.fullName + " has created a new amenity " + reqestData.name,
        authToken: req.headers["eazyrooms-token"],
      });
    } catch (error) {
      console.log(error);
    }

    res.status(200).json({ status: true, data: amenity });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
router.post(
  "/",
  verifyToken,
  uploadMulitpleImageToS3,
  createAmenityValidationSchema,
  validateRequest,
  createAmenities
);

export default router;
