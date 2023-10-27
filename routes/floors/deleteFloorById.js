import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Floor from "../../models/floorModel.js";
import User from "../../models/userModel.js";
import notify from "../../helpers/notifications/notify.js";
import updateRelatedModels from "../../helpers/updates/updateRelatedModels.js";

//new buyer
router.delete("/:floorId", verifyToken, async function (req, res) {
  //request payload
  const floorId = req.params.floorId;
  const role = req.user_info.role;
  const uid = req.user_info.main_uid;

  //validate floorId
  if (!floorId) {
    res.status(400).json({ status: false, error: "floorId is required" });
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
    //check if floor exists
    const floor = Floor.findById(floorId);
    if (!floor) {
      res.status(400).json({ status: false, error: "Invalid floor" });
      return;
    }

    //delete floor
    // const writeResult = await Floor.deleteOne({ _id: floorId });
    const writeResult = await Floor.findByIdAndUpdate(
      {
        _id: floorId,
      },
      { status: false, updatedBy: user._id },
      { new: true }
    );
    if (writeResult.status === false)
      await updateRelatedModels(
        { floor: floorId },
        { status: writeResult.status },
        "floor"
      );
    await notify({
      userId: user._id,
      propertyId: user.property,
      location: [writeResult.location],
      role: ["locationAdmin"],
      notificationText:
        user.fullName + " has deleted a new Floor named " + writeResult.name,
      authToken: req.headers["eazyrooms-token"],
    });
    //send response to client
    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

export default router;
