import { body } from "express-validator";
import mongoose from "mongoose";
import Location from "../../models/locationModel.js";
import amenityModel from "../../models/amenityModel.js";
//TODO name validation issues
const createAmenityValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .custom(async (value, { req }) => {
      const isExistingAmenity = await amenityModel.findOne({
        name: new RegExp("^" + value + "$", "i"),
        location: req.body.location,
        status: true,
      });
      if (isExistingAmenity) {
        throw new Error("Amenity already exists");
      }
    }),
  body("description").notEmpty().withMessage("Description is required"),
  body("location").custom(async (locationId) => {
    const location = await Location.findOne({
      _id: locationId,
      status: true,
    });
    console.log(location);
    if (!location) {
      throw new Error("Location is required and should be a valid ObjectId");
    }
  }),
  body("paid").notEmpty().isBoolean().withMessage("Paid is required"),
  // body("finalPrice").optional(),
];
export { createAmenityValidationSchema };
