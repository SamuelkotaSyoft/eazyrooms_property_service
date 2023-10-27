import express from "express";
import { matchedData } from "express-validator";
import verifyToken from "../../helpers/verifyToken.js";
import User from "../../models/userModel.js";
var router = express.Router();
//import models
import Floor from "../../models/floorModel.js";
import { updateFloorValidationSchema } from "../../validationSchema/floors/updateFloorValidationSchema.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import notify from "../../helpers/notifications/notify.js";
import updateRelatedModels from "../../helpers/updates/updateRelatedModels.js";

//
async function updateFloor(req, res) {
  //request payload
  const uid = req.user_info.main_uid;
  const requestData = matchedData(req);
  const floorId = requestData.floorId;
  const role = req.user_info.role;
  //validate quantity
  if (
    requestData.block === null ||
    requestData.block === undefined ||
    requestData.block === ""
  ) {
    delete requestData.block;
  }
  try {
    if (role !== "propertyAdmin" && role !== "locationAdmin") {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    //check if user exists
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res.status(400).json({ error: [{ msg: "Invalid userId" }] });
      return;
    }

    //check if floor exists
    const floor = await Floor.findById(floorId);
    if (!floor) {
      res.status(400).json({ error: [{ msg: "Invalid floorId" }] });
      return;
    }

    //update user
    const writeResult = await Floor.findByIdAndUpdate(
      { _id: floorId },
      { ...requestData, updatedBy: user._id },
      { new: true }
    );
    if (writeResult.status === false || writeResult.active === false)
      await updateRelatedModels(
        { floor: floorId },
        { status: writeResult.status, active: writeResult.active },
        "floor"
      );

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [writeResult.location],
        role: ["locationAdmin"],
        notificationText:
          user.fullName + " has updated a new Floor named " + writeResult.name,
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
  updateFloorValidationSchema,
  validateRequest,
  updateFloor
);

export default router;
