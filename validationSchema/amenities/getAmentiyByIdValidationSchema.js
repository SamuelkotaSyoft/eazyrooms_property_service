import { param, query } from "express-validator";
import Location from "../../models/locationModel.js";
import amenity from "../../models/amenityModel.js";

const getAmentiyByIdValidationSchema = [
  param("amenityId")
    .notEmpty()
    .custom(async (amenityId) => {
      const amentity = await amenity.findOne({ _id: amenityId });
      if (!amentity) {
        throw new Error("amenityId is required and should be active");
      }
    }),
];

export { getAmentiyByIdValidationSchema };
