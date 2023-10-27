import { body } from "express-validator";
import RoomType from "../../models/roomTypeModel.js";
import mongoose from "mongoose";

const updateRoomTypeValidationSchema = [
  body("roomTypeId").custom(async (roomTypeId) => {
    const roomType = await RoomType.findOne({
      _id: roomTypeId,
      status: true,
    });
    if (!roomType) {
      throw new Error("roomTypeId is required and should be a valid ObjectId");
    }
  }),
  body("active").optional().isBoolean(),
  body("property").optional().notEmpty().withMessage("Property is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("amenities")
    .optional()
    .notEmpty()
    .isArray()
    .withMessage("Amenities is required and must be an array"),
  body("name")
    .ltrim()
    .rtrim()
    .optional()
    .notEmpty()
    .custom(async (name, { req }) => {
      const associatedLocation = await RoomType.findOne({
        _id: new mongoose.Types.ObjectId(req.body.roomTypeId),
      });
      const isRoomTypeExists = await RoomType.findOne({
        name: new RegExp("^" + name + "$", "i"),
        _id: { $ne: req.body.roomTypeId },
        location: associatedLocation.location,
        status: true,
      });
      if (isRoomTypeExists) {
        throw new Error("Room type name already exists in location level");
      }
    })
    .isString()
    .withMessage("name is required"),
  body("description")
    .optional()
    .notEmpty()
    .isString()
    .withMessage("description is required "),
  body("baseOccupancy")
    .optional()
    .notEmpty()
    .isNumeric()
    .withMessage("Base occupancy is required and should be a number"),
  body("kidsOccupancy")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Kids occupancy is required and should be a number"),
  body("maxOccupancy")
    .optional()
    .notEmpty()
    .isNumeric()
    .withMessage("Max occupancy is required and should be a number"),
  body("initialPrice")
    .optional()
    .notEmpty()
    .isNumeric()
    .withMessage("Initial price is required and should be a number"),

  body("discount.discountType")
    .optional()
    .notEmpty()
    .toLowerCase()
    .matches(/^(flat|percentage|nodiscount)$/i)
    .withMessage(
      "Discount type  should be either flat, No discount or percentage"
    )
    .toLowerCase()
    .isString()
    .withMessage("Discount type is required "),
  body("discount.discountValue")
    .optional()
    .toFloat()
    .custom((discountValue, { req }) => {
      const discountType = req.body["discount.discountType"]?.toLowerCase();
      if (
        discountType === "flat" &&
        Number(discountValue) > Number(req.body?.initialPrice)
      ) {
        throw new Error("Discount value should be less than initialPrice");
      } else if (discountType === "percentage" && Number(discountValue) > 100) {
        throw new Error("Discount value should be less than 100");
      }
      return true;
    })
    .isNumeric()
    .withMessage("Discount value is required"),
  body("status")
    .optional()
    .isBoolean()
    .withMessage("Status is optional and should be boolean"),
  body("tax").optional().isArray().withMessage("Tax is required"),
];

export { updateRoomTypeValidationSchema };
