import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import RoomType from "../../models/roomTypeModel.js";
import notify from "../../helpers/notifications/notify.js";
import userModel from "../../models/userModel.js";
import updateRelatedModels from "../../helpers/updates/updateRelatedModels.js";

//new buyer
router.delete("/:roomTypeId", verifyToken, async function (req, res) {
  //request payload
  const roomTypeId = req.params.roomTypeId;

  const role = req.user_info.role;
  const uid = req.user_info.main_uid;
  const user = await userModel.findOne({ uid: uid });

  //validate roomTypeId
  if (!roomTypeId) {
    res.status(400).json({ status: false, error: "roomTypeId is required" });
    return;
  }

  try {
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    //check if roomType exists
    const roomType = RoomType.findById(roomTypeId);
    if (!roomType) {
      res.status(400).json({ status: false, error: "Invalid roomType" });
      return;
    }

    //delete roomType
    const writeResult = await RoomType.findByIdAndUpdate(
      { _id: roomTypeId },
      { status: false },
      { new: true }
    );
    if (writeResult.status === false) {
      await updateRelatedModels(
        { roomType: roomTypeId },
        { status: writeResult.status, active: writeResult.active },
        "roomType"
      );
    }
    await notify({
      userId: user._id,
      propertyId: user.property,
      location: [writeResult.location],
      role: ["locationAdmin"],
      notificationText:
        user.fullName + " has deleted a new Room named " + writeResult.name,
      authToken: req.headers["eazyrooms-token"],
    });
    //send response to client
    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

export default router;
