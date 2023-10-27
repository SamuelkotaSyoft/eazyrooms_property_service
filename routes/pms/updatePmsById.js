import express from "express";
import { matchedData } from "express-validator";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import pmsModel from "../../models/pmsModel.js";
import { updatePmsValidationSchema } from "../../validationSchema/pmsSchema.js";
import verifyToken from "../../helpers/verifyToken.js";
import User from "../../models/userModel.js";
const router = express.Router();

const updatePmsById = async (req, res) => {
  const requestData = matchedData(req);
  const pmsId = req.params.pmsId;
  const uid = req.user_info.main_uid;

  const role = req.user_info.role;
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
    const pms = await pmsModel.findByIdAndUpdate(
      { _id: pmsId },
      { ...requestData, updatedBy: user._id },
      {
        new: true,
      }
    );
    res.status(200).json({ status: true, data: pms });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
router.patch(
  "/:pmsId",
  verifyToken,
  updatePmsValidationSchema,
  validateRequest,
  updatePmsById
);
export default router;
