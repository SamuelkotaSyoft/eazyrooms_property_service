import { body } from "express-validator";
import roomTypeModel from "../../models/roomTypeModel.js";
import roomModel from "../../models/roomModel.js";
import mongoose from "mongoose";
//TODO add validation inside te roomType
const updateRoomValidationSchema = [
  body("roomId").notEmpty().withMessage("RoomId is required"),
  body("active").optional().isBoolean(),
  body("location").optional().notEmpty().withMessage("Location is required"),
  body("floor").optional({ values: null | undefined | "" }),
  body("block").optional({ values: null | undefined | "" }),
  body("name")
    .ltrim()
    .rtrim()
    .optional()
    .notEmpty()
    .withMessage("Name is a required field")
    .custom(async (name, { req }) => {
      let optionalValues = {};
      optionalValues.floor = req.body.floor;
      optionalValues.block = req.body.block;
      if (
        optionalValues.floor === null ||
        optionalValues.floor === undefined ||
        optionalValues.floor === ""
      ) {
        optionalValues.floor = null;
      }
      if (
        optionalValues.block === null ||
        optionalValues.block === undefined ||
        optionalValues.block === ""
      ) {
        optionalValues.block = null;
      }
      const associatedLocation = await roomModel.findOne({
        _id: new mongoose.Types.ObjectId(req.body.roomId),
      });

      const isExistingRoom = await roomModel.findOne({
        name: new RegExp("^" + name + "$", "i"),
        _id: { $ne: req.body.roomId },
        ...optionalValues,
        location: associatedLocation.location,
        status: true,
      });
      console.log({ isExistingRoom });
      if (isExistingRoom) {
        throw new Error("Room already exists");
      }
    }),
  body("roomType")
    .optional({ checkFalsy: true })
    .custom(async (roomTypeId) => {
      const isValidRoomTYpeId = await roomTypeModel.findOne({
        _id: roomTypeId,
        status: true,
      });
      if (!isValidRoomTYpeId) {
        throw new Error("RoomType does not exist");
      }
    }),
  body("roomStatus")
    .optional()
    .notEmpty()
    .matches(/^(available|occupied|maintenance|outofservice)$/i)
    .withMessage(
      "Room status is required and should be any of available, occupied, maintenance, outofservice"
    ),
];
export { updateRoomValidationSchema };
