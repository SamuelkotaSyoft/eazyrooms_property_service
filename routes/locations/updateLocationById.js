import express from "express";
import { matchedData } from "express-validator";
import verifyToken from "../../helpers/verifyToken.js";
import User from "../../models/userModel.js";
var router = express.Router();
//import validation schemas

//import models
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import Location from "../../models/locationModel.js";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import { updateLocationValidationSchema } from "../../validationSchema/locations/updateLocationValidationSchema.js";
import notify from "../../helpers/notifications/notify.js";
import updateRelatedModels from "../../helpers/updates/updateRelatedModels.js";

async function updateLocation(req, res) {
  //request payload
  const requestData = matchedData(req);
  if (requestData.website === "null") {
    requestData.website = "";
  }

  const locationId = requestData.locationId;
  const role = req.user_info.role;
  try {
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }

    //check if user exists
    const uid = req.user_info.main_uid;
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res.status(400).json({ status: false, error: "Invalid userId" });
      return;
    }

    //update Location
    const writeResult = await Location.findByIdAndUpdate(
      { _id: locationId },
      { ...requestData, updatedBy: user._id, $push: { images: req.fileUrls } },
      { new: true }
    );
    if (writeResult.status === false || writeResult.active === false) {
      await updateRelatedModels(
        { location: locationId },
        { status: writeResult.status, active: writeResult.active },
        "location"
      );
    }

    await notify({
      userId: user._id,
      propertyId: user.property,
      location: [writeResult._id],
      role: ["locationAdmin"],
      notificationText:
        user.fullName + " has updated a new Location named " + writeResult.name,
      authToken: req.headers["eazyrooms-token"],
    });
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
  updateLocationValidationSchema,
  validateRequest,
  updateLocation
);

export default router;
