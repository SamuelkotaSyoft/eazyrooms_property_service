import { body } from "express-validator";
import Location from "../../models/locationModel.js";
import userModel from "../../models/userModel.js";

const updateLocationValidationSchema = [
  body("locationId")
    .notEmpty()
    .custom(async (locationId) => {
      const location = await Location.findOne({
        _id: locationId,
        status: true,
      });
      if (!location) {
        throw new Error(
          "locationId is required and should be a valid ObjectId"
        );
      }
    }),
  body("standarCheckInTime").optional(),
  body("standarCheckOutTime").optional(),
  body("name")
    .ltrim()
    .rtrim()
    .optional()
    .custom(async (name, { req }) => {
      const user = await userModel.findOne({ uid: req.user_info.main_uid });
      const location = await Location.findOne({
        name: new RegExp("^" + name + "$", "i"),
        _id: { $ne: req.body.locationId },
        property: user.property,
        status: true,
      });
      if (location) {
        throw new Error("name should be unique in location level");
      }
    }),
  body("address.addressLine1")
    .optional()
    .notEmpty()
    .withMessage("Address Line1 is required"),
  body("address.addressLine2")
    .optional({ values: "falsy" })
    .notEmpty()
    .withMessage("Address Line2 is required"),

  body("address.city").optional().notEmpty().withMessage("City is required"),
  body("address.state").optional().notEmpty().withMessage("State is required"),
  body("address.country")
    .optional()
    .notEmpty()
    .withMessage("Country is required"),
  body("address.postCode")
    .optional()
    .notEmpty()
    .withMessage("postCode is required"),
  body("locationType")
    .optional()
    .notEmpty()
    .withMessage("LocationType is required"),
  body("roomCount").optional().notEmpty().withMessage("Room count is required"),
  body("website").optional({ values: "falsy" }),
  body("currency").optional(),
];

export { updateLocationValidationSchema };
