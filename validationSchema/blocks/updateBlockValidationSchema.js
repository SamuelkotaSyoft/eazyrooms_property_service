import { body, param } from "express-validator";
import mongoose from "mongoose";
import Location from "../../models/locationModel.js";
import Property from "../../models/propertyModel.js";
import Block from "../../models/blockModel.js";

const updateBlockValidationSchema = [
  body("blockId").notEmpty().withMessage("blockId is required"),
  body("active").optional().isBoolean(),
  body("property")
    .optional()
    .notEmpty()
    .custom(async (propertyId) => {
      const property = await Property.findOne({
        _id: propertyId,
        status: true,
      });
      if (!property) {
        return Promise.reject(
          "property is required and should be a valid ObjectId"
        );
      }
    })
    .custom((locationId) => mongoose.Types.ObjectId.isValid(locationId)),
  body("location")
    .optional()
    .notEmpty()
    .custom(async (locationId) => {
      const location = await Location.findOne({
        _id: locationId,
        status: true,
      });
      if (!location) {
        return Promise.reject(
          "Location is required and should be a valid ObjectId"
        );
      }
    }),
  body("name")
    .ltrim()
    .rtrim()
    .optional()
    .notEmpty()
    .custom(async (name, { req }) => {
      const associatedLocation = await Block.findOne({
        _id: new mongoose.Types.ObjectId(req.body.blockId),
      });
      const isBlockNameExistsInLocationLevel = await Block.findOne({
        _id: { $ne: new mongoose.Types.ObjectId(req.body.blockId) },
        location: associatedLocation?.location,
        name: new RegExp("^" + name + "$", "i"),
        status: true,
      });
      if (isBlockNameExistsInLocationLevel) {
        throw new Error("Block name already exists in location level");
      }
    }),
  body("status").optional().isBoolean(),
];
export { updateBlockValidationSchema };
