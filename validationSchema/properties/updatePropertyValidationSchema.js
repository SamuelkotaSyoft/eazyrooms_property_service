import { body } from "express-validator";
import mongoose from "mongoose";
import Pms from "../../models/pmsModel.js";
import propertyModel from "../../models/propertyModel.js";

const updatePropertyValidationSchema = [
  body("propertyId").custom(async (propertyId) => {
    if (!mongoose.isValidObjectId(propertyId)) {
      throw new Error("Property should be a valid ObjectId");
    }
    const isPropertyExists = await propertyModel.findOne({ _id: propertyId });
    if (!isPropertyExists) {
      throw new Error("Property is required ");
    }
  }),
  body("name")
    .optional({ values: "falsy" })
    .ltrim()
    .rtrim()
    .notEmpty()
    .isLength({ min: 2, max: 120 })
    .withMessage(
      "Name should be atleast 2 characters length and should not exceed 120 characters"
    ),
  body("pms")
    .optional({ values: "falsy" })
    .custom(async (pmsId) => {
      const pms = await Pms.findOne({ _id: pmsId, status: true });
      if (!pms) {
        throw new Error("Pms is required and should be a valid ObjectId");
      }
    })
    .withMessage("Pms is required"),
  body("otherPms").optional(),
];

export { updatePropertyValidationSchema };
