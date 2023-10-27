import { body } from "express-validator";
import amenityModel from "../../models/amenityModel.js";
import Location from "../../models/locationModel.js";
import mongoose from "mongoose";

const updateAmenityValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .optional()
    .exists()
    .withMessage("Name is required")
    .custom(async (name, { req }) => {
      const associatedLocation = await amenityModel.findOne({
        _id: new mongoose.Types.ObjectId(req.body.amenityId),
      });
      const isAmenityExisting = await amenityModel.findOne({
        _id: { $ne: new mongoose.Types.ObjectId(req.body.amenityId) },
        name: new RegExp("^" + name + "$", "i"),
        location: associatedLocation.location,
        status: true,
      });
      if (isAmenityExisting) {
        throw new Error("Amenity already exists");
      }
    }),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("Description is required"),
  body("location")
    .optional()
    .custom(async (locationId) => {
      const location = await Location.findOne({
        _id: locationId,
        status: true,
      });
      if (!location) {
        throw new Error("Location is required and should be a valid ObjectId");
      }
    }),
  body("active").optional().isBoolean(),
  body("status").optional().isBoolean(),
  body("paid")
    .optional()
    .notEmpty()
    .isBoolean()
    .withMessage("Paid is required"),
  body("finalPrice")
    .optional()
    .isNumeric()
    .withMessage("Final price is required"),
  body("amenityId")
    .notEmpty()
    .custom(async (amenityId) => {
      const amenity = await amenityModel.findOne({ _id: amenityId });
      if (!amenity) {
        throw new Error("AmenityId is required and should be active");
      }
    }),
];
export { updateAmenityValidationSchema };
