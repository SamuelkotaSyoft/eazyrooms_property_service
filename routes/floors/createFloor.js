import express from "express";
import { matchedData } from "express-validator";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();
//import models
import { v4 as uuidv4 } from "uuid";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import Floor from "../../models/floorModel.js";
import locationModel from "../../models/locationModel.js";
import propertyModel from "../../models/propertyModel.js";
import User from "../../models/userModel.js";
import { createFloorValidationSchema } from "../../validationSchema/floors/createFloorValidationSchema.js";
import notify from "../../helpers/notifications/notify.js";
const uuid = uuidv4();

//create chatbot
async function createFloor(req, res) {
  try {
    //request payload
    const uid = req.user_info.main_uid;
    const role = req.user_info.role;
    const requestData = matchedData(req);
    const locationId = requestData.location;
    const name = requestData.name;
    console.log(requestData);
    if (
      requestData.block === null ||
      requestData.block === undefined ||
      requestData.block === ""
    ) {
      delete requestData.block;
    }

    //validate role
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }

    //check if user exists
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res
        .status(400)
        .json({ status: false, error: [{ msg: "Invalid userId" }] });
      return;
    }

    //check valid property exists
    const property = await propertyModel.findOne({ _id: user.property });
    if (!property) {
      return res.status(400).json({ error: [{ msg: "Property not valid" }] });
    }

    //validate location
    const location = await locationModel.findOne({ _id: locationId });
    if (!location) {
      return res.status(400).json({ error: [{ msg: "Location not valid" }] });
    }

    const floor = new Floor({
      ...requestData,
      user: user._id,
      name: requestData.name,
      location: requestData.location,
      property: user.property,
      status: true,
      updatedBy: user._id,
      createdBy: user._id,

      // ...(requestData.block && { block: requestData.block }),
    });
    const writeResult = await floor.save();

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [requestData.location],
        role: ["locationAdmin"],
        notificationText:
          user.fullName + " has created a new Floor named " + writeResult.name,
        authToken: req.headers["eazyrooms-token"],
      });
    } catch (error) {
      console.log(error);
    }

    //save address

    //send response to client
    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
router.post(
  "/",
  verifyToken,
  createFloorValidationSchema,
  validateRequest,
  createFloor
);

export default router;
