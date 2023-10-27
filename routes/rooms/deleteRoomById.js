import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Room from "../../models/roomModel.js";
import userModel from "../../models/userModel.js";
import notify from "../../helpers/notifications/notify.js";
import updateRelatedModels from "../../helpers/updates/updateRelatedModels.js";

//new buyer
router.delete("/:roomId", verifyToken, async function (req, res) {
  //request payload
  const roomId = req.params.roomId;
  const uid = req.user_info.main_uid;
  const role = req.user_info.role;
  const user = await userModel.findOne({ uid: uid });
  //validate roomId
  if (!roomId) {
    res.status(400).json({ status: false, error: "roomId is required" });
    return;
  }

  try {
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    //check if room exists
    const room = Room.findById(roomId);
    if (!room) {
      res.status(400).json({ status: false, error: "Invalid room" });
      return;
    }

    //delete room
    const writeResult = await Room.findByIdAndUpdate(
      { _id: roomId },
      { status: false }
    );
    if (writeResult.status === false) {
      await updateRelatedModels(
        { room: roomId },
        { status: writeResult.status },
        "room"
      );
    }
    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [writeResult.location],
        role: ["locationAdmin"],
        notificationText:
          user.fullName + " has deleted a new Room named " + writeResult.name,
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
