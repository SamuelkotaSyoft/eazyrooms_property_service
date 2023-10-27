import { body } from "express-validator";
import userModel from "../../models/userModel.js";
import locationModel from "../../models/locationModel.js";

const createLocationValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .custom(async (name, { req }) => {
      const user = await userModel.findOne({ uid: req.user_info.main_uid });
      console.log({ user });
      const isExistingLocation = await locationModel.findOne({
        name: new RegExp("^" + name + "$", "i"),
        status: true,
        property: user.property,
      });
      if (isExistingLocation) {
        throw new Error("Location name should be unique");
      }
    })
    .notEmpty()
    .withMessage("Name is required"),
  body("address.addressLine1")
    .notEmpty()
    .withMessage("Address Line1 is required"),
  body("address.addressLine2").optional({ values: "falsy" }),

  body("address.city").notEmpty().withMessage("City is required"),
  body("address.state").notEmpty().withMessage("State is required"),
  body("address.country").notEmpty().withMessage("Country is required"),
  body("address.postCode").notEmpty().withMessage("postCode is required"),
  body("standarCheckInTime").optional(),
  body("standarCheckOutTime").optional(),
  body("locationType").notEmpty().withMessage("Location type is required"),
  body("roomCount").notEmpty().withMessage("Room count is required"),
  body("website")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Invalid website URL"),
  body("currency").notEmpty().withMessage("Invalid currency"),
];

export { createLocationValidationSchema };
