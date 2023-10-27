import { body } from "express-validator";
import Location from "../../models/locationModel.js";
import Block from "../../models/blockModel.js";

const createBlockValidationSchema = [
  body("location").custom(async (locationId) => {
    const location = await Location.findOne({
      _id: locationId,
      status: true,
    });
    console.log(location);
    if (!location) {
      return Promise.reject(
        "Location is required and should be a valid ObjectId"
      );
    }
  }),
  body("name")
    .ltrim()
    .rtrim()
    .isLength({ min: 1, max: 120 })
    .custom(async (name, { req }) => {
      console.log(req.body.location, name);
      const isBlockNameExistsInLocationLevel = await Block.findOne({
        location: req.body.location,
        name: new RegExp("^" + name + "$", "i"),
        status: true,
      });
      if (isBlockNameExistsInLocationLevel) {
        throw new Error("Block name already exists in location level");
      }
    }),
];
export { createBlockValidationSchema };
