import { param, query } from "express-validator";
import Location from "../../models/locationModel.js";

const getAllBlockValidationSchema = [
  param("location")
    .notEmpty()
    .custom(async (locationId) => {
      console.log(locationId);
      const location = await Location.findOne({ _id: locationId });
      console.log(location);
      if (!location) {
        throw new Error("location is required and should be a valid ObjectId");
      }
    }),
];

export { getAllBlockValidationSchema };
