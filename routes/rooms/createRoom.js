import express from "express";
var router = express.Router();
//validators
import { matchedData } from "express-validator";
import verifyToken from "../../helpers/verifyToken.js";
//import models
import { generateQrcode } from "../../helpers/generateQrcode.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import Location from "../../models/locationModel.js";
import Property from "../../models/propertyModel.js";
import Room from "../../models/roomModel.js";
import User from "../../models/userModel.js";
import { createRoomValidationSchema } from "../../validationSchema/rooms/createRoomValidationSchema.js";
import notify from "../../helpers/notifications/notify.js";
async function createRoom(req, res) {
  try {
    //request payload
    const uid = req.user_info.main_uid;
    const requestData = matchedData(req);
    const locationId = requestData.location;
    const role = req.user_info.role;
    //generate qr code
    let qrCodeLink = await generateQrcode(
      `${process.env.GUEST_APP_URL}?location=${requestData.location}&roomType=${requestData.roomType}&floor=${requestData.floor}&block=${requestData.block}&roomNumber=${requestData.name}`
    );

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

    //validate location
    const location = await Location.findOne({ _id: locationId });
    if (!location) {
      res.status(400).json({ status: false, error: "Invalid locationId" });
      return;
    }

    //validate property
    const property = await Property.findOne({ _id: user.property });
    if (!property) {
      res.status(400).json({ status: false, error: "Invalid propertyId" });
      return;
    }

    if (
      requestData.floor === null ||
      requestData.floor === undefined ||
      requestData.floor === ""
    ) {
      delete requestData.floor;
    }
    if (
      requestData.block === null ||
      requestData.block === undefined ||
      requestData.block === ""
    ) {
      delete requestData.block;
    }
    //add rooom
    const room = new Room({
      ...requestData,
      property: user.property,
      createdBy: uid,
      updatedBy: uid,
      status: true,
      active: true,
      roomStatus: "available",
      qrCode: qrCodeLink,
    });

    //save address
    const writeResult = await room.save();
    let qrCodewithRoomId = await generateQrcode(
      `${process.env.GUEST_APP_URL}/welcome?location=${requestData.location}&roomNumber=${requestData.name}&roomId=${writeResult._id}&type=room`
    );
    await Room.findByIdAndUpdate(
      { _id: writeResult._id },
      { qrCode: qrCodewithRoomId }
    );
    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [writeResult.location],
        role: ["locationAdmin"],
        notificationText:
          user.fullName + " has created a new Room named " + writeResult.name,
        authToken: req.headers["eazyrooms-token"],
      });
    } catch (error) {
      console.log({ error });
    }

    //send response to client
    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
//create chatbot
router.post(
  "/",
  verifyToken,
  createRoomValidationSchema,
  validateRequest,
  createRoom
);

export default router;
