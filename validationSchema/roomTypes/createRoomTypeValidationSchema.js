import { body } from "express-validator";
import RoomType from "../../models/roomTypeModel.js";
import Location from "../../models/locationModel.js";
import taxModel from "../../models/taxModel.js";

const createRoomTypeValidationSchema = [
  body("location")
    .notEmpty()
    .custom(async (locationId) => {
      const location = await Location.findOne({
        _id: locationId,
        status: true,
      });
      if (!location) {
        throw new Error("location is required and should be a valid ObjectId");
      }
    }),
  body("amenities")
    .notEmpty()
    .isArray()
    .custom((amenities) => {
      if (amenities?.length === 0) {
        throw new Error("amenities is required");
      }
      return true;
    }),
  body("name")
    .ltrim()
    .rtrim()
    .custom(async (name, { req }) => {
      const isRoomTypeExists = await RoomType.findOne({
        name: new RegExp("^" + name + "$", "i"),
        location: req.body.location,
        status: true,
      });
      if (isRoomTypeExists) {
        throw new Error("Room type name already exists in location level");
      }
    }),
  body("description")
    .optional()
    .isString()
    .withMessage("Description is required "),
  body("baseOccupancy")
    .optional()
    .isNumeric()
    .withMessage("Base occupancy is required and should be a number"),
  body("kidsOccupancy")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Kids occupancy is optional and should be a number"),
  body("extraPricePerPerson")
    .optional()
    .isNumeric()
    .withMessage("Extra price per person is required and should be a number"),
  body("maxOccupancy")
    .optional()
    .isNumeric()
    .withMessage("Max occupancy is required and should be a number"),
  body("initialPrice")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Initial price is required and should be a number"),

  body("discount.discountType")
    .optional({ checkFalsy: true })
    .matches(/^(flat|percentage|nodiscount)$/i)
    .withMessage(
      "Discount type  should be either flat,No discount or percentage"
    )
    .toLowerCase()
    .isString()
    .withMessage(
      "Discount type is required and should be either flat ,No discount or percentage"
    ),
  body("discount.discountValue")
    .optional({ checkFalsy: true })
    .toFloat()
    .custom((discoutValue, { req }) => {
      const discountType = req.body["discount.discountType"]?.toLowerCase();
      if (
        discountType === "flat" &&
        Number(discoutValue) > Number(req.body?.initialPrice)
      ) {
        throw new Error("Discount value should be less than initialPrice");
      } else if (discountType === "percentage" && Number(discoutValue) > 100) {
        throw new Error("Discount value should be less than 100");
      }
      return true;
    })
    .isNumeric()
    .withMessage("discountValue is required"),
  body("tax").optional().isArray().withMessage("Tax is required"),
];

export { createRoomTypeValidationSchema };
