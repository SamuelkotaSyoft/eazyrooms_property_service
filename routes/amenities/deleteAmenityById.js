import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Amenity from "../../models/amenityModel.js";
import User from "../../models/userModel.js";
import findRecivers from "../../helpers/notifications/findRecivers.js";
import notify from "../../helpers/notifications/notify.js";

//new buyer
router.delete("/:amenityId", verifyToken, async function (req, res) {
  //request payload
  const amenityId = req.params.amenityId;
  const role = req.user_info.role;
  const uid = req.user_info.main_uid;

  //validate amenityId
  if (!amenityId) {
    res.status(400).json({ status: false, error: "amenityId is required" });
    return;
  }

  try {
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res.status(400).json({ status: false, error: "Invalid userId" });
      return;
    }
    //check if amenity exists
    const amenity = Amenity.findById(amenityId);
    if (!amenity) {
      res.status(400).json({ status: false, error: "Invalid amenity" });
      return;
    }

    //delete amenity
    const writeResult = await Amenity.findByIdAndUpdate(
      { _id: amenityId, updatedBy: user._id },
      { status: false },
      { new: true }
    );

    await notify({
      userId: user._id,
      propertyId: writeResult.property,
      location: [writeResult.location],
      role: ["locationAdmin"],
      notificationText:
        user.fullName + " has deleted a new amenity named " + writeResult.name,
      authToken: req.headers["eazyrooms-token"],
    });
    //send response to client
    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

export default router;
