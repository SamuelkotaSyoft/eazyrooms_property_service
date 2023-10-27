import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Location from "../../models/locationModel.js";
import User from "../../models/userModel.js";
import notify from "../../helpers/notifications/notify.js";
import updateRelatedModels from "../../helpers/updates/updateRelatedModels.js";

//new buyer
router.delete("/:locationId", verifyToken, async function (req, res) {
  //request payload
  const locationId = req.params.locationId;
  const role = req.user_info.role;
  const uid = req.user_info.main_uid;

  //validate locationId
  if (!locationId) {
    res.status(400).json({ error: [{ msg: "locationId is required" }] });
    return;
  }
  const user = await User.findOne({ uid: uid });
  if (!user) {
    res.status(400).json({ status: false, error: "Invalid userId" });
    return;
  }
  try {
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    //check if location exists
    const location = Location.findById(locationId);
    if (!location) {
      res.status(400).json({ error: [{ msg: "Invalid location" }] });
      return;
    }

    //delete location
    const writeResult = await Location.findByIdAndUpdate(
      { _id: locationId },
      { status: false, updatedBy: user._id },
      { new: true }
    );
    if (writeResult.status) {
      await updateRelatedModels(
        { location: locationId },
        { status: writeResult.status },
        "location"
      );
    }

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [writeResult._id],
        role: ["locationAdmin"],
        notificationText:
          user.fullName +
          " has deleted a new Location named " +
          writeResult.name,
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
});

export default router;
