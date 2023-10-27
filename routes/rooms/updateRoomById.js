import express, { request } from "express";
import { matchedData } from "express-validator";
import verifyToken from "../../helpers/verifyToken.js";
import User from "../../models/userModel.js";
var router = express.Router();

//import models
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import Room from "../../models/roomModel.js";
import { updateRoomValidationSchema } from "../../validationSchema/rooms/updateRoomValidationSchema.js";
import { generateQrcode } from "../../helpers/generateQrcode.js";
import notify from "../../helpers/notifications/notify.js";
import updateRelatedModels from "../../helpers/updates/updateRelatedModels.js";
async function updateRoomById(req, res) {
  console.log("hiwl");
  //request payload
  const uid = req.user_info.main_uid;
  const requestData = matchedData(req);
  const roomId = requestData.roomId;

  const role = req.user_info.role;
  if (
    requestData.floor === null ||
    requestData.floor === undefined ||
    requestData.floor === ""
  ) {
    requestData.floor = null;
  }
  if (
    requestData.block === null ||
    requestData.block === undefined ||
    requestData.block === ""
  ) {
    requestData.block = null;
  }
  //validate userId
  if (!uid) {
    res.status(400).json({ status: false, error: "userId is required" });
    return;
  }

  //validate quantity
  if (!roomId) {
    res.status(400).json({ status: false, error: "addressId is required" });
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

    //check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      res.status(400).json({ status: false, error: "Invalid room" });
    }
    let qrCodeLink = room.qrCode;
    if (requestData.name) {
      qrCodeLink = await generateQrcode(
        `${process.env.GUEST_APP_URL}/welcome?location=${room.location}&roomNumber=${requestData.name}&roomId=${roomId}&type=room`
      );
    }

    //update user
    const writeResult = await Room.findByIdAndUpdate(
      { _id: roomId },
      { ...requestData, qrCode: qrCodeLink },
      { new: true }
    );
    if (writeResult.status === false || writeResult.active === false) {
      await updateRelatedModels(
        { room: roomId },
        { status: writeResult.status, active: writeResult.active },
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
          user.fullName + " has updated a new Room named " + writeResult.name,
        authToken: req.headers["eazyrooms-token"],
      });
    } catch (error) {
      console.log(error);
    }

    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
//new buyer
router.patch(
  "/",
  verifyToken,
  updateRoomValidationSchema,
  validateRequest,
  updateRoomById
);

export default router;
