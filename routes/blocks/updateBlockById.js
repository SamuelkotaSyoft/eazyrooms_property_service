import express from "express";
import { matchedData } from "express-validator";
import verifyToken from "../../helpers/verifyToken.js";
import User from "../../models/userModel.js";
var router = express.Router();

//import models
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import Block from "../../models/blockModel.js";
import { updateBlockValidationSchema } from "../../validationSchema/blocks/updateBlockValidationSchema.js";
import mongoose from "mongoose";
import notify from "../../helpers/notifications/notify.js";
import findRecivers from "../../helpers/notifications/findRecivers.js";
import updateRelatedModels from "../../helpers/updates/updateRelatedModels.js";

//new buyer
async function updateBlock(req, res) {
  //request payload
  const requestData = matchedData(req);
  const uid = req.user_info.main_uid;
  const role = req.user_info.role;

  //validate userId
  if (!uid) {
    res.status(400).json({ status: false, error: "userId is required" });
    return;
  }

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
    // writeResult
    const writeResult = await Block.findByIdAndUpdate(
      {
        _id: requestData.blockId,
      },
      { ...requestData, updatedBy: user._id },
      { new: true }
    );
    if (writeResult.status === false || writeResult.active === false) {
      await updateRelatedModels(
        { block: requestData.blockId },
        { status: writeResult.status, active: writeResult.active },
        "block"
      );
    }
    await notify({
      userId: user._id,
      propertyId: user.property,
      location: [writeResult.location],
      role: ["locationAdmin"],
      notificationText:
        user.fullName + " has updated a block" + writeResult.name,
      authToken: req.headers["eazyrooms-token"],
    });
    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
router.patch(
  "/",
  verifyToken,
  updateBlockValidationSchema,
  validateRequest,
  updateBlock
);

export default router;
