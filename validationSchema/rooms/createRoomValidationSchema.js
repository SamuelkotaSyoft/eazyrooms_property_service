import { body } from "express-validator";
import roomModel from "../../models/roomModel.js";
import floorModel from "../../models/floorModel.js";
const createRoomValidationSchema = [
  body("location").notEmpty().withMessage("Location is required"),
  body("floor")
    .optional({ values: "" })
    .custom(async (value, { req }) => {
      const block = req.body.block;
      const floor = req.body.floor;
      if (block !== "" && floor !== "") {
        const isValidFloor = await floorModel.findOne({
          location: req.body.location,
          _id: value,
          block: req.body.block,
        });
        if (!isValidFloor) {
          throw new Error("Floor Does not exist in this block");
        }
      }
    }),
  body("block").optional({ values: null | undefined | "" }),
  body("roomType").notEmpty().withMessage("Room type is required"),
  body("name")
    .ltrim()
    .rtrim()
    .custom(async (value, { req }) => {
      let optionalValues = {};
      optionalValues.location = req.body.location;
      optionalValues.floor = req.body.floor;
      optionalValues.block = req.body.block;
      if (
        optionalValues.location === null ||
        optionalValues.location === undefined ||
        optionalValues.location === ""
      ) {
        delete optionalValues.location;
      }
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
      const isExistingRoom = await roomModel.findOne({
        name: new RegExp("^" + value + "$", "i"),
        ...optionalValues,
        status: true,
      });
      if (isExistingRoom) {
        throw new Error("Room already exists");
      }
    }),
];
export { createRoomValidationSchema };
