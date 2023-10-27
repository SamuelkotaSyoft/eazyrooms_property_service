import express from "express";
import { matchedData } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import verifyToken from "../../helpers/verifyToken.js";
import pmsModel from "../../models/pmsModel.js";
import { createPmsValidationSchema } from "../../validationSchema/pmsSchema.js";
const router = express.Router();
const uuid = uuidv4();

const createPms = async (req, res) => {
  const name = matchedData(req).name;
  const role = req.user_info.role;

  if (role !== "propertyAdmin" && role !== "locationAdmin") {
    res.status(403).json({ status: false, error: "Unauthorized" });
    return;
  }

  const pms = await new pmsModel({
    name: name,
    status: true,
  });
  const writableResult = await pms.save();
  res.status(200).json({ status: true, data: writableResult });
};

router.post(
  "/",
  verifyToken,
  createPmsValidationSchema,
  validateRequest,
  createPms
);
export default router;
