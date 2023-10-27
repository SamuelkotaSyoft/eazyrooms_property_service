import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Block from "../../models/blockModel.js";
import User from "../../models/userModel.js";
import notify from "../../helpers/notifications/notify.js";
import mongoose from "mongoose";
import findRecivers from "../../helpers/notifications/findRecivers.js";
import updateRelatedModels from "../../helpers/updates/updateRelatedModels.js";

//new buyer
router.delete("/:blockId", verifyToken, async function (req, res) {
  //request payload
  const blockId = req.params.blockId;
  const role = req.user_info.role;
  const uid = req.user_info.main_uid;

  //validate blockId
  if (!blockId) {
    res.status(400).json({ status: false, error: "blockId is required" });
    return;
  }

  try {
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }

    //check if block exists
    const block = await Block.findById(blockId);
    if (!block) {
      res.status(400).json({ status: false, error: "Invalid block" });
      return;
    }
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res.status(400).json({ status: false, error: "Invalid userId" });
      return;
    }

    //delete block by changing status
    const writeResult = await Block.findByIdAndUpdate(
      { _id: blockId },
      { status: false, updatedBy: user._id },
      { new: true }
    );

    if (writeResult.status === false) {
      await updateRelatedModels(
        { block: blockId },
        { status: writeResult.status },
        "block"
      );
    }

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [block.location],
        role: ["locationAdmin"],
        notificationText:
          user.fullName + " has deleted a block" + writeResult.name,
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
