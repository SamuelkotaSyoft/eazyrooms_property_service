import { body } from "express-validator";
import Pms from "../../models/pmsModel.js";

const createPropertyValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .notEmpty()
    .isLength({ min: 2, max: 120 })
    .withMessage(
      "Name should be atleast 2 characters length and should not exceed 120 characters"
    ),
  body("pms")
    .optional()
    .custom(async (pmsId) => {
      const pms = await Pms.findOne({ _id: pmsId, status: true });
      if (!pms) {
        throw new Error("Pms is required and should be a valid ObjectId");
      }
    })
    .withMessage("Pms is required"),
  body("otherPms").optional(),
];

export { createPropertyValidationSchema };
