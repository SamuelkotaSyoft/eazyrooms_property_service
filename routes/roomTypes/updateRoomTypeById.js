import express from "express";
import { matchedData } from "express-validator";
import verifyToken from "../../helpers/verifyToken.js";
import User from "../../models/userModel.js";
var router = express.Router();
//import models
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import RoomType from "../../models/roomTypeModel.js";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import { updateRoomTypeValidationSchema } from "../../validationSchema/roomTypes/updateRoomTypeValidationSchema.js";
import notify from "../../helpers/notifications/notify.js";
import { calculateFinalPrice } from "../../helpers/calcuateFinalPrice.js";
import updateRelatedModels from "../../helpers/updates/updateRelatedModels.js";
// import roomModel from "../../models/roomModel.js";

async function updateRoomTypById(req, res) {
  //request payload
  const uid = req.user_info.main_uid;
  const requestData = matchedData(req);
  const roomTypeId = requestData.roomTypeId;

  const role = req.user_info.role;

  //validate userId
  if (!uid) {
    res.status(400).json({ status: false, error: "userId is required" });
    return;
  }

  //validate quantity
  if (!roomTypeId) {
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

    //check if roomType exists
    const roomType = await RoomType.findById(roomTypeId);
    // if (!roomType) {
    //   res.status(400).json({ status: false, error: "Invalid roomType" });
    // }

    let additonalCalculations = {
      finalPrice: 0,
    };

    if (requestData?.initialPrice) {
      additonalCalculations.finalPrice = await calculateFinalPrice(requestData);
    } else {
      delete additonalCalculations.finalPrice;
    }
    if (additonalCalculations?.finalPrice < 0) {
      res
        .status(400)
        .json({ status: false, error: [{ msg: "finalPrice is less than 0" }] });
    }
    //update roomtype
    const writeResult = await RoomType.findByIdAndUpdate(
      { _id: roomTypeId },
      {
        ...requestData,
        updatedBy: user?._id,
        ...additonalCalculations,
        ...(req.fileUrls?.length > 0 && { images: req.fileUrls }),
      },
      { new: true }
    );
    if (writeResult.status === false || writeResult.active === false) {
      await updateRelatedModels(
        { roomType: requestData.roomTypeId },
        { status: writeResult.status, active: writeResult.active },
        "roomType"
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
    console.log({ err });
    res.status(500).json({ error: err });
  }
}
//new buyer
router.patch(
  "/",
  verifyToken,
  uploadMulitpleImageToS3,
  updateRoomTypeValidationSchema,
  validateRequest,
  updateRoomTypById
);

export default router;
