import express from "express";
import { matchedData } from "express-validator";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();
//import models
import notify from "../../helpers/notifications/notify.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import Block from "../../models/blockModel.js";
import User from "../../models/userModel.js";
import { createBlockValidationSchema } from "../../validationSchema/blocks/createBlockValidationSchema.js";
import mongoose from "mongoose";
import findRecivers from "../../helpers/notifications/findRecivers.js";

//create chatbot
async function createBlock(req, res) {
  try {
    const uid = req.user_info.main_uid;
    const role = req.user_info.role;
    const requestData = matchedData(req);

    //validate role
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: [{ err: "Unauthorized" }] });
      return;
    }
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res
        .status(400)
        .json({ status: false, error: [{ msg: "Invalid userId" }] });
      return;
    }

    //add address
    const block = new Block({
      user: user._id,
      status: true,
      active: true,
      name: requestData.name,
      location: requestData.location,
      property: user.property,
      createdBy: user._id,
      updatedBy: user._id,
    });

    //save address
    const writeResult = await block.save();

    /**
     *
     *
     * notification
     */

    //get all users of property who has role === locationAdmin

    await notify({
      userId: user._id,
      propertyId: user.property,
      location: [requestData.location],
      role: ["locationAdmin"],
      notificationText: user.fullName + " has created a new block" + block.name,
      authToken: req.headers["eazyrooms-token"],
    });

    //send response to client
    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
//router
router.post(
  "/",
  verifyToken,
  createBlockValidationSchema,
  validateRequest,
  createBlock
);

export default router;
